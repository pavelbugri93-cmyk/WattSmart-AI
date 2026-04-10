# WattSmart AI

Energy consumption prediction system for residential buildings, built as a full-stack microservices application.

---

## Screenshots

![Login](wattsmart-frontend/docs/screenshots/login.png)
![Predict — Guest](wattsmart-frontend/docs/screenshots/predict-guest.png)
![Predict — User](wattsmart-frontend/docs/screenshots/predict-user.png)
![History](wattsmart-frontend/docs/screenshots/history.png)
![Profile](wattsmart-frontend/docs/screenshots/profile.png)
![Models — Charts](wattsmart-frontend/docs/screenshots/models_1.png)
![Models — Residuals](wattsmart-frontend/docs/screenshots/models_2.png)

---

## Overview

WattSmart AI predicts heating and cooling loads for buildings based on 8 architectural parameters from the UCI Energy Efficiency Dataset. Users receive an energy efficiency rating (A–F), estimated annual electricity cost, and CO₂ emissions.

---

## Architecture

React (Vite)  →  Spring Boot (Port 8080)  →  Python Flask (Port 5000)
↓
PostgreSQL DB

- **Frontend** — React + Vite, Axios, Recharts, Lucide Icons
- **API Gateway** — Spring Boot 3, Spring Security, JWT authentication
- **ML Service** — Python Flask + Gunicorn, scikit-learn Random Forest model
- **Database** — PostgreSQL with JPA/Hibernate

---

## ML Model

Trained on the [UCI Energy Efficiency Dataset](https://www.kaggle.com/datasets/elikplim/eergy-efficiency-dataset) (768 samples, 8 features).

| Model             | R² Heating | R² Cooling | RMSE Heating | RMSE Cooling |
|-------------------|------------|------------|--------------|--------------|
| Linear Regression | 0.9122     | 0.8932     | 3.03         | 3.15         |
| Random Forest     | 0.9977     | 0.9683     | 0.49         | 1.71         |

Random Forest was selected for its 6x improvement in accuracy over the Linear Regression baseline.

---

## Features

- JWT-based authentication (register, login, stateless sessions)
- IP-based rate limiting on login endpoint (5 attempts / 60 seconds)
- Energy prediction for authenticated users and guests
- Prediction history with sorting, filtering, and CSV export
- Scenario Simulator — test parameter changes without saving to history
- Personal electricity rate management (used in cost calculations)
- Energy efficiency rating A–F based on UCI dataset distribution
- Swagger UI for API documentation
- Unit tests for service and controller layers (JUnit 5 + Mockito)

---

## Getting Started

### Option 1 — Docker (recommended)

Runs all 4 services with a single command.

**Prerequisites:** Docker + Docker Compose

# 1. Clone the repository
git clone https://github.com/pavelbugri93-cmyk/WattSmart-AI.git
cd WattSmart-AI

# 2. Create your environment file
copy .env.example .env

# 3. Start all services
docker-compose up --build

**Services:**

| Service     | Description                  | Port |
|-------------|------------------------------|------|
| spring-boot | Java API backend             | 8080 |
| flask       | Python ML microservice       | 5000 |
| postgres    | PostgreSQL database          | 5432 |
| frontend    | React app (Vite)             | 5173 |

The app will be available at `http://localhost:5173`.  
Swagger UI at `http://localhost:8080/swagger-ui/index.html`.

> PostgreSQL data is persisted in a Docker volume.

---

### Option 2 — Local Development

**Prerequisites:** Java 21, Python 3.10+, PostgreSQL, Node.js 20+

**1. Configure the backend**
```bash
cp WattSmart_AI/src/main/resources/application.properties.example WattSmart_AI/src/main/resources/application.properties
# Fill in your DB credentials and JWT secret
```

**2. Run the ML service**
```bash
cd Watt_AI
pip install -r requirements.txt
python app.py
```

**3. Run the Spring Boot server**
```bash
cd WattSmart_AI
./mvnw spring-boot:run
```

**4. Run the frontend**
```bash
cd wattsmart-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

| Folder | Description |
|--------|-------------|
| `WattSmart_AI/` | Spring Boot backend (Java 21) |
| `WattSmart_AI/config/` | Security, JWT, CORS |
| `WattSmart_AI/controller/` | REST endpoints |
| `WattSmart_AI/service/` | Business logic |
| `Watt_AI/` | Python Flask ML microservice |
| `Watt_AI/app.py` | Flask API endpoint |
| `Watt_AI/trainingModel.py` | Model training script |
| `wattsmart-frontend/` | React + Vite frontend |
| `wattsmart-frontend/pages/` | Page components |

## Dataset

UCI Energy Efficiency Dataset — Tsanas & Xifara, 2012.  
768 building simulations, 8 input features, 2 prediction targets.

---

## Planned Improvements

- Refresh token support
- Multi-language support (Hebrew, Arabic)