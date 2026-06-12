/**
 * ResultCard.jsx
 * FR-FE-04: Kartu hasil prediksi dengan indikator warna dan progress bar
 * Redesigned: Detail lengkap, animasi, dan tampilan premium
 */

import { useEffect, useState } from 'react'

// Interpretasi level risiko berdasarkan probabilitas churn
function getRiskLevel(churnProb) {
  if (churnProb >= 80) return { level: 'Sangat Tinggi', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '🔴' }
  if (churnProb >= 60) return { level: 'Tinggi',        color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '🟠' }
  if (churnProb >= 40) return { level: 'Sedang',        color: '#eab308', bg: 'rgba(234,179,8,0.12)',  icon: '🟡' }
  if (churnProb >= 20) return { level: 'Rendah',        color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: '🟢' }
  return               { level: 'Sangat Rendah',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '🔵' }
}

// Rekomendasi tindakan berdasarkan prediksi
function getRecommendations(isChurn, churnProb) {
  if (!isChurn) {
    return [
      { icon: '🎁', text: 'Pertahankan pelanggan dengan program loyalitas atau diskon khusus' },
      { icon: '📞', text: 'Lakukan check-in rutin untuk memastikan kepuasan layanan' },
      { icon: '⭐', text: 'Tawarkan upgrade layanan sesuai kebutuhan pelanggan' },
    ]
  }
  if (churnProb >= 80) {
    return [
      { icon: '🚨', text: 'Hubungi pelanggan SEGERA — risiko kehilangan sangat tinggi' },
      { icon: '💰', text: 'Tawarkan diskon signifikan atau paket retensi eksklusif' },
      { icon: '🔄', text: 'Evaluasi kontrak dan tawarkan opsi pembaruan yang lebih fleksibel' },
    ]
  }
  return [
    { icon: '📋', text: 'Jadwalkan sesi konsultasi dengan tim customer success' },
    { icon: '🎯', text: 'Identifikasi pain point utama dan tawarkan solusi tepat sasaran' },
    { icon: '💬', text: 'Kirimkan survei kepuasan untuk mengetahui kebutuhan lebih lanjut' },
  ]
}

function ResultCard({ result }) {
  const { prediction, probability, label, model_used } = result
  const isChurn    = prediction === 1
  const churnProb  = Math.round(probability[1] * 100)
  const retainProb = Math.round(probability[0] * 100)
  const risk       = getRiskLevel(churnProb)
  const recs       = getRecommendations(isChurn, churnProb)

  // Animasi bar progres setelah mount
  const [animatedChurn,  setAnimatedChurn]  = useState(0)
  const [animatedRetain, setAnimatedRetain] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimatedChurn(churnProb)
      setAnimatedRetain(retainProb)
    }, 120)
    return () => clearTimeout(t)
  }, [churnProb, retainProb])

  return (
    <div id="result-card" className={`result-card-v2 ${isChurn ? 'churn' : 'retain'}`}>

      {/* ── Header ── */}
      <div className="rc-header">
        <div className="rc-verdict-badge" style={{ background: isChurn ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)', borderColor: isChurn ? '#ef4444' : '#22c55e' }}>
          <span className="rc-verdict-icon">{isChurn ? '⚠️' : '✅'}</span>
          <span className="rc-verdict-text" style={{ color: isChurn ? '#fca5a5' : '#86efac' }}>
            {isChurn ? 'CHURN' : 'TIDAK CHURN'}
          </span>
        </div>
        <div className="rc-model-badge">
          <span className="rc-model-label">Model</span>
          <span className="rc-model-name">{model_used}</span>
        </div>
      </div>

      {/* ── Probabilitas Utama ── */}
      <div className="rc-prob-section">
        <div className="rc-big-number" style={{ color: isChurn ? '#f87171' : '#4ade80' }}>
          {churnProb}<span className="rc-percent">%</span>
        </div>
        <p className="rc-prob-label">Probabilitas Churn</p>

        {/* Dual Progress Bar */}
        <div className="rc-dual-bar-wrap">
          <div className="rc-dual-bar-track">
            <div
              className="rc-dual-bar-fill retain"
              style={{ width: `${animatedRetain}%`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
            />
            <div
              className="rc-dual-bar-fill churn"
              style={{ width: `${animatedChurn}%`, left: `${animatedRetain}%`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1) 0.1s, left 0.8s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </div>
          <div className="rc-dual-bar-labels">
            <span><span className="rc-dot retain" />Bertahan: <strong>{retainProb}%</strong></span>
            <span><span className="rc-dot churn" />Churn: <strong>{churnProb}%</strong></span>
          </div>
        </div>
      </div>

      {/* ── Level Risiko ── */}
      <div className="rc-risk-row" style={{ background: risk.bg, borderColor: risk.color }}>
        <span className="rc-risk-icon">{risk.icon}</span>
        <div>
          <p className="rc-risk-title">Tingkat Risiko Churn</p>
          <p className="rc-risk-level" style={{ color: risk.color }}>{risk.level}</p>
        </div>
        <div className="rc-risk-gauge">
          <svg viewBox="0 0 80 40" width="80" height="40">
            <path d="M5 35 A35 35 0 0 1 75 35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round"/>
            <path
              d="M5 35 A35 35 0 0 1 75 35"
              fill="none"
              stroke={risk.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${animatedChurn * 1.1} 110`}
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
        </div>
      </div>

      {/* ── Interpretasi ── */}
      <div className="rc-interpretation">
        <h4 className="rc-section-title">📊 Interpretasi Hasil</h4>
        <p className="rc-interp-text">
          {isChurn ? (
            <>
              Pelanggan ini memiliki kemungkinan <strong style={{ color: '#f87171' }}>{churnProb}%</strong> untuk
              berhenti berlangganan.{' '}
              {churnProb >= 80
                ? 'Tindakan retensi mendesak sangat diperlukan.'
                : 'Disarankan segera melakukan intervensi retensi.'}
            </>
          ) : (
            <>
              Pelanggan ini berpotensi <strong style={{ color: '#4ade80' }}>{retainProb}%</strong> untuk tetap
              setia. Pertahankan kualitas layanan untuk menjaga loyalitas jangka panjang.
            </>
          )}
        </p>
      </div>

      {/* ── Rekomendasi ── */}
      <div className="rc-recommendations">
        <h4 className="rc-section-title">💡 Rekomendasi Tindakan</h4>
        <ul className="rc-rec-list">
          {recs.map((r, i) => (
            <li key={i} className="rc-rec-item">
              <span className="rc-rec-icon">{r.icon}</span>
              <span>{r.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Confidence Info ── */}
      <div className="rc-confidence-row">
        <div className="rc-conf-chip">
          <span className="rc-conf-label">Confidence Score</span>
          <span className="rc-conf-value">{Math.max(churnProb, retainProb)}%</span>
        </div>
        <div className="rc-conf-chip">
          <span className="rc-conf-label">Status Prediksi</span>
          <span className="rc-conf-value" style={{ color: Math.max(churnProb, retainProb) >= 70 ? '#4ade80' : '#facc15' }}>
            {Math.max(churnProb, retainProb) >= 70 ? 'Tinggi Keyakinan' : 'Perlu Validasi'}
          </span>
        </div>
      </div>

    </div>
  )
}

export default ResultCard
