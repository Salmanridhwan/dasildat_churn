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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/predict-churn`, {
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
    <div className="predict-container">
      <div className="page-header predict-header">
        <div>
          <h1 className="page-title">Mesin Prediksi</h1>
          <p className="page-subtitle">Pilih model ML dan masukkan profil pelanggan.</p>
        </div>
        <div className="model-selector-wrapper">
          <ModelSelector value={modelChoice} onChange={setModelChoice} />
        </div>
      </div>

      <div className="predict-content">
        <PredictionForm
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={loading}
        />

        {error && (
          <div className="toast-error">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="result-wrapper">
            <ResultCard result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
