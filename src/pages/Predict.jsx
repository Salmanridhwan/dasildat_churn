import { useState } from 'react';
import ModelSelector from '../components/ModelSelector';
import PredictionForm from '../components/PredictionForm';
import ResultCard from '../components/ResultCard';

export default function Predict() {
  const [modelChoice, setModelChoice] = useState('NN');
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_choice: modelChoice, data: formData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada server');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="predict-container-v2">

      {/* ── Page Header ── */}
      <div className="predict-header-v2">
        <div>
          <h1 className="page-title">Mesin Prediksi</h1>
          <p className="page-subtitle">Pilih model ML dan masukkan profil pelanggan untuk memprediksi kemungkinan churn.</p>
        </div>
      </div>

      {/* ── Side-by-side Layout ── */}
      <div className="predict-split-layout">

        {/* LEFT — Form Input */}
        <main className="predict-right-panel">
          <div className="panel-heading">
            <span className="panel-icon">📋</span>
            <h3>Profil Pelanggan</h3>
          </div>
          <PredictionForm
            onSubmit={handleSubmit}
            onReset={handleReset}
            loading={loading}
            modelChoice={modelChoice}
            onModelChange={setModelChoice}
          />
        </main>

        {/* RIGHT — Hasil Prediksi */}
        <aside className="predict-left-panel">
          <div className="panel-heading">
            <span className="panel-icon">📈</span>
            <h3>Hasil Prediksi</h3>
          </div>

          {!result && !error && !loading && (
            <div className="empty-result-state">
              <div className="empty-result-illustration">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" stroke="rgba(99,102,241,0.3)" strokeWidth="2" strokeDasharray="6 4"/>
                  <circle cx="32" cy="22" r="8" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5"/>
                  <path d="M16 46c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="empty-result-title">Belum Ada Prediksi</p>
              <p className="empty-result-sub">Isi form profil pelanggan di sebelah kiri, lalu klik <strong>Prediksi Sekarang</strong>.</p>
            </div>
          )}

          {loading && (
            <div className="loading-result-state">
              <div className="loading-spinner-lg" />
              <p className="loading-text">Sedang menganalisis data...</p>
              <p className="loading-sub">Model ML sedang memproses profil pelanggan</p>
            </div>
          )}

          {error && (
            <div className="toast-error" style={{ marginTop: 0 }}>
              ⚠️ {error}
            </div>
          )}

          {result && (
            <div className="result-animate-in">
              <ResultCard result={result} />
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}
