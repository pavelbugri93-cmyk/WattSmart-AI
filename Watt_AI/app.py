# ============================================================
# FILE: app.py
# Flask microservice — exposes a single /predict endpoint.
# Receives building parameters from the Spring Boot service,
# runs them through the trained Random Forest model,
# and returns heating and cooling load predictions.
# ============================================================

from flask import Flask, request, jsonify
import joblib
import pandas as pd
import logging
from datetime import date

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

MODEL_PATH = "RF_Energy_MultiOutput_v1_latest.pkl"

# Column order must match exactly what the model was trained on
FEATURE_ORDER = [
    "Relative_Compactness", "Surface_Area", "Wall_Area", "Roof_Area",
    "Overall_Height", "Orientation", "Glazing_Area", "Glazing_Distribution"
]

# Load model once at startup — not on every request
model = joblib.load(MODEL_PATH)
logger.info("Model loaded successfully: %s", MODEL_PATH)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        missing = [col for col in FEATURE_ORDER if col not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        input_df = pd.DataFrame([data])[FEATURE_ORDER]
        predictions = model.predict(input_df)

        logger.info("Prediction complete — heating: %.2f, cooling: %.2f",
                    predictions[0][0], predictions[0][1])

        return jsonify({
            "heating_load": round(float(predictions[0][0]), 2),
            "cooling_load": round(float(predictions[0][1]), 2),
            "model_version": MODEL_PATH
        })

    except Exception as e:
        logger.error("Prediction failed: %s", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)