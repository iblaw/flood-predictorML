import requests
import json

def test_abuja():
    url = "http://127.0.0.1:8000/predict"
    # Abuja (FCT) coordinates and urban parameters
    payload = {
        "lat": 9.0579,
        "lon": 7.4951,
        "Elevation_m": 502.0,
        "Distance_to_River_m": 2500.0,  # Pluvial/urban flash flood profile (far from major rivers)
        "Is_Urban": 1,                 # Concrete urban surface preventing natural absorption
        "RP": 10.0
    }
    
    print("Sending live telemetry request for Abuja to FastAPI backend...")
    try:
        response = requests.post(url, json=payload, timeout=15)
        if response.status_code == 200:
            data = response.json()
            print("\n--- ABUJA RETROSPECTIVE TEST RESULTS ---")
            print(f"Status: {data.get('status')}")
            print(f"Tier: {data.get('tier')}")
            print(f"Probability: {data.get('probability_percent')}%")
            print(f"Weather Telemetry: {json.dumps(data.get('weather'), indent=2)}")
            print(f"XAI Insights:")
            for insight in data.get('explanation', []):
                print(f" - {insight}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")

if __name__ == "__main__":
    test_abuja()