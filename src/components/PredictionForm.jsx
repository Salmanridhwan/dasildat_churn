import { useState } from 'react'

/**
 * PredictionForm.jsx
 * FR-FE-01: 19 field input interaktif sesuai PRD Section 4
 * FR-FE-02: Model selector (KNN, NN, SVM) sebagai card visual
 * FR-FE-03: Validasi client-side
 * FR-FE-05: Loading state
 * FR-FE-06: Reset form
 * Tambahan: Tab "Jenis Prediksi" untuk memfilter field yang ditampilkan
 */

// ─── Model ML yang tersedia ───
const MODELS = [
  {
    value: 'KNN',
    label: 'K-Nearest Neighbors',
    short: 'KNN',
    icon: '🔵',
    desc: 'Klasifikasi berdasarkan kedekatan data tetangga',
  },
  {
    value: 'NN',
    label: 'Neural Network',
    short: 'MLP',
    icon: '🧠',
    desc: 'Jaringan saraf tiruan dengan hidden layers',
  },
  {
    value: 'SVM',
    label: 'Support Vector Machine',
    short: 'SVM',
    icon: '⚡',
    desc: 'Memisahkan kelas dengan hyperplane optimal',
  },
]

// ─── Definisi semua 19 field sesuai PRD Section 4 ───
const FORM_FIELDS = [
  // Kategorikal
  { name: 'gender',          label: 'Jenis Kelamin',             type: 'select', options: ['Female', 'Male'] },
  { name: 'SeniorCitizen',   label: 'Lansia',                    type: 'select', options: [{ v: 0, l: 'Tidak (No)' }, { v: 1, l: 'Ya (Yes)' }] },
  { name: 'Partner',         label: 'Punya Pasangan',            type: 'select', options: ['No', 'Yes'] },
  { name: 'Dependents',      label: 'Punya Tanggungan',          type: 'select', options: ['No', 'Yes'] },
  { name: 'PhoneService',    label: 'Layanan Telepon',           type: 'select', options: ['No', 'Yes'] },
  { name: 'MultipleLines',   label: 'Banyak Saluran Telepon',    type: 'select', options: ['No', 'No phone service', 'Yes'] },
  { name: 'InternetService', label: 'Provider Internet',         type: 'select', options: ['DSL', 'Fiber optic', 'No'], importantInfo: 'Pengguna Fiber Optic memiliki tren churn historis yang lebih tinggi.' },
  { name: 'OnlineSecurity',  label: 'Keamanan Online',           type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'OnlineBackup',    label: 'Backup Online',             type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'DeviceProtection',label: 'Proteksi Perangkat',        type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'TechSupport',     label: 'Dukungan Teknis',           type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'StreamingTV',     label: 'Streaming TV',              type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'StreamingMovies', label: 'Streaming Film',            type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'Contract',        label: 'Jenis Kontrak',             type: 'select', options: ['Month-to-month', 'One year', 'Two year'], importantInfo: 'Kontrak bulanan sangat rentan terhadap churn dibandingkan kontrak jangka panjang.' },
  { name: 'PaperlessBilling',label: 'Tagihan Digital',           type: 'select', options: ['No', 'Yes'] },
  { name: 'PaymentMethod',   label: 'Metode Pembayaran',         type: 'select', options: ['Bank transfer (automatic)', 'Credit card (automatic)', 'Electronic check', 'Mailed check'] },
  // Numerik
  { name: 'tenure',          label: 'Durasi Berlangganan (bln)', type: 'number', min: 0, max: 100, step: 1, importantInfo: 'Pelanggan baru (tenure rendah) adalah kelompok paling berisiko untuk churn.' },
  { name: 'MonthlyCharges',  label: 'Biaya Bulanan (USD)',       type: 'number', min: 0, step: 0.01, importantInfo: 'Biaya bulanan yang tinggi seringkali memicu keputusan untuk churn.' },
  { name: 'TotalCharges',    label: 'Total Biaya (USD)',         type: 'number', min: 0, step: 0.01, importantInfo: 'Mencerminkan nilai retensi jangka panjang pelanggan.' },
]

// ─── Jenis Prediksi: menentukan field mana yang ditampilkan ───
const PREDICTION_TYPES = [
  {
    id: 'all',
    label: 'Semua Layanan',
    icon: '🔮',
    desc: 'Prediksi lengkap dengan semua 19 atribut pelanggan',
    fields: null, // null = tampilkan semua
  },
  {
    id: 'streaming',
    label: 'Streaming',
    icon: '🎬',
    desc: 'Fokus pada layanan Streaming TV & Film',
    fields: [
      'InternetService', 'StreamingTV', 'StreamingMovies',
      'Contract', 'MonthlyCharges', 'TotalCharges', 'tenure',
    ],
  },
  {
    id: 'internet',
    label: 'Provider Internet',
    icon: '🌐',
    desc: 'Fokus pada layanan internet & keamanan digital',
    fields: [
      'InternetService', 'OnlineSecurity', 'OnlineBackup',
      'DeviceProtection', 'TechSupport',
      'Contract', 'MonthlyCharges', 'TotalCharges', 'tenure',
    ],
  },
  {
    id: 'phone',
    label: 'Telepon',
    icon: '📞',
    desc: 'Fokus pada layanan telepon & saluran',
    fields: [
      'PhoneService', 'MultipleLines',
      'Contract', 'MonthlyCharges', 'TotalCharges', 'tenure',
    ],
  },
  {
    id: 'billing',
    label: 'Tagihan & Kontrak',
    icon: '💳',
    desc: 'Fokus pada metode pembayaran & jenis kontrak',
    fields: [
      'Contract', 'PaperlessBilling', 'PaymentMethod',
      'MonthlyCharges', 'TotalCharges', 'tenure',
    ],
  },
  {
    id: 'demographic',
    label: 'Demografis',
    icon: '👤',
    desc: 'Fokus pada profil demografis pelanggan',
    fields: [
      'gender', 'SeniorCitizen', 'Partner', 'Dependents',
      'Contract', 'MonthlyCharges', 'TotalCharges', 'tenure',
    ],
  },
]

// Default values untuk semua field
const DEFAULT_VALUES = {
  gender: 'Male',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'DSL',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Mailed check',
  tenure: '',
  MonthlyCharges: '',
  TotalCharges: '',
}

function PredictionForm({ onSubmit, onReset, loading, modelChoice, onModelChange }) {
  const [formData, setFormData]               = useState(DEFAULT_VALUES)
  const [validationErrors, setValidationErrors] = useState({})
  const [predType, setPredType]               = useState('all')

  // Field yang ditampilkan berdasarkan jenis prediksi
  const activeType    = PREDICTION_TYPES.find(t => t.id === predType)
  const visibleFields = activeType.fields
    ? FORM_FIELDS.filter(f => activeType.fields.includes(f.name))
    : FORM_FIELDS

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'SeniorCitizen' || name === 'tenure' || name === 'MonthlyCharges' || name === 'TotalCharges'
        ? (value === '' ? '' : Number(value))
        : value
    }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleTypeChange = (typeId) => {
    setPredType(typeId)
    setValidationErrors({})
  }

  // FR-FE-03: Validasi hanya field yang ditampilkan (numerik)
  const validate = () => {
    const errors = {}
    const numericVisible = visibleFields.filter(f => f.type === 'number').map(f => f.name)

    if (numericVisible.includes('tenure') && (formData.tenure === '' || formData.tenure < 0 || formData.tenure > 100)) {
      errors.tenure = 'Tenure harus antara 0–100 bulan'
    }
    if (numericVisible.includes('MonthlyCharges') && (formData.MonthlyCharges === '' || formData.MonthlyCharges < 0)) {
      errors.MonthlyCharges = 'Biaya bulanan tidak boleh negatif atau kosong'
    }
    if (numericVisible.includes('TotalCharges') && (formData.TotalCharges === '' || formData.TotalCharges < 0)) {
      errors.TotalCharges = 'Total biaya tidak boleh negatif atau kosong'
    }
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    onSubmit(formData)
  }

  const handleReset = () => {
    setFormData(DEFAULT_VALUES)
    setValidationErrors({})
    onReset()
  }

  return (
    <form className="prediction-form" onSubmit={handleSubmit}>

      {/* ── Pilihan Model ML ── */}
      <div className="model-card-section">
        <p className="pred-type-heading">🤖 Model Machine Learning</p>
        <div className="model-card-grid">
          {MODELS.map(m => (
            <button
              key={m.value}
              type="button"
              className={`model-card ${modelChoice === m.value ? 'active' : ''}`}
              onClick={() => onModelChange(m.value)}
            >
              <span className="model-card-icon">{m.icon}</span>
              <span className="model-card-short">{m.short}</span>
              <span className="model-card-label">{m.label}</span>
              <span className="model-card-desc">{m.desc}</span>
              {modelChoice === m.value && (
                <span className="model-card-check">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Jenis Prediksi Tabs ── */}
      <div className="pred-type-section">
        <p className="pred-type-heading">🎯 Jenis Prediksi</p>
        <div className="pred-type-tabs">
          {PREDICTION_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              className={`pred-type-tab ${predType === t.id ? 'active' : ''}`}
              onClick={() => handleTypeChange(t.id)}
            >
              <span className="pred-tab-icon">{t.icon}</span>
              <span className="pred-tab-label">{t.label}</span>
            </button>
          ))}
        </div>
        <p className="pred-type-desc">{activeType.desc}</p>
        {activeType.fields && (
          <div className="pred-type-badge-row">
            {activeType.fields.map(f => {
              const field = FORM_FIELDS.find(ff => ff.name === f)
              return field
                ? <span key={f} className="pred-field-badge">{field.label}</span>
                : null
            })}
          </div>
        )}
      </div>

      {/* ── Grid Field ── */}
      <div className="form-grid">
        {visibleFields.map((field) => (
          <div className="form-field" key={field.name}>
            <label 
              htmlFor={`field-${field.name}`}
              style={field.importantInfo ? { color: '#fbbf24', fontWeight: '600' } : {}}
            >
              {field.label}
              {field.importantInfo && (
                <span 
                  title={field.importantInfo} 
                  style={{ cursor: 'help', color: '#f59e0b', marginLeft: '6px', fontSize: '1.1em' }}
                >
                  ⓘ
                </span>
              )}
            </label>

            {field.type === 'select' ? (
              <select
                id={`field-${field.name}`}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
              >
                {field.options.map((opt) => {
                  const val = typeof opt === 'object' ? opt.v : opt
                  const lbl = typeof opt === 'object' ? opt.l : opt
                  return <option key={val} value={val}>{lbl}</option>
                })}
              </select>
            ) : (
              <input
                id={`field-${field.name}`}
                type="number"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={`Min: ${field.min}`}
              />
            )}

            {validationErrors[field.name] && (
              <span className="field-error">{validationErrors[field.name]}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Tombol Aksi ── */}
      <div className="form-actions">
        <button
          id="btn-predict"
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? '⏳ Memproses...' : '🔮 Prediksi Sekarang'}
        </button>
        <button
          id="btn-reset"
          type="button"
          onClick={handleReset}
          className="btn-secondary"
        >
          🔄 Reset Form
        </button>
      </div>
    </form>
  )
}

export default PredictionForm
