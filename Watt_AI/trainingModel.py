# ============================================================
# FILE: trainingModel.py
# Trains a Random Forest model on the UCI Energy Efficiency dataset.
# If a model file for today already exists, training is skipped.
# The model is saved with today's date in the filename.
# ============================================================

import os
import joblib
import pandas as pd
from datetime import date
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor

TARGETS  = ["Heating_Load", "Cooling_Load"]
FEATURES = [
    "Relative_Compactness", "Surface_Area", "Wall_Area", "Roof_Area",
    "Overall_Height", "Orientation", "Glazing_Area", "Glazing_Distribution"
]


MODEL_PATH = "RF_Energy_MultiOutput_v1_latest.pkl"


def train_and_save():
    print(f"Training model — will be saved as: {MODEL_PATH}")

    df = pd.read_csv("energy_efficiency.csv")
    df.columns = FEATURES + TARGETS

    X = df[FEATURES]
    y = df[TARGETS]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42))
    model.fit(X_train, y_train)

    joblib.dump(model, MODEL_PATH)
    print(f"Model saved: {MODEL_PATH}")


if __name__ == "__main__":
    if os.path.exists(MODEL_PATH):
        print(f"Model for today already exists ({MODEL_PATH}). Skipping training.")
    else:
        train_and_save()