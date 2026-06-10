import { useState } from 'react'

/**
 * PredictionForm.jsx
 * FR-FE-01: 19 field input interaktif sesuai PRD Section 4
 * FR-FE-03: Validasi client-side
 * FR-FE-05: Loading state
 * FR-FE-06: Reset form
 * TODO: Implementasikan styling dan komponen lengkap di fase 3
 */

// ─── Definisi semua 19 field sesuai PRD Section 4 ───
const FORM_FIELDS = [
  // Kategorikal
  { name: 'gender',          label: 'Jenis Kelamin',          type: 'select', options: ['Female', 'Male'] },
  { name: 'SeniorCitizen',   label: 'Lansia',                 type: 'select', options: [{ v: 0, l: 'Tidak (No)' }, { v: 1, l: 'Ya (Yes)' }] },
  { name: 'Partner',         label: 'Punya Pasangan',         type: 'select', options: ['No', 'Yes'] },
  { name: 'Dependents',      label: 'Punya Tanggungan',       type: 'select', options: ['No', 'Yes'] },
  { name: 'PhoneService',    label: 'Layanan Telepon',        type: 'select', options: ['No', 'Yes'] },
  { name: 'MultipleLines',   label: 'Banyak Saluran',         type: 'select', options: ['No', 'No phone service', 'Yes'] },
  { name: 'InternetService', label: 'Provider Internet',      type: 'select', options: ['DSL', 'Fiber optic', 'No'] },
  { name: 'OnlineSecurity',  label: 'Keamanan Online',        type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'OnlineBackup',    label: 'Backup Online',          type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'DeviceProtection',label: 'Proteksi Perangkat',     type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'TechSupport',     label: 'Dukungan Teknis',        type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'StreamingTV',     label: 'Streaming TV',           type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'StreamingMovies', label: 'Streaming Film',         type: 'select', options: ['No', 'No internet service', 'Yes'] },
  { name: 'Contract',        label: 'Jenis Kontrak',          type: 'select', options: ['Month-to-month', 'One year', 'Two year'] },
  { name: 'PaperlessBilling',label: 'Tagihan Digital',        type: 'select', options: ['No', 'Yes'] },
  { name: 'PaymentMethod',   label: 'Metode Pembayaran',      type: 'select', options: ['Bank transfer (automatic)', 'Credit card (automatic)', 'Electronic check', 'Mailed check'] },
  // Numerik
  { name: 'tenure',          label: 'Durasi Berlangganan (bln)', type: 'number', min: 0, max: 100, step: 1 },
  { name: 'MonthlyCharges',  label: 'Biaya Bulanan (USD)',    type: 'number', min: 0, step: 0.01 },
  { name: 'TotalCharges',    label: 'Total Biaya (USD)',      type: 'number', min: 0, step: 0.01 },
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

function PredictionForm({ onSubmit, onReset, loading }) {
  const [formData, setFormData] = useState(DEFAULT_VALUES)
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'SeniorCitizen' || name === 'tenure' || name === 'MonthlyCharges' || name === 'TotalCharges'
        ? Number(value)
        : value
    }))
    // Hapus error saat user mengedit
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // FR-FE-03: Validasi client-side
  const validate = () => {
    const errors = {}
    if (formData.tenure === '' || formData.tenure < 0 || formData.tenure > 100) {
      errors.tenure = 'Tenure harus antara 0–100 bulan'
    }
    if (formData.MonthlyCharges === '' || formData.MonthlyCharges < 0) {
      errors.MonthlyCharges = 'Biaya bulanan tidak boleh negatif atau kosong'
    }
    if (formData.TotalCharges === '' || formData.TotalCharges < 0) {
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
      <div className="form-grid">
        {FORM_FIELDS.map((field) => (
          <div className="form-field" key={field.name}>
            <label htmlFor={`field-${field.name}`}>{field.label}</label>

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

      {/* Tombol Aksi */}
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
