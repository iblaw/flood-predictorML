# flood-predictorML
This is my capstone project. I will come up with a better description later.

Folder Structure
nigeria-flood-predictor/
│
├── data/               # Note: NEVER commit large data files to GitHub!
│   ├── raw/            # Raw downloaded DEMs, CSVs, shapefiles
│   └── processed/      # Cleaned data ready for model training
│
├── notebooks/          # Google Colab/Jupyter notebooks for experimentation
│   ├── 01_data_exploration.ipynb
│   └── 02_model_testing.ipynb
│
├── src/                # Reusable Python scripts (.py files)
│   ├── data_pipeline.py # (This is where our Phase 2 script goes)
│   └── features.py     
│
├── models/             # Saved/trained models (.joblib or .pkl)
│
├── app/                # Streamlit web application code
│   └── main.py
│
├── requirements.txt    # List of dependencies
├── README.md           # Project description for the judges
└── .gitignore          # Tells Git to ignore large files and secret keys


The Scope (High Variance Strategy): To ensure the model learns true geographical risk factors (and doesn't just overfit to one region), select 5 states across different geopolitical zones with a strong mix of urban and rural environments:

Kogi (North Central): Confluence of the Niger & Benue rivers. Mix of semi-urban (Lokoja) and highly rural riverine communities.

Bayelsa (South South): Niger Delta. Heavy rainfall, coastal/creek flooding. Mostly rural/semi-urban.

Lagos (South West): Coastal and lagoon flooding. Highly urbanized, providing a stark contrast in Land Use/Land Cover (LULC) features (e.g., concrete vs. vegetation).

Anambra (South East): River Niger banks. Offers an excellent split between dense urban commerce (Onitsha) and rural agricultural plains (Ogbaru).

Adamawa (North East): Upper River Benue. Mostly rural and agricultural. Has a semi-arid climate but experiences severe seasonal riverine flooding, providing great weather variance compared to the deep South.

The Target Variable ($y$): How are you classifying risk? We recommend mapping NIHSA's Annual Flood Outlook (AFO) terminology to integers for your model:

Class 0: Low Flood Risk Area

Class 1: Moderate Flood Risk Area

Class 2: High Flood Risk Area

Class 3: Highly Probable (Red Zones)


Understanding the Problem 
Flood is terrible but it is the same everywhere it is one of the most common disaster affects about a 5th of the global population

The very first problem is that there is not enough data

several factors contribute to this phenomenon however since the phenomenon is physical and the same across the world we can train a single model on global data

HOW DO WE GET THE GLOBAL DATA?
Taking action before rivers risekbkj