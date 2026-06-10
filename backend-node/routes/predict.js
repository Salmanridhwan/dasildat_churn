const express = require('express');
const axios   = require('axios');
const router  = express.Router();

// 19 field wajib sesuai PRD Section 4
const REQUIRED_FIELDS = [
  'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure',
  'PhoneService', 'MultipleLines', 'InternetService', 'OnlineSecurity',
  'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV',
  'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod',
  'MonthlyCharges', 'TotalCharges'
];

const VALID_MODELS = ['KNN', 'NN', 'SVM'];

/**
 * POST /api/predict-churn
 * FR-BE-02: Proxy routing ke FastAPI ML Engine
 */
router.post('/predict-churn', async (req, res) => {
  const { model_choice, data } = req.body;

  // Validasi model_choice
  if (!model_choice || !VALID_MODELS.includes(model_choice.toUpperCase())) {
    return res.status(400).json({
      error: `model_choice tidak valid. Pilih salah satu: ${VALID_MODELS.join(', ')}`
    });
  }

  // Validasi data ada
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Field "data" wajib disertakan dan harus berupa object' });
  }

  // FR-BE-03: Validasi 19 field wajib
  const missingFields = REQUIRED_FIELDS.filter(f => data[f] === undefined || data[f] === null || data[f] === '');
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Field berikut tidak lengkap atau kosong: ${missingFields.join(', ')}`
    });
  }

  // Validasi tipe numerik
  if (!Number.isInteger(Number(data.tenure)) || Number(data.tenure) < 0 || Number(data.tenure) > 100) {
    return res.status(400).json({ error: 'Field tenure harus berupa integer antara 0–100' });
  }
  if (isNaN(Number(data.MonthlyCharges)) || Number(data.MonthlyCharges) < 0) {
    return res.status(422).json({ error: 'Nilai MonthlyCharges tidak boleh negatif' });
  }
  if (isNaN(Number(data.TotalCharges)) || Number(data.TotalCharges) < 0) {
    return res.status(422).json({ error: 'Nilai TotalCharges tidak boleh negatif' });
  }

  // FR-BE-02: Forward ke FastAPI
  try {
    const fastapiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    console.log(`[${new Date().toISOString()}] → Forward ke FastAPI | model: ${model_choice}`);

    const response = await axios.post(
      `${fastapiUrl}/predict`,
      { model_choice: model_choice.toUpperCase(), data },
      { timeout: 10000 }
    );

    console.log(`[${new Date().toISOString()}] ← Response dari FastAPI | status: ${response.status}`);
    return res.json(response.data);

  } catch (err) {
    // FR-BE-04: Error Fallback (tanpa stack trace)
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
      console.error(`[ERROR] FastAPI tidak dapat dihubungi: ${err.code}`);
      return res.status(503).json({ error: 'ML Service tidak tersedia, coba beberapa saat lagi' });
    }

    if (err.response) {
      // Error dari FastAPI (4xx/5xx)
      return res.status(err.response.status).json(err.response.data);
    }

    console.error('[ERROR] Unexpected error:', err.message);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;
