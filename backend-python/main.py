import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Any, Dict

# ─────────────────────────────────────────────
# Global storage untuk model, scaler, reducer
# ─────────────────────────────────────────────
models   = {}
scalers  = {}
reducers = {}
kolom_asli       = []
training_columns = []   # kolom setelah one-hot encoding (dari training)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load semua file .pkl ke memori saat startup (sekali saja)."""
    global models, scalers, reducers, kolom_asli, training_columns
    try:
        # Models
        models["KNN"] = joblib.load("models/model_knn_pca.pkl")
        models["NN"]  = joblib.load("models/model_nn.pkl")
        models["SVM"] = joblib.load("models/model_svm_pca.pkl")

        # Scalers
        scalers["KNN"] = joblib.load("scalers/scaler_knn.pkl")
        scalers["NN"]  = joblib.load("scalers/scaler_nn.pkl")
        scalers["SVM"] = joblib.load("scalers/scaler_svm.pkl")

        # Reducers (PCA untuk KNN & SVM, RFE untuk NN)
        reducers["KNN"] = joblib.load("reducers/pca_knn.pkl")
        reducers["NN"]  = joblib.load("reducers/rfe_nn.pkl")
        reducers["SVM"] = joblib.load("reducers/pca_svm.pkl")

        # Kolom asli (19 fitur sebelum encoding)
        kolom_asli = joblib.load("kolom_asli.pkl")

        # Kolom setelah one-hot encoding (dari training) — opsional
        # training_columns = joblib.load("training_columns.pkl")

        print("✅ Semua model berhasil dimuat:", list(models.keys()))
    except FileNotFoundError as e:
        print(f"⚠️  File .pkl tidak ditemukan: {e}")
        print("   Pastikan semua file .pkl sudah ada di folder models/, scalers/, reducers/")
    yield
    # Cleanup saat shutdown (opsional)
    models.clear()
    scalers.clear()
    reducers.clear()


app = FastAPI(
    title="Telco Churn ML Engine",
    description="API inferensi model ML untuk prediksi churn pelanggan telekomunikasi",
    version="2.0.0",
    lifespan=lifespan
)

# CORS — izinkan akses dari Node.js gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "https://*.onrender.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Konstanta Encoding
# ─────────────────────────────────────────────

# Fitur binary yang di-LabelEncode secara alfabetis (No=0, Yes=1)
BINARY_COLS = [
    "Partner", "Dependents", "PhoneService", "PaperlessBilling"
]

# Fitur binary khusus (Female=0, Male=1)
GENDER_MAP = {"Female": 0, "Male": 1}

# Fitur multi-nilai (akan di-OneHot Encode)
MULTI_COLS = [
    "MultipleLines", "InternetService", "OnlineSecurity",
    "OnlineBackup", "DeviceProtection", "TechSupport",
    "StreamingTV", "StreamingMovies", "Contract", "PaymentMethod"
]


# ─────────────────────────────────────────────
# Schema Request / Response
# ─────────────────────────────────────────────

class PredictRequest(BaseModel):
    model_choice: str       # "KNN" | "NN" | "SVM"
    data: Dict[str, Any]    # 19 fitur pelanggan


class PredictResponse(BaseModel):
    prediction:  int
    probability: list
    label:       str
    model_used:  str


# ─────────────────────────────────────────────
# Helper: Preprocessing Pipeline
# ─────────────────────────────────────────────

def preprocess(raw_data: dict, model_choice: str) -> np.ndarray:
    """
    Pipeline preprocessing sesuai PRD Section 10.2:
    1. Susun DataFrame sesuai kolom_asli
    2. Label Encoding (binary + gender)
    3. One-Hot Encoding → align kolom dengan training
    4. Scale → Reduce
    """
    # 1. Susun kolom sesuai urutan saat training
    df = pd.DataFrame([raw_data])

    # Pastikan semua kolom asli hadir
    for col in kolom_asli:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Field '{col}' tidak ditemukan dalam request")

    df = df[kolom_asli]

    # 2a. Label Encoding gender
    df["gender"] = df["gender"].map(GENDER_MAP)

    # 2b. Label Encoding binary Yes/No (alfabetis: No=0, Yes=1)
    for col in BINARY_COLS:
        df[col] = df[col].map({"No": 0, "Yes": 1})

    # 2c. SeniorCitizen sudah 0/1, tidak perlu encode

    # 3. One-Hot Encoding untuk fitur multi-nilai
    df = pd.get_dummies(df, columns=MULTI_COLS)

    # Align kolom dengan training (tambahkan kolom yang hilang, fill 0)
    if training_columns:
        df = df.reindex(columns=training_columns, fill_value=0)

    # 4a. Scaling
    X = scalers[model_choice].transform(df)

    # 4b. Dimensi reduction (PCA atau RFE)
    reducer = reducers[model_choice]
    if hasattr(reducer, "transform"):
        X = reducer.transform(X)

    return X


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@app.get("/health")
def health_check():
    """FR-ML-06: Health check endpoint."""
    return {
        "status": "ok",
        "models_loaded": list(models.keys()),
        "version": "2.0.0"
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    """
    FR-ML-01 s/d FR-ML-05: Endpoint prediksi utama.
    Pipeline: preprocessing → scale → reduce → predict
    """
    model_choice = req.model_choice.upper()

    # Validasi model
    if model_choice not in models:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{model_choice}' tidak dikenali. Pilih antara: KNN, NN, SVM"
        )

    if not models:
        raise HTTPException(
            status_code=503,
            detail="Model belum dimuat. Pastikan file .pkl tersedia."
        )

    try:
        X = preprocess(req.data, model_choice)
        prediction = int(models[model_choice].predict(X)[0])
        probability = models[model_choice].predict_proba(X)[0].tolist()

        return PredictResponse(
            prediction=prediction,
            probability=probability,
            label="Churn" if prediction == 1 else "Tidak Churn",
            model_used=model_choice
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
