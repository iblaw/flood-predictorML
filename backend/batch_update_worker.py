import os
import time
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
import numpy as np
import pandas as pd
import httpx
import joblib
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

print("[INFO] Initializing Batch Flood Prediction Processor...")

# Configure paths and database clients
BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH: str = os.path.join(BASE_DIR, "..", "models", "deployed_flood_model.joblib")
CSV_PATH: str = os.path.join(BASE_DIR, "..", "data", "master_lga_static_lookup.csv")

SUPABASE_URL: Optional[str] = os.environ.get("SUPABASE_URL")
SUPABASE_KEY: Optional[str] = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[FATAL] Supabase credentials missing. Terminating process.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load machine learning model and dataset
try:
    model_package = joblib.load(MODEL_PATH)
    model = model_package.get('model', model_package)
    feature_cols = model_package.get('features', None)
except Exception as e:
    print(f"[FATAL] Failed to load model artifact: {e}")
    exit(1)

try:
    df_lgas = pd.read_csv(CSV_PATH)
    print(f"[INFO] Loaded {len(df_lgas)} spatial records for processing.")
except Exception as e:
    print(f"[FATAL] Failed to load spatial dataset: {e}")
    exit(1)


async def fetch_weather_for_lga(client: httpx.AsyncClient, lat: float, lon: float, max_retries: int = 2) -> Optional[Dict[str, Any]]:
    """ Fetches historical and forecast weather telemetry with exponential backoff. """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "past_days": 30,
        "forecast_days": 2, 
        "daily": ["precipitation_sum", "soil_moisture_0_to_7cm_mean"],
        "timezone": "Africa/Lagos"
    }
    
    for attempt in range(max_retries):
        try:
            response = await client.get(url, params=params, timeout=10.0)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                print("[WARN] Upstream API rate limit exceeded. Reverting to fallback.")
                return None
            else:
                await asyncio.sleep(1.0)
                
        except Exception:
            await asyncio.sleep(1.0)
            
    return None


def calculate_physics(weather_data: Dict[str, Any], is_urban: int, river_dist: float, frontend_elev: float) -> Dict[str, float]:
    """ Engineers hydrological physics features from raw meteorological telemetry. """
    true_elevation = weather_data.get('elevation', frontend_elev)
    if not true_elevation: 
        true_elevation = 45.0 
        
    daily_rain = [x if x is not None else 0.0 for x in weather_data['daily']['precipitation_sum']]
    daily_soil = [x if x is not None else 0.0 for x in weather_data['daily']['soil_moisture_0_to_7cm_mean']]
    
    p3 = sum(daily_rain[-4:-1])
    p7 = sum(daily_rain[-8:-1]) 
    p14 = sum(daily_rain[-15:-1])
    p30 = sum(daily_rain[-31:-1])
    
    soil7 = sum(daily_soil[-8:-1]) / 7.0 if len(daily_soil) >= 8 else 0.35
    recent_soil = sum(daily_soil[-4:-1]) / 3.0
    prior_soil = sum(daily_soil[-8:-4]) / 4.0 if len(daily_soil) >= 8 else recent_soil
    soil_vel = recent_soil - prior_soil
    
    loc_mean = np.mean(daily_rain) if daily_rain else 0.0
    loc_std = np.std(daily_rain) if daily_rain and np.std(daily_rain) > 0 else 1.0
    rain_z = (p30 - (loc_mean * 30)) / (loc_std * np.sqrt(30))
    
    runoff = p3 * (is_urban + 0.5) * (soil7 + 0.1)
    max_elev = max(200.0, true_elevation + 50.0)
    basin_risk = (max_elev - true_elevation) / (river_dist + 10.0)
    
    return {
        'True_Elevation': true_elevation, 'Past_3D_Rainfall_mm': p3,
        'Past_7D_Rainfall_mm': p7, 'Past_14D_Rainfall_mm': p14,
        'Past_30D_Rainfall_mm': p30, 'Past_7D_Soil_Moisture': soil7,
        'Soil_Moisture_Velocity': soil_vel, 'Rainfall_Anomaly_Z': rain_z,
        'Runoff_Potential': runoff, 'Basin_Accumulation_Risk': basin_risk
    }


def generate_human_insights(input_data: Dict[str, Any], is_at_risk: bool) -> List[str]:
    """ Generates diagnostic natural language insights for UI consumption. """
    insights: List[str] = []
    rain = input_data.get('Past_7D_Rainfall_mm', 0)
    soil = input_data.get('Past_7D_Soil_Moisture', 0)
    river_dist = input_data.get('Distance_to_River_m', 1000)
    is_urban = input_data.get('Is_Urban', 0)

    if is_at_risk:
        if rain > 35: insights.append(f"Severe active rainfall ({round(rain)}mm) is heavily overloading drainage capacity.")
        elif rain > 15: insights.append(f"Moderate active rainfall ({round(rain)}mm) is contributing to rising water levels.")
        if soil > 0.55: insights.append(f"High soil saturation ({round(soil*100)}%) is limiting the ground's ability to absorb new rain.")
        if river_dist < 1000: insights.append(f"Proximity to the river ({round(river_dist)}m) poses a potential overflow threat.")
        if is_urban == 1 and rain > 10: insights.append("Concrete urban surfaces are preventing natural water absorption, increasing runoff risk.")
    else:
        if rain < 40: insights.append(f"Low active rainfall ({round(rain)}mm) is keeping river and drainage levels stable.")
        if soil < 0.65: insights.append(f"Healthy soil capacity ({round(soil*100)}%) indicates safe absorption parameters.")
        if river_dist > 1000: insights.append(f"Community distance from major river networks minimizes overflow threat.")

    if not insights:
        if is_at_risk: insights.append("Complex interactions between moderate rainfall, soil saturation, and local terrain elevate flood probability.")
        else: insights.append("Environmental metrics are currently stable and within historical safety baselines.")
        
    return insights[:3]


async def process_all_lgas() -> None:
    """ Executes sequential processing of all geographical entities and updates remote database. """
    db_rows: List[Dict[str, Any]] = []
    timestamp: str = datetime.now().isoformat()
    
    async with httpx.AsyncClient() as client:
        for index, row in df_lgas.iterrows():
            lga_name = row['ADM2_NAME']
            lat = row['Latitude']
            lon = row['Longitude']
            is_urban = row.get('Is_Urban', 0)
            river_dist = row.get('Distance_to_River_m', 5000)
            fallback_elev = row.get('Elevation_m', 45)
            
            print(f"[INFO] Processing sector {index + 1}/{len(df_lgas)}: {lga_name}")
            
            weather_data = await fetch_weather_for_lga(client, lat, lon)
            await asyncio.sleep(1.0)
            
            if weather_data:
                weather_features = calculate_physics(weather_data, is_urban, river_dist, fallback_elev)
            else:
                print(f"[WARN] Utilizing baseline metrics for {lga_name}.")
                weather_features = {
                    'True_Elevation': fallback_elev,
                    'Past_3D_Rainfall_mm': 12.0,
                    'Past_7D_Rainfall_mm': 28.0,
                    'Past_14D_Rainfall_mm': 55.0,
                    'Past_30D_Rainfall_mm': 110.0,
                    'Past_7D_Soil_Moisture': 0.38,
                    'Soil_Moisture_Velocity': 0.01,
                    'Rainfall_Anomaly_Z': 0.1,
                    'Runoff_Potential': 12.0 * (is_urban + 0.5) * (0.38 + 0.1),
                    'Basin_Accumulation_Risk': (max(200.0, fallback_elev + 50.0) - fallback_elev) / (river_dist + 10.0)
                }
            
            input_data = {
                'Distance_to_River_m': river_dist,
                'Is_Urban': is_urban,
                'RP': row.get('RP', 5.0),
                'AEP': 1.0 / row.get('RP', 5.0) if row.get('RP', 5.0) > 0 else 0.2
            }
            input_data.update(weather_features)
            
            df_input = pd.DataFrame([input_data])
            if feature_cols:
                for col in feature_cols:
                    if col not in df_input.columns: df_input[col] = 0.0
                X_input = df_input[feature_cols]
            else:
                X_input = df_input.drop(columns=['Elevation_m', 'True_Elevation'], errors='ignore')

            prob = float(model.predict_proba(X_input)[0][1])
            is_at_risk = prob >= 0.50
            
            tier = "HIGH RISK" if prob >= 0.75 else "MODERATE RISK" if is_at_risk else "SAFE"
            explanation = generate_human_insights(input_data, is_at_risk)
            
            db_rows.append({
                "lga_name": lga_name,
                "status": "AT RISK" if is_at_risk else "SAFE",
                "tier": tier,
                "probability_percent": round(prob * 100, 1),
                "rainfall_7d": round(weather_features['Past_7D_Rainfall_mm'], 1),
                "soil_moisture_7d": round(weather_features['Past_7D_Soil_Moisture'] * 100, 1),
                "elevation": round(weather_features['True_Elevation'], 1),
                "explanation": explanation,
                "raw_inputs": input_data,
                "last_updated": timestamp
            })

    if db_rows:
        print(f"[INFO] Executing database chunked upsert for {len(db_rows)} records...")
        try:
            chunk_size = 200
            for i in range(0, len(db_rows), chunk_size):
                chunk = db_rows[i:i + chunk_size]
                if chunk:
                    supabase.table("flood_predictions").upsert(chunk).execute()
            print(f"[INFO] Batch sequence finalized. Data secured at {timestamp}")
        except Exception as e:
             print(f"[ERROR] Database persistence failed: {e}")
    else:
        print("[WARN] No valid records generated. Terminating database operations.")

if __name__ == "__main__":
    asyncio.run(process_all_lgas())