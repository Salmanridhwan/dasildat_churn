import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, Server, Database, Brain, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">Tugas Besar Dasar Ilmu Data</span>
          <h1 className="hero-title">
            Analisis & Prediksi <span className="gradient-text">Telco Churn</span>
          </h1>
          <p className="hero-subtitle">
            Platform berbasis Machine Learning untuk memproyeksikan potensi kehilangan pelanggan (*churn*) pada industri telekomunikasi secara akurat dan cepat.
          </p>
          <div className="hero-actions">
            <Link to="/predict" className="btn-primary btn-large flex-btn">
              Mulai Prediksi <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="btn-secondary btn-large">
              Eksplorasi Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Apa itu Churn Section */}
      <section className="info-section">
        <div className="info-grid">
          <div className="info-text-card">
            <h2 className="section-title">Apa itu Customer Churn?</h2>
            <p>
              <strong>Customer Churn</strong> (atau atrisi pelanggan) adalah kondisi di mana pelanggan memutuskan untuk berhenti menggunakan layanan dari suatu perusahaan telekomunikasi dan beralih ke kompetitor.
            </p>
            <p>
              Mempertahankan pelanggan lama jauh lebih efisien secara biaya dibandingkan mencari pelanggan baru. Aplikasi ini dirancang untuk mendeteksi profil pelanggan yang berpotensi *churn* lebih awal sehingga perusahaan dapat mengambil tindakan preventif (seperti menawarkan promo khusus atau meningkatkan kualitas layanan).
            </p>
          </div>
          <div className="info-stat-card">
            <div className="stat-item">
              <span className="stat-number">26.5%</span>
              <span className="stat-label">Rata-rata Churn Rate Pelanggan</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5x</span>
              <span className="stat-label">Biaya Akuisisi vs Retensi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Sistem */}
      <section className="workflow-section">
        <h2 className="section-title text-center">Bagaimana Sistem Ini Bekerja?</h2>
        <p className="section-subtitle-sub text-center">Arsitektur End-to-End pemrosesan data dan model Machine Learning.</p>
        
        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="workflow-num">1</div>
            <div className="workflow-icon"><Database size={24} /></div>
            <h4>Input Profil Pelanggan</h4>
            <p>Pengguna memasukkan parameter layanan pelanggan seperti jenis kontrak, metode pembayaran, masa berlangganan (tenure), dan tagihan bulanan.</p>
          </div>
          
          <div className="workflow-card">
            <div className="workflow-num">2</div>
            <div className="workflow-icon"><Server size={24} /></div>
            <h4>API Gateway (Node.js)</h4>
            <p>Data dikirimkan ke server Node.js/Express, yang memvalidasi data dan meneruskannya secara aman ke backend Machine Learning.</p>
          </div>

          <div className="workflow-card">
            <div className="workflow-num">3</div>
            <div className="workflow-icon"><Brain size={24} /></div>
            <h4>ML Inference (FastAPI)</h4>
            <p>Model Python memuat pkl model (KNN, SVM, atau Neural Network) untuk melakukan preprocessing (scale & PCA) lalu memprediksi kemungkinan churn.</p>
          </div>
        </div>
      </section>

      {/* Model yang Tersedia */}
      <section className="models-showcase">
        <h2 className="section-title text-center">Algoritma Machine Learning</h2>
        <div className="models-grid">
          <div className="model-info-card">
            <h3>Neural Network (NN)</h3>
            <p>Model Deep Learning (Multi-Layer Perceptron) dengan optimasi RFE untuk menangkap pola non-linear kompleks pada dataset churn.</p>
          </div>
          <div className="model-info-card">
            <h3>Support Vector Machine (SVM)</h3>
            <p>Model klasifikasi tangguh yang memisahkan data menggunakan hyperplane optimal dalam ruang fitur berdimensi tinggi pasca-PCA.</p>
          </div>
          <div className="model-info-card">
            <h3>K-Nearest Neighbors (KNN)</h3>
            <p>Algoritma berbasis kedekatan jarak untuk mengklasifikasikan churn berdasarkan kemiripan profil dengan kluster data latih.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
