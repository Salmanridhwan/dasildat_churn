import os
import json
import joblib
import numpy as np
from http.server import BaseHTTPRequestHandler

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
        file_map = {"KNN": "model_knn_pca.pkl", "NN": "model_nn.pkl", "SVM": "model_svm_pca.pkl"}
        _cache["models"][name] = joblib.load(os.path.join(base_dir, "models", file_map[name]))
    return _cache["models"][name]

def get_scaler(name: str):
    if name not in _cache["scalers"]:
        file_map = {"KNN": "scaler_knn.pkl", "NN": "scaler_nn.pkl", "SVM": "scaler_svm.pkl"}
        _cache["scalers"][name] = joblib.load(os.path.join(base_dir, "scalers", file_map[name]))
    return _cache["scalers"][name]

def get_reducer(name: str):
    if name not in _cache["reducers"]:
        file_map = {"KNN": "pca_knn.pkl", "NN": "rfe_nn.pkl", "SVM": "pca_svm.pkl"}
        _cache["reducers"][name] = joblib.load(os.path.join(base_dir, "reducers", file_map[name]))
    return _cache["reducers"][name]

def get_kolom_asli():
    if _cache["kolom_asli"] is None:
        _cache["kolom_asli"] = joblib.load(os.path.join(base_dir, "kolom_asli.pkl"))
    return _cache["kolom_asli"]

# Hardcode kolom training agar tidak perlu read CSV saat cold-start
TRAINING_COLUMNS = [
    'SeniorCitizen', 'tenure', 'MonthlyCharges', 'TotalCharges', 'gender',
    'Partner', 'Dependents', 'PhoneService', 'PaperlessBilling',
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

BINARY_COLS = ["Partner", "Dependents", "PhoneService", "PaperlessBilling"]
GENDER_MAP = {"Female": 0, "Male": 1}
MULTI_COLS = [
    "MultipleLines", "InternetService", "OnlineSecurity",
    "OnlineBackup", "DeviceProtection", "TechSupport",
    "StreamingTV", "StreamingMovies", "Contract", "PaymentMethod"
]

def preprocess(raw_data: dict, model_choice: str) -> np.ndarray:
    kolom_asli = get_kolom_asli()

    for col in kolom_asli:
        if col not in raw_data:
            raise ValueError(f"Field '{col}' tidak ditemukan")

    row = np.zeros(len(TRAINING_COLUMNS))
    col_idx = {col: i for i, col in enumerate(TRAINING_COLUMNS)}

    for num_col in ['SeniorCitizen', 'tenure', 'MonthlyCharges', 'TotalCharges']:
        val = raw_data.get(num_col, 0)
        row[col_idx[num_col]] = float(val) if val not in ["", None] else 0.0

    row[col_idx['gender']] = GENDER_MAP.get(raw_data.get('gender', ''), 0)

    for bin_col in BINARY_COLS:
        row[col_idx[bin_col]] = 1.0 if raw_data.get(bin_col) == "Yes" else 0.0

    for multi_col in MULTI_COLS:
        val = raw_data.get(multi_col, '')
        dummy_col_name = f"{multi_col}_{val}"
        if dummy_col_name in col_idx:
            row[col_idx[dummy_col_name]] = 1.0

    X = np.array([row])

    scaler = get_scaler(model_choice)
    X = scaler.transform(X)

    reducer = get_reducer(model_choice)
    if hasattr(reducer, "transform"):
        X = reducer.transform(X)

    return X

class handler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "mode": "native-serverless"}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path not in ['/api/predict', '/api/index.py']:
            self.send_response(404)
            self.end_headers()
            return

        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            req = json.loads(post_data)

            model_choice = req.get("model_choice", "").upper()
            if model_choice not in ["KNN", "NN", "SVM"]:
                raise ValueError("Pilih model antara: KNN, NN, SVM")

            X = preprocess(req.get("data", {}), model_choice)
            model = get_model(model_choice)
            prediction = int(model.predict(X)[0])
            probability = model.predict_proba(X)[0].tolist()

            response_data = {
                "prediction": prediction,
                "probability": probability,
                "label": "Churn" if prediction == 1 else "Tidak Churn",
                "model_used": model_choice
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        except Exception as e:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"detail": str(e)}).encode('utf-8'))

if __name__ == '__main__':
    from http.server import HTTPServer
    server = HTTPServer(('127.0.0.1', 8000), handler)
    print("Starting native server on http://127.0.0.1:8000")
    server.serve_forever()
