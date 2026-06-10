/**
 * ModelSelector.jsx
 * FR-FE-02: Dropdown untuk memilih model prediksi (KNN, NN, SVM)
 * TODO: Implementasikan styling lengkap di fase 3
 */

const MODELS = [
  { value: 'KNN', label: 'K-Nearest Neighbors (KNN)' },
  { value: 'NN',  label: 'Neural Network (MLP)' },
  { value: 'SVM', label: 'Support Vector Machine (SVM)' },
]

function ModelSelector({ value, onChange }) {
  return (
    <div className="model-selector">
      <label htmlFor="model-select">Model:</label>
      <select
        id="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {MODELS.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  )
}

export default ModelSelector
