import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict

# ─────────────────────────────────────────────
# Lazy Loading Storage
# ─────────────────────────────────────────────
_cache = {
    "models": {},
    "scalers": {},
    "reducers": {},
    "kolom_asli": None
}

base_dir = os.path.dirname(os.path.abspath(__file__))

def get_model(name: str):
    if name not in _cache["models"]:
        file_map = {"KNN": "model_knn_pca.pkl", "NN": "model_nn.pkl", "SVM": "model_svm_pca.pkl", "RF": "model_rf.pkl"}
        _cache["models"][name] = joblib.load(os.path.join(base_dir, "models", file_map[name]))
    return _cache["models"][name]

def get_scaler(name: str):
    if name not in _cache["scalers"]:
        file_map = {"KNN": "scaler_knn.pkl", "NN": "scaler_nn.pkl", "SVM": "scaler_svm.pkl", "RF": "scaler_rf.pkl"}
        _cache["scalers"][name] = joblib.load(os.path.join(base_dir, "scalers", file_map[name]))
    return _cache["scalers"][name]

def get_reducer(name: str):
    if name not in _cache["reducers"]:
        file_map = {"KNN": "pca_knn.pkl", "NN": "rfe_nn.pkl", "SVM": "pca_svm.pkl", "RF": "selector_rf.pkl"}
        _cache["reducers"][name] = joblib.load(os.path.join(base_dir, "reducers", file_map[name]))
    return _cache["reducers"][name]

def get_kolom_asli():
    if _cache["kolom_asli"] is None:
        _cache["kolom_asli"] = joblib.load(os.path.join(base_dir, "kolom_asli.pkl"))
    return _cache["kolom_asli"]

# Hardcode kolom training agar efisien
TRAINING_COLUMNS = [
    'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure', 
    'PhoneService', 'PaperlessBilling', 'MonthlyCharges', 'TotalCharges', 
    'MultipleLines_No', 'MultipleLines_No phone service', 'MultipleLines_Yes',
    'InternetService_DSL', 'InternetService_Fiber optic', 'InternetService_No',
    'OnlineSecurity_No', 'OnlineSecurity_No internet service', 'OnlineSecurity_Yes',
    'OnlineBackup_No', 'OnlineBackup_No internet service', 'OnlineBackup_Yes',
    'DeviceProtection_No', 'DeviceProtection_No internet service', 'DeviceProtection_Yes',
    'TechSupport_No', 'TechSupport_No internet service', 'TechSupport_Yes',
    'StreamingTV_No', 'StreamingTV_No internet service', 'StreamingTV_Yes',
    'StreamingMovies_No', 'StreamingMovies_No internet service', 'StreamingMovies_Yes',
    'Contract_Month-to-month', 'Contract_One year', 'Contract_Two year',
    'PaymentMethod_Bank transfer (automatic)', 'PaymentMethod_Credit card (automatic)',
    'PaymentMethod_Electronic check', 'PaymentMethod_Mailed check'
]

app = FastAPI(
    title="Telco Churn ML Engine (Render API)",
    description="API inferensi model ML",
    version="2.0.0"
)

# CORS — izinkan Vercel dan lokal
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

BINARY_COLS = ["Partner", "Dependents", "PhoneService", "PaperlessBilling"]
GENDER_MAP = {"Female": 0, "Male": 1}
MULTI_COLS = [
    "MultipleLines", "InternetService", "OnlineSecurity",
    "OnlineBackup", "DeviceProtection", "TechSupport",
    "StreamingTV", "StreamingMovies", "Contract", "PaymentMethod"
]

class PredictRequest(BaseModel):
    model_choice: str
    data: Dict[str, Any]

class PredictResponse(BaseModel):
    prediction:  int
    probability: list
    label:       str
    model_used:  str

def preprocess(raw_data: dict, model_choice: str) -> np.ndarray:
    df = pd.DataFrame([raw_data])
    kolom_asli = get_kolom_asli()

    for col in kolom_asli:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Field '{col}' tidak ditemukan")

    df = df[kolom_asli]
    df["gender"] = df["gender"].map(GENDER_MAP)
    for col in BINARY_COLS:
        df[col] = df[col].map({"No": 0, "Yes": 1})

    df = pd.get_dummies(df, columns=MULTI_COLS)

    if model_choice == "RF":
        RF_COLUMNS = ['SeniorCitizen', 'tenure', 'MonthlyCharges', 'TotalCharges', 'gender_Male', 'Partner_Yes', 'Dependents_Yes', 'PhoneService_Yes', 'MultipleLines_No phone service', 'MultipleLines_Yes', 'InternetService_Fiber optic', 'InternetService_No', 'OnlineSecurity_No internet service', 'OnlineSecurity_Yes', 'OnlineBackup_No internet service', 'OnlineBackup_Yes', 'DeviceProtection_No internet service', 'DeviceProtection_Yes', 'TechSupport_No internet service', 'TechSupport_Yes', 'StreamingTV_No internet service', 'StreamingTV_Yes', 'StreamingMovies_No internet service', 'StreamingMovies_Yes', 'Contract_One year', 'Contract_Two year', 'PaperlessBilling_Yes', 'PaymentMethod_Credit card (automatic)', 'PaymentMethod_Electronic check', 'PaymentMethod_Mailed check']
        rename_map = {
            'gender': 'gender_Male',
            'Partner': 'Partner_Yes',
            'Dependents': 'Dependents_Yes',
            'PhoneService': 'PhoneService_Yes',
            'PaperlessBilling': 'PaperlessBilling_Yes'
        }
        df = df.rename(columns=rename_map)
        df = df.reindex(columns=RF_COLUMNS, fill_value=0)
    else:
        df = df.reindex(columns=TRAINING_COLUMNS, fill_value=0)

    scaler = get_scaler(model_choice)
    X = scaler.transform(df)

    reducer = get_reducer(model_choice)
    if hasattr(reducer, "transform"):
        X = reducer.transform(X)

    return X

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    model_choice = req.model_choice.upper()
    if model_choice not in ["KNN", "NN", "SVM", "RF"]:
        raise HTTPException(status_code=400, detail="Pilih antara: KNN, NN, SVM, RF")

    try:
        X = preprocess(req.data, model_choice)
        model = get_model(model_choice)
        prediction = int(model.predict(X)[0])
        probability = model.predict_proba(X)[0].tolist()

        return PredictResponse(
            prediction=prediction,
            probability=probability,
            label="Churn" if prediction == 1 else "Tidak Churn",
            model_used=model_choice
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
