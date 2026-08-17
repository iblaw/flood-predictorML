import pandas as pd
import httpx
import asyncio
import joblib
import json
import time
from datetime import datetime, timedelta
import numpy as np
import os

print("--- Starting Daily Flood Prediction Batch Processor ---")

# --- PATH CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "deployed_flood_model.joblib")
CSV_PATH = os.path.join(BASE_DIR, "..", "data", "master_lga_static_lookup.csv")
JSON_OUTPUT_PATH = os.path.join(BASE_DIR, "..", "data", "latest_predictions.json")

# 1. Load the Model
try:
    print(f"Loading Machine Learning Model from: {MODEL_PATH}")
    model_package = joblib.load(MODEL_PATH)
    model = model_package.get('model', model_package)
    feature_cols = model_package.get('features', None)
    print("Model loaded successfully!")
except Exception as e:
    print(f"CRITICAL ERROR: Could not load model. {e}")
    exit()

# 2. Load the Static LGA Database
try:
    print(f"Loading LGA database from: {CSV_PATH}")
    df_lgas = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df_lgas)} LGAs for processing.")
except Exception as e:
    print(f"CRITICAL ERROR: Could not load LGA database. {e}")
    exit()

async def fetch_weather_for_lga(client, lat, lon):
    """Fetches weather data for a single LGA."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "past_days": 30,
        "forecast_days": 2, 
        "daily": ["precipitation_sum", "soil_moisture_0_to_7cm_mean"],
        "timezone": "Africa/Lagos"
    }
    
    response = await client.get(url, params=params, timeout=15.0)
    if response.status_code != 200:
        return None
    return response.json()

def calculate_physics(weather_data, is_urban, river_dist, frontend_elev):
    """Replicates your exact ML physics feature engineering."""
    true_elevation = weather_data.get('elevation', frontend_elev)
    if true_elevation == 0.0 or true_elevation is None: true_elevation = 45.0 
        
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
        'True_Elevation': true_elevation,
        'Past_3D_Rainfall_mm': p3,
        'Past_7D_Rainfall_mm': p7,
        'Past_14D_Rainfall_mm': p14,
        'Past_30D_Rainfall_mm': p30,
        'Past_7D_Soil_Moisture': soil7,
        'Soil_Moisture_Velocity': soil_vel,
        'Rainfall_Anomaly_Z': rain_z,
        'Runoff_Potential': runoff,
        'Basin_Accumulation_Risk': basin_risk
    }

def generate_human_insights(input_data, is_at_risk):
    insights = []
    rain = input_data.get('Past_7D_Rainfall_mm', 0)
    soil = input_data.get('Past_7D_Soil_Moisture', 0)
    river_dist = input_data.get('Distance_to_River_m', 1000)
    is_urban = input_data.get('Is_Urban', 0)
    elevation = input_data.get('True_Elevation', 45)

    if is_at_risk:
        if rain > 35: insights.append(f"Severe active rainfall ({round(rain)}mm) is heavily overloading drainage capacity.")
        elif rain > 15: insights.append(f"Moderate active rainfall ({round(rain)}mm) is contributing to rising water levels.")
        if soil > 0.55: insights.append(f"High soil saturation ({round(soil*100)}%) is limiting the ground's ability to absorb new rain.")
        if river_dist < 1000: insights.append(f"Proximity to the river ({round(river_dist)}m) poses a potential overflow threat.")
        if is_urban == 1 and rain > 10: insights.append("Concrete urban surfaces are preventing natural water absorption, increasing runoff risk.")
    else:
        if rain < 40: insights.append(f"Low active rainfall ({round(rain)}mm) is keeping river and drainage levels stable.")
        if soil < 0.65: insights.append(f"Healthy soil capacity ({round(soil*100)}%) means the ground can safely absorb upcoming rain.")
        if river_dist > 1000: insights.append(f"The community is safely situated far away from major river overflow zones.")

    if not insights:
        if is_at_risk: insights.append("A complex combination of moderate rainfall, soil saturation, and local terrain is elevating the overall flood probability.")
        else: insights.append("Environmental metrics are currently stable and within historical safety baselines.")
    return insights[:3]

async def process_all_lgas():
    results = {}
    timestamp = datetime.now().isoformat()
    
    async with httpx.AsyncClient() as client:
        for index, row in df_lgas.iterrows():
            lga_name = row['ADM2_NAME']
            lat = row['Latitude']
            lon = row['Longitude']
            
            print(f"[{index + 1}/{len(df_lgas)}] Processing {lga_name}...")
            
            # Fetch weather
            weather_data = await fetch_weather_for_lga(client, lat, lon)
            if not weather_data:
                print(f"  -> Failed to fetch weather for {lga_name}")
                continue
                
            # Calculate features
            weather_features = calculate_physics(
                weather_data, row.get('Is_Urban', 0), row.get('Distance_to_River_m', 5000), row.get('Elevation_m', 45)
            )
            
            # Combine for model
            input_data = {
                'Distance_to_River_m': row.get('Distance_to_River_m', 5000),
                'Is_Urban': row.get('Is_Urban', 0),
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

            # Predict
            prob = float(model.predict_proba(X_input)[0][1])
            is_at_risk = prob >= 0.50
            
            if prob >= 0.75: tier = "EVACUATION WARNING"
            elif prob >= 0.50: tier = "FLOOD WATCH"
            else: tier = "SAFE"
            
            # Generate XAI explanation array
            explanation = generate_human_insights(input_data, is_at_risk)
            
            # Save to dictionary
            results[lga_name] = {
                "status": "AT RISK" if is_at_risk else "SAFE",
                "tier": tier,
                "probability_percent": round(prob * 100, 1),
                "weather": {
                    "rainfall_7d": round(weather_features['Past_7D_Rainfall_mm'], 1),
                    "soil_moisture_7d": round(weather_features['Past_7D_Soil_Moisture'] * 100, 1),
                    "elevation": round(weather_features['True_Elevation'], 1)
                },
                "explanation": explanation,
                "raw_inputs": input_data 
            }
            
            # Polite API pause
            await asyncio.sleep(1.0)

    # Save the master JSON file inside data/
    output_data = {
        "last_updated": timestamp,
        "total_locations": len(results),
        "predictions": results
    }
    
    os.makedirs(os.path.dirname(JSON_OUTPUT_PATH), exist_ok=True)
    with open(JSON_OUTPUT_PATH, "w") as f:
        json.dump(output_data, f, indent=4)
        
    print(f"\n--- Batch Complete! Saved to {JSON_OUTPUT_PATH} at {timestamp} ---")

if __name__ == "__main__":
    asyncio.run(process_all_lgas())