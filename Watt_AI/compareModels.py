# ============================================================
# FILE: compareModels.py
# Compares Random Forest vs Linear Regression on the energy dataset.
# Shows R2, RMSE bar charts, and residuals side by side for both models.
# ============================================================

import joblib
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor
import numpy as np

MODEL_PATH = "RF_Energy_MultiOutput_v1_2026-04-01.pkl"
FEATURES   = [
    "Relative_Compactness", "Surface_Area", "Wall_Area", "Roof_Area",
    "Overall_Height", "Orientation", "Glazing_Area", "Glazing_Distribution"
]
TARGETS = ["Heating_Load", "Cooling_Load"]

# ── Load data and models ────────────────────────────────────────────────────

df = pd.read_csv("energy_efficiency.csv")
df.columns = FEATURES + TARGETS

X = df[FEATURES]
y = df[TARGETS]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

rf_model = joblib.load(MODEL_PATH)
lr_model = MultiOutputRegressor(LinearRegression())
lr_model.fit(X_train, y_train)

rf_preds = rf_model.predict(X_test)
lr_preds = lr_model.predict(X_test)

# ── Compute metrics ─────────────────────────────────────────────────────────

print("\n--- Model Comparison: Random Forest vs Linear Regression ---\n")
rf_r2_scores, lr_r2_scores = [], []
rf_rmse_scores, lr_rmse_scores = [], []

for i, target in enumerate(TARGETS):
    rf_r2   = r2_score(y_test.iloc[:, i], rf_preds[:, i])
    lr_r2   = r2_score(y_test.iloc[:, i], lr_preds[:, i])
    rf_rmse = np.sqrt(mean_squared_error(y_test.iloc[:, i], rf_preds[:, i]))
    lr_rmse = np.sqrt(mean_squared_error(y_test.iloc[:, i], lr_preds[:, i]))

    rf_r2_scores.append(rf_r2)
    lr_r2_scores.append(lr_r2)
    rf_rmse_scores.append(rf_rmse)
    lr_rmse_scores.append(lr_rmse)

    print(f"{target}:")
    print(f"  Random Forest     — R2: {rf_r2:.4f}  RMSE: {rf_rmse:.2f}")
    print(f"  Linear Regression — R2: {lr_r2:.4f}  RMSE: {lr_rmse:.2f}")
    print()

# ── Plot: R2, RMSE bar charts + Residuals ───────────────────────────────────

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle("Model Comparison: Random Forest vs Linear Regression", fontsize=14)

labels = ["Heating Load", "Cooling Load"]
x     = np.arange(len(labels))
width = 0.35

# R2 bar chart
ax = axes[0, 0]
bars_rf = ax.bar(x - width/2, rf_r2_scores, width, label="Random Forest", color="steelblue")
bars_lr = ax.bar(x + width/2, lr_r2_scores, width, label="Linear Regression", color="orange")
ax.set_title("R² Score (higher is better)")
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.set_ylim(0.8, 1.02)
ax.legend()
for bar in list(bars_rf) + list(bars_lr):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.002,
            f"{bar.get_height():.4f}", ha="center", fontsize=8)

# RMSE bar chart
ax = axes[0, 1]
bars_rf = ax.bar(x - width/2, rf_rmse_scores, width, label="Random Forest", color="steelblue")
bars_lr = ax.bar(x + width/2, lr_rmse_scores, width, label="Linear Regression", color="orange")
ax.set_title("RMSE — lower is better (kWh)")
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend()
for bar in list(bars_rf) + list(bars_lr):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
            f"{bar.get_height():.2f}", ha="center", fontsize=8)

# Residuals — Heating Load
ax = axes[1, 0]
ax.scatter(rf_preds[:, 0], y_test.iloc[:, 0] - rf_preds[:, 0], alpha=0.5, color="orange",    label="Random Forest")
ax.scatter(lr_preds[:, 0], y_test.iloc[:, 0] - lr_preds[:, 0], alpha=0.5, color="steelblue", label="Linear Regression")
ax.axhline(y=0, color="red", linestyle="--")
ax.set_title("Residuals: Heating Load")
ax.set_xlabel("Predicted")
ax.set_ylabel("Error")
ax.legend()

# Residuals — Cooling Load
ax = axes[1, 1]
ax.scatter(rf_preds[:, 1], y_test.iloc[:, 1] - rf_preds[:, 1], alpha=0.5, color="darkorange", label="Random Forest")
ax.scatter(lr_preds[:, 1], y_test.iloc[:, 1] - lr_preds[:, 1], alpha=0.5, color="royalblue",  label="Linear Regression")
ax.axhline(y=0, color="red", linestyle="--")
ax.set_title("Residuals: Cooling Load")
ax.set_xlabel("Predicted")
ax.set_ylabel("Error")
ax.legend()

plt.tight_layout()
plt.show()