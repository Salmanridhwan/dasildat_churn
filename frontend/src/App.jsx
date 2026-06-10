import { useState } from 'react'
import ModelSelector from './components/ModelSelector'
import PredictionForm from './components/PredictionForm'
import ResultCard from './components/ResultCard'

// TODO: Implementasikan styling lengkap di fase 3

function App() {
  const [modelChoice, setModelChoice] = useState('NN')  // Default: Neural Network
  const [result, setResult]           = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${apiUrl}/api/predict-churn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_choice: modelChoice, data: formData })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada server')
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">📡 Telco Churn Predictor</div>
        <ModelSelector value={modelChoice} onChange={setModelChoice} />
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <PredictionForm
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={loading}
        />

        {/* Error Toast */}
        {error && (
          <div className="toast-error">
            ⚠️ {error}
          </div>
        )}

        {/* Result Card */}
        {result && <ResultCard result={result} />}
      </main>

      {/* Footer */}
      <footer className="footer">
        © 2025 Kelompok Tubes Dasildat
      </footer>
    </div>
  )
}

export default App
