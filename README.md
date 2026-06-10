# Telco Customer Churn Prediction Platform

Platform prediksi churn pelanggan telekomunikasi berbasis microservices menggunakan machine learning.

## Arsitektur

```
[ React :3000 ] → [ Node.js :5000 ] → [ FastAPI :8000 ]
```

| Service | Teknologi | Port |
|---|---|:---:|
| Frontend | React.js + Vite | 3000 |
| API Gateway | Node.js + Express | 5000 |
| ML Engine | Python + FastAPI | 8000 |

## Model ML

- **KNN** — K-Nearest Neighbors + PCA
- **NN** — Neural Network (MLP) + RFE
- **SVM** — Support Vector Machine + PCA

## Cara Menjalankan (Development)

### 1. FastAPI ML Engine
```bash
cd backend-python
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Node.js API Gateway
```bash
cd backend-node
cp .env.example .env   # sesuaikan isinya
npm install
node index.js
```

### 3. React Frontend
```bash
cd frontend
cp .env.example .env   # sesuaikan isinya
npm install
npm run dev
```

Buka: http://localhost:3000

## Dataset

- **Sumber:** Telco Customer Churn — Kaggle (blastchar)
- **Ukuran:** 7.043 pelanggan, 21 fitur
- **Penanganan imbalance:** SMOTE (hanya saat training)

## Tim Pengembang

Kelompok Tugas Besar Dasar Ilmu Data
