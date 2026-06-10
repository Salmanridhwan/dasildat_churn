/**
 * ResultCard.jsx
 * FR-FE-04: Kartu hasil prediksi dengan indikator warna dan progress bar
 * TODO: Implementasikan styling lengkap di fase 3
 */

function ResultCard({ result }) {
  const { prediction, probability, label, model_used } = result
  const isChurn       = prediction === 1
  const churnProb     = Math.round(probability[1] * 100)
  const retainProb    = Math.round(probability[0] * 100)

  const cardStyle = {
    backgroundColor: isChurn ? '#FFF5F5' : '#F0FDF4',
    border: `2px solid ${isChurn ? '#FCA5A5' : '#86EFAC'}`,
    borderRadius: '12px',
    padding: '24px',
    marginTop: '24px',
  }

  return (
    <div id="result-card" className="result-card" style={cardStyle}>
      {/* Label Utama */}
      <h2 className="result-label" style={{ color: isChurn ? '#DC2626' : '#16A34A', fontSize: '1.8rem', marginBottom: '12px' }}>
        {isChurn ? '⚠️  CHURN' : '✅  TIDAK CHURN'}
      </h2>

      {/* Model yang Digunakan */}
      <p className="result-model" style={{ color: '#64748B', marginBottom: '16px' }}>
        Model: <strong>{model_used}</strong>
      </p>

      {/* Progress Bar — Probabilitas Churn */}
      <div className="probability-section">
        <p style={{ marginBottom: '8px', fontWeight: 600 }}>Probabilitas Churn: {churnProb}%</p>
        <div className="progress-bar-track" style={{
          background: '#E2E8F0',
          borderRadius: '999px',
          height: '16px',
          overflow: 'hidden'
        }}>
          <div
            id="progress-bar-fill"
            className="progress-bar-fill"
            style={{
              width: `${churnProb}%`,
              height: '100%',
              background: `linear-gradient(90deg, #22C55E 0%, #EF4444 100%)`,
              borderRadius: '999px',
              transition: 'width 0.6s ease'
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.85rem', color: '#64748B' }}>
          <span>Bertahan: {retainProb}%</span>
          <span>Churn: {churnProb}%</span>
        </div>
      </div>
    </div>
  )
}

export default ResultCard
