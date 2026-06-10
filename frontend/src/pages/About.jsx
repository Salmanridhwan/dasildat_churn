export default function About() {
  return (
    <div className="about-container">
      <div className="page-header">
        <h1 className="page-title">Tentang Proyek</h1>
        <p className="page-subtitle">Mata Kuliah Dasar Ilmu Data - Tugas Besar</p>
      </div>

      <div className="about-content">
        <div className="about-card">
          <h3>Deskripsi Proyek</h3>
          <p>
            Proyek ini merupakan implementasi dari <strong>Machine Learning</strong> untuk memprediksi potensi <em>churn</em> (berhenti berlangganan) pada pelanggan perusahaan telekomunikasi. 
            Aplikasi ini dibangun menggunakan arsitektur modern yang terdiri dari:
          </p>
          <ul className="about-list">
            <li><strong>Frontend:</strong> React.js dengan Vite, React Router, dan Recharts.</li>
            <li><strong>API Gateway:</strong> Node.js & Express untuk menjembatani komunikasi.</li>
            <li><strong>ML Backend:</strong> Python FastAPI, Scikit-Learn untuk melayani model KNN, Neural Network, dan SVM.</li>
          </ul>
        </div>

        <div className="about-card team-card">
          <h3>Tim Pengembang</h3>
          <p className="team-subtitle">Kelompok Tugas Besar Dasildat:</p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">👩‍💻</div>
              <div className="member-info">
                <h4>Anggota 1</h4>
                <span>Data Scientist</span>
              </div>
            </div>
            <div className="team-member">
              <div className="member-avatar">👨‍💻</div>
              <div className="member-info">
                <h4>Anggota 2</h4>
                <span>Machine Learning Engineer</span>
              </div>
            </div>
            <div className="team-member">
              <div className="member-avatar">👨‍💻</div>
              <div className="member-info">
                <h4>Anggota 3</h4>
                <span>Fullstack Developer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
