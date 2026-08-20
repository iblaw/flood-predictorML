🌊 Flood Forecast ML

An AI-powered early warning system leveraging geospatial telemetry and machine learning to preemptively predict flood risks across vulnerable Nigerian communities.

Built as a capstone project for the 3MTT (3 Million Technical Talent) NextGen Cohort (AI/ML Track).

👨‍💻 Meet the Fellow

Name: Lawal Ibrahim

Track: Artificial Intelligence / Machine Learning

3MTT Fellow ID: FE/26/5038794255

Live Demo: [https://flood-forecast-ml.vercel.app/]

Demo Video: [Insert YouTube Link Here]

🎯 The Problem & Solution

Nigeria's annual flood crises along the Niger-Benue river basins lead to catastrophic displacement and agricultural loss. Traditional reaction frameworks lack spatial precision.

Flood Forecast ML is an automated, machine learning-driven early warning system aligned with NIHSA and NEMA standards. It shifts disaster management from reactive to preemptive by analyzing live meteorological data, topographical features, and soil saturation to predict flooding before it happens.

🧠 Machine Learning Architecture

Our model does not just look at rain; it understands hydrology.

Target Variable: Trained on historical satellite water fraction data (FloodScan SFED).

Feature Engineering: Computes complex physical interactions including:

Runoff Potential (Rainfall × Urbanization × Soil Saturation)

Basin Accumulation Risk (Elevation drop relative to river proximity)

Soil Moisture Velocity

The Model: A Soft Voting Ensemble combining the high-recall capabilities of Random Forest with the precision of XGBoost.

Explainable AI (XAI): The backend dynamically generates human-readable insights (e.g., "High soil saturation (88%) is limiting the ground's ability to absorb new rain"), preventing the "black box" AI problem.

🏗️ System Architecture

The application uses a highly scalable, decoupled Backend-for-Frontend (BFF) architecture to ensure instant page loads.

Nightly Batch Worker (Cron Job): A Python worker wakes up daily, queries the Open-Meteo API for 700+ Local Government Areas, engineers the features, runs the ML ensemble, and securely upserts the results to a cloud database.

FastAPI Backend: A blazing-fast Python server that queries the database and serves pre-computed predictions to the frontend in under 10ms.

Next.js Frontend: A React-based UI featuring a stark, highly legible neo-brutalist "blueprint" aesthetic, fetching live data dynamically without freezing the client.

Tech Stack

Frontend: Next.js (App Router), React, Tailwind CSS, Framer Motion, Lucide Icons, TypeScript.

Backend: FastAPI, Python, Uvicorn.

Machine Learning: Scikit-Learn, XGBoost, Pandas, Numpy, Joblib.

Database: Supabase (PostgreSQL).

Deployment: Vercel (Frontend), Render (Backend/Cron).

🚀 How to Run Locally

To test the application on your local machine, you will need to run both the backend API and the frontend client.

1. Setup the Python Backend

Navigate to the backend/ directory:

cd backend


Create a virtual environment and install dependencies:

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt


Set up your environment variables by creating a .env file in the backend/ folder:

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key


Start the FastAPI server:

uvicorn fastapi_ml_backend:app --reload --port 8000


The API will be available at http://127.0.0.1:8000

2. Setup the Next.js Frontend

Open a new terminal and navigate to the root directory (or your frontend folder):

npm install


Create a .env.local file in the frontend directory to point to your local API:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000


Start the development server:

npm run dev


The frontend will be available at http://localhost:3000

📜 License & Acknowledgements

Topographical data sourced from SRTM/OpenTopography.

Meteorological telemetry powered by Open-Meteo.

UI/UX inspired by architectural blueprint aesthetics and neo-brutalism.