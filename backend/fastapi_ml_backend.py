import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import httpx
from datetime import datetime
import numpy as np
import json
import os
import subprocess
import sys

# --- PATH CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "deployed_flood_model.joblib")
JSON_OUTPUT_PATH = os.path.join(BASE_DIR, "..", "data", "latest_predictions.json")

app = FastAPI(title="Flood Forecast ML API", description="AI Backend for 3MTT Capstone")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    print(f"Loading Machine Learning Model from: {MODEL_PATH}")
    model_package = joblib.load(MODEL_PATH)
    model = model_package.get('model', model_package)
    feature_cols = model_package.get('features', None)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Warning: Could not load model. Error: {e}")
    model = None


# --- NEW: BACKGROUND TASK TRIGGER WITH UNBUFFERED LOGS ---
@app.get("/trigger-batch-update")
async def trigger_batch_update(background_tasks: BackgroundTasks, key: str = ""):
    if key != "3mtt-capstone-secure-key":
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    def run_worker():
        print("Starting background batch worker via API trigger...", flush=True)
        script_path = os.path.join(BASE_DIR, "batch_update_worker.py")
        
        # The "-u" flag tells Python not to buffer the output, pushing it instantly to Render logs
        # We also pipe stdout and stderr directly to the FastAPI server's console
        subprocess.run(["python", "-u", script_path], stdout=sys.stdout, stderr=sys.stderr)
        
        print("Background batch worker finished and updated the JSON!", flush=True)
        
    background_tasks.add_task(run_worker)
    return {"status": "success", "message": "Batch update triggered successfully in the background. It will finish in ~15 minutes."}


@app.get("/bulk-forecasts")
async def get_bulk_forecasts():
    if not os.path.exists(JSON_OUTPUT_PATH):
        return {"last_updated": None, "total_locations": 0, "predictions": {}}
        
    with open(JSON_OUTPUT_PATH, "r") as f:
        data = json.load(f)
    return data

class PredictRequest(BaseModel):
    lat: float
    lon: float
    Elevation_m: float 
    Distance_to_River_m: float
    Is_Urban: int
    RP: float = 1.0 

async def fetch_and_calculate_weather(lat: float, lon: float, is_urban: int, river_dist: float, frontend_elev: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "past_days": 30,
        "forecast_days": 2, 
        "daily": ["precipitation_sum", "soil_moisture_0_to_7cm_mean"],
        "timezone": "Africa/Lagos"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10.0)
    
    if response.status_code != 200: raise ValueError(f"API Error: {response.text}")
    res = response.json()
    
    true_elevation = res.get('elevation', frontend_elev)
    if true_elevation == 0.0 or true_elevation is None: true_elevation = 45.0 
        
    daily_rain = [x if x is not None else 0.0 for x in res['daily']['precipitation_sum']]
    daily_soil = [x if x is not None else 0.0 for x in res['daily']['soil_moisture_0_to_7cm_mean']]
    
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

def generate_human_insights(input_data, is_at_risk):
    insights = []
    rain = input_data.get('Past_7D_Rainfall_mm', 0)
    soil = input_data.get('Past_7D_Soil_Moisture', 0)
    river_dist = input_data.get('Distance_to_River_m', 1000)
    is_urban = input_data.get('Is_Urban', 0)

    if is_at_risk:
        if rain > 50: insights.append(f"Severe active rainfall ({round(rain)}mm) is heavily overloading drainage capacity.")
        elif rain > 25: insights.append(f"Moderate active rainfall ({round(rain)}mm) is contributing to rising water levels.")
        if soil > 0.60: insights.append(f"High soil saturation ({round(soil*100)}%) is limiting the ground's ability to absorb new rain.")
        if river_dist < 1000: insights.append(f"Proximity to the river ({round(river_dist)}m) poses a potential overflow threat.")
        if is_urban == 1 and rain > 15: insights.append("Concrete urban surfaces are preventing natural water absorption, increasing runoff risk.")
    else:
        if rain < 20: insights.append(f"Low active rainfall ({round(rain)}mm) is keeping river and drainage levels stable.")
        if soil < 0.50: insights.append(f"Healthy soil capacity ({round(soil*100)}%) means the ground can safely absorb upcoming rain.")
        if river_dist > 1000: insights.append(f"The community is safely situated far away from major river overflow zones.")

    if not insights:
        if is_at_risk: insights.append("A complex combination of moderate rainfall, soil saturation, and local terrain is elevating the overall flood probability.")
        else: insights.append("Environmental metrics are currently stable and within historical safety baselines.")
    return insights[:3]

@app.post("/predict")
async def predict_flood_risk(data: PredictRequest):
    if model is None: raise HTTPException(status_code=500, detail="ML Model not loaded on server.")

    try:
        weather_features = await fetch_and_calculate_weather(
            lat=data.lat, lon=data.lon, is_urban=data.Is_Urban, 
            river_dist=data.Distance_to_River_m, frontend_elev=data.Elevation_m
        )
        
        input_data = {
            'Distance_to_River_m': data.Distance_to_River_m, 'Is_Urban': data.Is_Urban,
            'RP': data.RP, 'AEP': 1.0 / data.RP if data.RP > 0 else 0.2
        }
        input_data.update(weather_features)

        df = pd.DataFrame([input_data])
        if feature_cols:
            for col in feature_cols:
                if col not in df.columns: df[col] = 0.0
            X_input = df[feature_cols]
        else:
            X_input = df.drop(columns=['Elevation_m', 'True_Elevation'], errors='ignore')

        prob = float(model.predict_proba(X_input)[0][1])
        is_at_risk = prob >= 0.50
        
        if prob >= 0.75: tier = "EVACUATION WARNING"
        elif prob >= 0.50: tier = "FLOOD WATCH"
        else: tier = "SAFE"

        insights = generate_human_insights(input_data, is_at_risk)

        return {
            "status": "AT RISK" if is_at_risk else "SAFE", "tier": tier,
            "probability_percent": round(prob * 100, 1), "risk_level": 1 if is_at_risk else 0,
            "weather": {
                "rainfall_7d": round(weather_features['Past_7D_Rainfall_mm'], 1),
                "soil_moisture_7d": round(weather_features['Past_7D_Soil_Moisture'] * 100, 1),
                "runoff_potential": round(weather_features['Runoff_Potential'], 1),
                "elevation": round(weather_features['True_Elevation'], 1)
            },
            "explanation": insights
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("fastapi_ml_backend:app", host="127.0.0.1", port=8000, reload=True)