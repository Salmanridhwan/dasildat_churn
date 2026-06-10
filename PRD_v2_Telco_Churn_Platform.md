# PRODUCT REQUIREMENT DOCUMENT (PRD)
## 📡 Telco Customer Churn Prediction Platform

| Info | Detail |
|---|---|
| **Nama Proyek** | Platform Analisis & Prediksi Churn Pelanggan Telekomunikasi |
| **Arsitektur** | Microservices (React.js · Node.js API Gateway · Python FastAPI ML Engine) |
| **Versi Dokumen** | 2.0 |
| **Status** | Siap Implementasi |
| **Tim Pengembang** | Kelompok Tugas Besar Dasar Ilmu Data |
| **Model ML** | K-Nearest Neighbors (KNN) · Neural Network (MLP) · Support Vector Machine (SVM) |
| **Dataset** | Telco Customer Churn — Kaggle (blastchar) |

---

## Daftar Isi

1. [Ringkasan Eksekutif & Tujuan Proyek](#1-ringkasan-eksekutif--tujuan-proyek)
2. [Arsitektur Sistem & Aliran Data](#2-arsitektur-sistem--aliran-data)
3. [Spesifikasi Kebutuhan Fungsional](#3-spesifikasi-kebutuhan-fungsional)
4. [Parameter Input Data & Aturan Validasi](#4-parameter-input-data--aturan-validasi)
5. [Spesifikasi Kontrak API](#5-spesifikasi-kontrak-api)
6. [Wireframe & Deskripsi Halaman UI](#6-wireframe--deskripsi-halaman-ui-)
7. [Kebutuhan Non-Fungsional](#7-kebutuhan-non-fungsional)
8. [Rencana Deployment Produksi](#8-rencana-deployment-produksi-)
9. [Rencana Tahapan Implementasi](#9-rencana-tahapan-implementasi-roadmap)
10. [Pipeline ML & Penanganan Data](#10-pipeline-ml--penanganan-data-)

---

## 1. Ringkasan Eksekutif & Tujuan Proyek

### 1.1 Latar Belakang

Dalam industri telekomunikasi, mempertahankan pelanggan yang sudah ada (customer retention) jauh lebih ekonomis daripada mengakuisisi pelanggan baru. Platform ini dirancang untuk mendeteksi secara dini pelanggan yang memiliki risiko tinggi untuk berhenti berlangganan (churn).

Sistem memanfaatkan data historis pelanggan untuk memetakan pola perilaku melalui tiga algoritma Machine Learning yang telah dilatih secara terpisah menggunakan dataset Telco Customer Churn dari Kaggle dengan **7.043 data pelanggan** dan rasio ketidakseimbangan kelas **73:27** (tidak churn:churn) yang ditangani menggunakan teknik **SMOTE**.

### 1.2 Tujuan Utama

- Membangun antarmuka web (UI) yang ramah pengguna untuk memasukkan data profil pelanggan secara individual.
- Menyediakan sistem pipeline data yang otomatis melakukan sinkronisasi preprocessing data antara input pengguna dan kebutuhan model ML.
- Menampilkan hasil prediksi churn beserta nilai probabilitasnya secara real-time dari tiga model ML sekaligus.
- Mengimplementasikan penanganan data tidak seimbang menggunakan SMOTE pada tahap pelatihan model.
- Mendeploy platform ke layanan cloud sehingga dapat diakses secara publik.

### 1.3 Ruang Lingkup Sistem

Platform ini mencakup tiga komponen utama yang berjalan sebagai layanan terpisah:

- **Frontend (React.js):** Antarmuka pengguna interaktif dengan form input dinamis dan visualisasi hasil prediksi.
- **API Gateway (Node.js + Express):** Lapisan keamanan, validasi, dan proxy routing antar service.
- **ML Inference Engine (Python + FastAPI):** Pemrosesan ML inference mencakup preprocessing, seleksi/reduksi fitur, dan inferensi model.

---

## 2. Arsitektur Sistem & Aliran Data

### 2.1 Diagram Arsitektur Logis

Platform ini menggunakan **Arsitektur Microservices** untuk memisahkan beban kerja komputasi berat (inference model) dari server aplikasi web utama.

```
[ React.js :3000 ]  ──(1. Kirim JSON)──►  [ Node.js :5000 ]  ──(2. Validasi & Forward)──►  [ FastAPI :8000 ]
        ▲                                                                                            │
        └────────────────────────(4. Tampilkan Hasil)────────────────(3. Inference & Response)──────┘
```

### 2.2 Penjelasan Komponen

| Komponen | Teknologi | Tanggung Jawab | Port |
|---|---|---|:---:|
| Frontend | React.js + Axios | Form input, state management, visualisasi hasil | 3000 |
| API Gateway | Node.js + Express | CORS, validasi awal, proxy routing ke FastAPI | 5000 |
| ML Engine | Python + FastAPI | Load model .pkl, preprocessing, inferensi | 8000 |

### 2.3 Struktur Folder Project

```
telco-churn-platform/
├── frontend/                   ← React.js Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictionForm.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── ModelSelector.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend-node/               ← Node.js API Gateway
│   ├── routes/
│   │   └── predict.js
│   ├── index.js
│   └── package.json
│
└── backend-python/             ← FastAPI ML Engine
    ├── models/
    │   ├── model_knn_pca.pkl
    │   ├── model_nn.pkl
    │   └── model_svm_pca.pkl
    ├── scalers/
    │   ├── scaler_knn.pkl
    │   ├── scaler_nn.pkl
    │   └── scaler_svm.pkl
    ├── reducers/
    │   ├── pca_knn.pkl
    │   ├── rfe_nn.pkl
    │   └── pca_svm.pkl
    ├── kolom_asli.pkl
    ├── main.py
    └── requirements.txt
```

### 2.4 Mapping File .pkl per Model

| Model | Scaler | Reducer | Model File |
|---|---|---|---|
| **KNN** | scaler_knn.pkl | pca_knn.pkl *(PCA)* | model_knn_pca.pkl |
| **NN** | scaler_nn.pkl | rfe_nn.pkl *(RFE)* | model_nn.pkl |
| **SVM** | scaler_svm.pkl | pca_svm.pkl *(PCA)* | model_svm_pca.pkl |

---

## 3. Spesifikasi Kebutuhan Fungsional

### 3.1 Modul Frontend (React.js)

| ID | Nama | Deskripsi |
|---|---|---|
| FR-FE-01 | Dynamic Input Form | 19 komponen input interaktif: dropdown untuk fitur kategorikal dan numeric field untuk fitur kontinu. Setiap field memiliki label deskriptif dan placeholder. |
| FR-FE-02 | Model Selector | Dropdown untuk memilih model prediksi: KNN, Neural Network, atau SVM. Default: Neural Network. |
| FR-FE-03 | Validation Engine | Mencegah pengiriman jika ada field numerik bernilai negatif, kosong, atau melebihi batas maksimum yang ditentukan. |
| FR-FE-04 | Result Visualization | Kartu hasil prediksi dengan indikator warna (Merah = Churn, Hijau = Tidak Churn) dan grafik bar probabilitas. |
| FR-FE-05 | Loading State | Tampilkan spinner/loading indicator saat menunggu respons dari backend untuk mencegah submit berulang. |
| FR-FE-06 | Reset Form | Tombol Reset untuk menghapus semua input dan hasil prediksi sebelumnya. |

### 3.2 Modul Backend (Node.js Express)

| ID | Nama | Deskripsi |
|---|---|---|
| FR-BE-01 | CORS Handling | Membatasi akses API hanya untuk domain asal aplikasi React (localhost:3000 pada development, domain produksi saat deployment). |
| FR-BE-02 | Proxy Routing | Endpoint `POST /api/predict-churn` menerima data dari Frontend dan meneruskan ke ML Service via axios. |
| FR-BE-03 | Input Sanitization | Memvalidasi bahwa semua 19 field wajib hadir dalam request body sebelum diteruskan ke FastAPI. |
| FR-BE-04 | Error Fallback | Mengembalikan pesan error yang aman (tanpa stack trace) jika service Python tidak merespons atau timeout. |
| FR-BE-05 | Request Logging | Mencatat setiap request masuk beserta timestamp, model yang dipilih, dan status response untuk keperluan debugging. |

### 3.3 Modul ML Engine (Python FastAPI)

| ID | Nama | Deskripsi |
|---|---|---|
| FR-ML-01 | Memory Object Loading | Memuat semua file .pkl (model, scaler, reducer, kolom_asli) ke memori server hanya sekali saat startup menggunakan lifespan event. |
| FR-ML-02 | Categorical Auto-Encoding | Mengubah input string ("Yes"/"No") menjadi kode numerik (0/1/2) secara konsisten sesuai aturan alfabetis LabelEncoder. |
| FR-ML-03 | Routing Berbasis Model | KNN: `scaler→PCA→model` / NN: `scaler→RFE→model` / SVM: `scaler→PCA→model`. |
| FR-ML-04 | One-Hot Encoding Online | Mengaplikasikan `get_dummies` dan menyejajarkan kolom hasil encoding dengan `kolom_asli.pkl` agar dimensi input konsisten dengan saat training. |
| FR-ML-05 | SMOTE Pipeline Note | SMOTE hanya diterapkan pada data training di Colab. Inference engine menerima data mentah dan langsung menerapkan pipeline `scaler→reducer→model`. |
| FR-ML-06 | Health Check Endpoint | Endpoint `GET /health` mengembalikan status server dan daftar model yang berhasil dimuat untuk monitoring. |

---

## 4. Parameter Input Data & Aturan Validasi

Setiap request yang dikirimkan harus memenuhi struktur **19 fitur asli** berikut:

| Nama Fitur | Jenis Data | Pilihan Nilai / Batasan | Deskripsi |
|---|---|---|---|
| `gender` | Kategorikal | Female, Male | Jenis kelamin pelanggan |
| `SeniorCitizen` | Kategorikal | 0 (No), 1 (Yes) | Apakah pelanggan lansia |
| `Partner` | Kategorikal | No, Yes | Apakah memiliki pasangan |
| `Dependents` | Kategorikal | No, Yes | Apakah memiliki tanggungan keluarga |
| `tenure` | Numerik | Integer, Min: 0, Max: 100 | Durasi berlangganan (bulan) |
| `PhoneService` | Kategorikal | No, Yes | Memiliki layanan telepon |
| `MultipleLines` | Kategorikal | No, No phone service, Yes | Memiliki banyak saluran telepon |
| `InternetService` | Kategorikal | DSL, Fiber optic, No | Provider internet yang digunakan |
| `OnlineSecurity` | Kategorikal | No, No internet service, Yes | Berlangganan keamanan online |
| `OnlineBackup` | Kategorikal | No, No internet service, Yes | Berlangganan cadangan online |
| `DeviceProtection` | Kategorikal | No, No internet service, Yes | Berlangganan proteksi perangkat |
| `TechSupport` | Kategorikal | No, No internet service, Yes | Berlangganan dukungan teknis |
| `StreamingTV` | Kategorikal | No, No internet service, Yes | Menggunakan layanan streaming TV |
| `StreamingMovies` | Kategorikal | No, No internet service, Yes | Menggunakan layanan streaming film |
| `Contract` | Kategorikal | Month-to-month, One year, Two year | Jenis kontrak berlangganan |
| `PaperlessBilling` | Kategorikal | No, Yes | Menggunakan tagihan digital |
| `PaymentMethod` | Kategorikal | Electronic check, Mailed check, Bank transfer (automatic), Credit card (automatic) | Metode pembayaran |
| `MonthlyCharges` | Numerik | Float, Min: 0.0 | Biaya bulanan dalam USD |
| `TotalCharges` | Numerik | Float, Min: 0.0 | Total biaya yang telah dibayar |

---

## 5. Spesifikasi Kontrak API

### 5.1 Request: React → Node.js `(POST /api/predict-churn)`

**Header:** `Content-Type: application/json`

**Body:**
```json
{
  "model_choice": "KNN",
  "data": {
    "gender": "Male",
    "SeniorCitizen": 0,
    "Partner": "No",
    "Dependents": "No",
    "tenure": 2,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "DSL",
    "OnlineSecurity": "Yes",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "No",
    "StreamingMovies": "No",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Mailed check",
    "MonthlyCharges": 53.85,
    "TotalCharges": 108.15
  }
}
```

### 5.2 Response Sukses: FastAPI → Node.js → React

**Status Code:** `200 OK`

**Body:**
```json
{
  "prediction": 1,
  "probability": [0.35, 0.65],
  "label": "Churn",
  "model_used": "KNN"
}
```

**Keterangan field response:**
- `prediction`: `1` jika terindikasi akan Churn, `0` jika Tetap Berlangganan.
- `probability`: Array float — indeks `[0]` = probabilitas bertahan, indeks `[1]` = probabilitas Churn.
- `label`: String deskriptif `"Churn"` atau `"Tidak Churn"` untuk ditampilkan langsung di UI.
- `model_used`: Konfirmasi model yang digunakan untuk proses inferensi.

### 5.3 Response Error *(Baru di v2.0)*

| HTTP Code | Kondisi | Contoh Response Body |
|:---:|---|---|
| `400` | Field tidak lengkap / tipe salah | `{ "error": "Field tenure harus berupa integer non-negatif" }` |
| `422` | Validasi nilai gagal | `{ "error": "Nilai MonthlyCharges tidak boleh negatif" }` |
| `503` | ML Engine tidak tersedia / timeout | `{ "error": "ML Service tidak tersedia, coba beberapa saat lagi" }` |
| `500` | Internal server error | `{ "error": "Terjadi kesalahan pada server" }` |

---

## 6. Wireframe & Deskripsi Halaman UI *(Baru di v2.0)*

### 6.1 Layout Halaman Utama

```
┌─────────────────────────────────────────────────────────────────┐
│  🔷 NAVBAR  |  Telco Churn Predictor  |  [Pilih Model ▼]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   AREA INPUT FORM (19 field dalam 2 kolom)                       │
│   ┌──────────────────────┐  ┌──────────────────────┐            │
│   │ [dropdown gender   ] │  │ [input tenure      ] │            │
│   │ [dropdown Partner  ] │  │ [input MonthlyCharge]│            │
│   │ [dropdown Contract ] │  │ [input TotalCharges] │            │
│   │ ... dst ...          │  │ ... dst ...          │            │
│   └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│        [ 🔮 Prediksi Sekarang ]    [ 🔄 Reset Form ]             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   AREA HASIL PREDIKSI                                            │
│   ┌─────────────────────────────────────────────┐               │
│   │  ✅ TIDAK CHURN  (hijau)                     │               │
│   │  atau                                        │               │
│   │  ⚠️  CHURN  (merah)                          │               │
│   │                                              │               │
│   │  Probabilitas Churn: ████████░░  65%         │               │
│   │  Model Digunakan: KNN                        │               │
│   └─────────────────────────────────────────────┘               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER  |  © 2025 Kelompok Tubes Dasildat                       │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Deskripsi Komponen UI

| Komponen | Deskripsi Detail |
|---|---|
| **Navbar** | Logo di kiri, judul platform di tengah, dropdown pemilihan model (KNN/NN/SVM) di kanan dengan highlight warna saat dipilih. |
| **Form Input** | 19 field dalam layout 2 kolom. Dropdown dengan pilihan valid untuk field kategorikal. Slider dengan range untuk `tenure`. Input number dengan validasi min untuk `MonthlyCharges` dan `TotalCharges`. |
| **Tombol Prediksi** | Disabled dan tampilkan spinner saat loading. Re-enable setelah response diterima. Warna biru solid dengan hover effect. |
| **Kartu Hasil** | Muncul di bawah form setelah prediksi. Background hijau `#F0FDF4` untuk Tidak Churn, merah `#FFF5F5` untuk Churn. Menampilkan label, probabilitas, dan model yang digunakan. |
| **Progress Bar** | Visualisasi probabilitas churn dalam bentuk bar horizontal dengan warna gradasi hijau-merah berdasarkan nilai persentase. |
| **Pesan Error** | Toast notification di pojok kanan bawah untuk error validasi atau koneksi ke backend gagal. |

---

## 7. Kebutuhan Non-Fungsional

| Kategori | Target | Detail |
|---|---|---|
| **Performa** | Inference Latency < 500ms | Waktu dari request diterima FastAPI hingga response dikembalikan harus di bawah 500ms untuk pengalaman real-time. |
| **Ketersediaan** | Node.js tetap berjalan | Jika FastAPI mati, Node.js tetap merespons dengan pesan error informatif tanpa ikut crash. |
| **Keamanan** | HTTPS pada produksi | Seluruh parameter masukan terenkripsi menggunakan protokol HTTPS. API key tidak boleh di-hardcode di frontend. |
| **Maintainability** | Modular codebase | Setiap model ML menggunakan file `.pkl` terpisah sehingga model baru dapat ditambahkan tanpa mengubah arsitektur utama. |
| **Usability** | Mobile responsive | Tampilan form dan hasil prediksi harus responsif dan dapat digunakan pada layar smartphone (min-width 375px). |

---

## 8. Rencana Deployment Produksi *(Baru di v2.0)*

Seluruh service di-deploy ke platform cloud gratis yang mendukung CI/CD otomatis dari GitHub:

| Service | Platform | Harga | Cara Deploy |
|---|---|:---:|---|
| React.js (Frontend) | **Vercel** | Gratis | Push ke GitHub → Connect Vercel → Auto deploy on push |
| Node.js (Gateway) | **Render** | Gratis | Push ke GitHub → Connect Render → Start: `node index.js` |
| FastAPI (ML Engine) | **Render** | Gratis | Push ke GitHub → Connect Render → Start: `uvicorn main:app` |

### 8.1 Environment Variables yang Diperlukan

| Service | Variable | Nilai |
|---|---|---|
| Node.js | `FASTAPI_URL` | `https://nama-service.onrender.com` (URL FastAPI di Render) |
| Node.js | `PORT` | `5000` |
| React.js | `VITE_API_URL` | `https://nama-node-service.onrender.com` (URL Node.js di Render) |
| FastAPI | `MODEL_PATH` | `./models/` (path folder file .pkl) |

---

## 9. Rencana Tahapan Implementasi (Roadmap)

| Fase | Komponen | Sub-Task |
|---|---|---|
| **Fase 1** | Python FastAPI *(ML Engine)* | Buat struktur folder .pkl · Fungsi penataan kolom dari `kolom_asli.pkl` · Label Encoding manual · One-Hot Encoding online · Endpoint `POST /predict` · Endpoint `GET /health` · Testing via Swagger UI |
| **Fase 2** | Node.js Express *(Gateway)* | `npm init` & install dependencies · Setup CORS · Route `POST /api/predict-churn` · Proxy ke FastAPI via axios · Error handling mapping · Request logging middleware |
| **Fase 3** | React.js *(Frontend)* | Create React app & install axios · Komponen form 19 field · Dropdown model selector · Validasi input client-side · Loading state & spinner · Kartu hasil dengan indikator warna · Progress bar probabilitas · Toast error notification |
| **Fase 4** | Integration & Deployment | Testing end-to-end (React→Node→FastAPI) · Upload semua .pkl ke repo · Deploy FastAPI & Node.js ke Render · Deploy React ke Vercel · Set environment variables · Uji coba deployment publik |

### 9.1 Estimasi Waktu Pengerjaan

| Fase | Target Selesai | Penanggung Jawab | Dependensi |
|---|---|---|---|
| Fase 1 | Minggu 1 | Anggota B (SVM) + koordinasi | File .pkl dari Google Colab sudah tersedia |
| Fase 2 | Minggu 2 | Semua anggota | Fase 1 selesai dan FastAPI dapat berjalan lokal |
| Fase 3 | Minggu 2–3 | Semua anggota | Fase 2 selesai, endpoint Node.js dapat diakses |
| Fase 4 | Minggu 4 | Semua anggota | Semua fase sebelumnya selesai dan teruji lokal |

---

## 10. Pipeline ML & Penanganan Data *(Baru di v2.0)*

### 10.1 Pipeline Pelatihan Model (Google Colab)

| No | Tahap | Detail |
|:---:|---|---|
| 1 | Load & EDA | Memuat dataset Telco Customer Churn, eksplorasi distribusi fitur dan target. |
| 2 | Preprocessing | Drop `customerID`, perbaiki `TotalCharges` (missing value), Label Encoding fitur binary, One-Hot Encoding fitur multi-nilai. |
| 3 | Train-Test Split | Pembagian 70:30 dengan `stratify=y` untuk mempertahankan rasio kelas. |
| 4 | Feature Scaling | `StandardScaler` fit pada data training, transform pada training dan testing. |
| 5 | SMOTE | Oversampling data training saja (bukan testing) untuk menyeimbangkan kelas 73:27 menjadi 50:50. |
| 6 | Seleksi/Reduksi Fitur | KNN & SVM: PCA (`n_components=0.95`). NN: RFE dengan RandomForest (`n_features=15`). |
| 7 | Hyperparameter Tuning | `GridSearchCV` dengan `scoring=recall_macro`, `cv=5`. Parameter grid berbeda untuk setiap model. |
| 8 | Evaluasi | Classification Report, Confusion Matrix, AUPRC untuk setiap model. |
| 9 | Export .pkl | Simpan model, scaler, reducer (PCA/RFE), dan `kolom_asli` ke file `.pkl` terpisah per model. |

### 10.2 Pipeline Inferensi (FastAPI — Saat Prediksi)

Saat menerima request prediksi, FastAPI menjalankan pipeline berikut:

1. Terima data JSON mentah dari Node.js (19 fitur sebagai string/number).
2. Susun ulang kolom sesuai urutan `kolom_asli.pkl` menggunakan `pd.DataFrame`.
3. Terapkan Label Encoding manual untuk fitur binary (sorted alphabetically).
4. Terapkan One-Hot Encoding (`pd.get_dummies`) lalu sejajarkan kolom dengan training.
5. Terapkan `scaler.transform()` *(bukan fit_transform)* sesuai model yang dipilih.
6. Terapkan `reducer.transform()` (PCA atau RFE) sesuai model yang dipilih.
7. Jalankan `model.predict()` dan `model.predict_proba()` untuk mendapatkan hasil.
8. Kembalikan `prediction`, `probability`, `label`, dan `model_used` sebagai JSON.

---

*PRD v2.0 — Telco Customer Churn Prediction Platform | Tugas Besar Dasar Ilmu Data*
