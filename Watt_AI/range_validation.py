import joblib
import pandas as pd

FEATURES = [
    "Relative_Compactness", "Surface_Area", "Wall_Area", "Roof_Area",
    "Overall_Height", "Orientation", "Glazing_Area", "Glazing_Distribution"
]

model = joblib.load("RF_Energy_MultiOutput_v1_2026-04-01.pkl")

print("\n--- Valid Input Ranges ---\n")
df = pd.read_csv("energy_efficiency.csv")
df.columns = FEATURES + ["Heating_Load", "Cooling_Load"]
for col in FEATURES:
    print(f"{col:<30} min: {df[col].min():<10} max: {df[col].max()}")

print("\n--- Feature Importance ---\n")
for i, target in enumerate(["Heating_Load", "Cooling_Load"]):
    importances = model.estimators_[i].feature_importances_
    ranked = sorted(zip(FEATURES, importances), key=lambda x: x[1], reverse=True)
    print(f"{target}:")
    for name, score in ranked:
        bar = "█" * int(score * 50)
        print(f"  {name:<30} {score:.4f}  {bar}")
    print()