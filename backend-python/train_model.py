import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from imblearn.over_sampling import SMOTE

# Path dataset
DATASET_PATH = "../WA_Fn-UseC_-Telco-Customer-Churn.csv"

def main():
    print("[TRAIN] Memulai proses training ML secara lokal...")

    # 1. Load Data
    if not os.path.exists(DATASET_PATH):
        print(f"[ERROR] Dataset tidak ditemukan di {DATASET_PATH}")
        return
    
    df = pd.read_csv(DATASET_PATH)
    print(f"[OK] Dataset berhasil diload: {df.shape[0]} baris, {df.shape[1]} kolom")

    # 2. Preprocessing
    # Drop customerID
    df.drop('customerID', axis=1, inplace=True)

    # Perbaiki TotalCharges (gunakan reassignment untuk menghindari ChainedAssignmentError/NaN)
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
    df['TotalCharges'] = df['TotalCharges'].fillna(df['TotalCharges'].median())

    # Encode target
    df['Churn'] = df['Churn'].map({'Yes': 1, 'No': 0})

    # Simpan urutan kolom asli SEBELUM encoding
    X = df.drop('Churn', axis=1)
    y = df['Churn']
    kolom_asli = list(X.columns)
    
    # Buat direktori jika belum ada
    os.makedirs("models", exist_ok=True)
    os.makedirs("scalers", exist_ok=True)
    os.makedirs("reducers", exist_ok=True)
    joblib.dump(kolom_asli, 'kolom_asli.pkl')
    print("[OK] kolom_asli.pkl berhasil disimpan")

    # 3. Label Encoding (binary) dan One-Hot Encoding (multi)
    binary_cols = ["Partner", "Dependents", "PhoneService", "PaperlessBilling"]
    for col in binary_cols:
        df[col] = df[col].map({"No": 0, "Yes": 1})
    df["gender"] = df["gender"].map({"Female": 0, "Male": 1})
    
    # One Hot Encoding
    df = pd.get_dummies(df)
    
    X = df.drop('Churn', axis=1)
    y = df['Churn']

    # 4. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )

    # 5. SMOTE (Oversampling HANYA di training)
    print("[INFO] Menerapkan SMOTE...")
    smote = SMOTE(random_state=42)
    X_train_sm, y_train_sm = smote.fit_resample(X_train, y_train)

    # ---------------------------------------------------------
    # MODEL 1: K-Nearest Neighbors (KNN) + PCA
    # ---------------------------------------------------------
    print("\n[KNN] Training Model KNN...")
    scaler_knn = StandardScaler()
    X_train_knn = scaler_knn.fit_transform(X_train_sm)
    
    pca_knn = PCA(n_components=0.95, random_state=42)
    X_train_knn_pca = pca_knn.fit_transform(X_train_knn)

    param_knn = {'n_neighbors': [5, 7], 'weights': ['uniform']}
    model_knn = GridSearchCV(KNeighborsClassifier(), param_knn, scoring='recall_macro', cv=3)
    model_knn.fit(X_train_knn_pca, y_train_sm)

    joblib.dump(scaler_knn, 'scalers/scaler_knn.pkl')
    joblib.dump(pca_knn, 'reducers/pca_knn.pkl')
    joblib.dump(model_knn.best_estimator_, 'models/model_knn_pca.pkl')
    print("[OK] Model KNN berhasil ditraining dan disimpan")

    # ---------------------------------------------------------
    # MODEL 2: Neural Network (MLP) + RFE
    # ---------------------------------------------------------
    print("\n[NN] Training Model Neural Network...")
    scaler_nn = StandardScaler()
    X_train_nn = scaler_nn.fit_transform(X_train_sm)
    
    rfe_nn = RFE(estimator=RandomForestClassifier(n_estimators=50, random_state=42), n_features_to_select=15)
    X_train_nn_rfe = rfe_nn.fit_transform(X_train_nn, y_train_sm)

    model_nn = MLPClassifier(hidden_layer_sizes=(64,32), max_iter=300, random_state=42)
    model_nn.fit(X_train_nn_rfe, y_train_sm)

    joblib.dump(scaler_nn, 'scalers/scaler_nn.pkl')
    joblib.dump(rfe_nn, 'reducers/rfe_nn.pkl')
    joblib.dump(model_nn, 'models/model_nn.pkl')
    print("[OK] Model NN berhasil ditraining dan disimpan")

    # ---------------------------------------------------------
    # MODEL 3: Support Vector Machine (SVM) + PCA
    # ---------------------------------------------------------
    print("\n[SVM] Training Model SVM...")
    scaler_svm = StandardScaler()
    X_train_svm = scaler_svm.fit_transform(X_train_sm)
    
    pca_svm = PCA(n_components=0.95, random_state=42)
    X_train_svm_pca = pca_svm.fit_transform(X_train_svm)

    model_svm = SVC(C=1.0, kernel='rbf', probability=True, random_state=42)
    model_svm.fit(X_train_svm_pca, y_train_sm)

    joblib.dump(scaler_svm, 'scalers/scaler_svm.pkl')
    joblib.dump(pca_svm, 'reducers/pca_svm.pkl')
    joblib.dump(model_svm, 'models/model_svm_pca.pkl')
    print("[OK] Model SVM berhasil ditraining dan disimpan")

    print("\n[FINISHED] SEMUA PROSES SELESAI! File .pkl berhasil diperbarui di folder lokal.")

if __name__ == "__main__":
    main()
