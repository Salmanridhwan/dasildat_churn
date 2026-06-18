import { Github, Users, BrainCircuit, Code, ExternalLink } from 'lucide-react';

export default function About() {
  return (
    <div className="about-container">
      <div className="page-header text-center">
        <h1 className="page-title" style={{ justifyContent: 'center' }}>
          <BrainCircuit className="title-icon" /> Tentang Proyek
        </h1>
        <p className="page-subtitle text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Mata Kuliah Dasar Ilmu Data - Tugas Besar
        </p>
      </div>

      <div className="about-content">
        <div className="about-card modern-card">
          <div className="about-card-header">
            <div className="icon-wrapper bg-blue-500">
              <Code size={24} color="#fff" />
            </div>
            <h3>Deskripsi Proyek</h3>
          </div>
          <p>
            Proyek ini merupakan implementasi dari <strong>Machine Learning</strong> untuk memprediksi potensi <em>churn</em> (berhenti berlangganan) pada pelanggan perusahaan telekomunikasi. 
            Aplikasi ini dibangun menggunakan arsitektur modern yang terdiri dari:
          </p>
          <div className="tech-stack-grid">
            <div className="tech-item">
              <span className="tech-icon">⚛️</span>
              <div>
                <strong>Frontend</strong>
                <span>React.js, Vite, Recharts</span>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🐍</span>
              <div>
                <strong>ML Backend</strong>
                <span>Python, FastAPI, Scikit-Learn</span>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">☁️</span>
              <div>
                <strong>Deployment</strong>
                <span>Vercel & Hugging Face</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about-card team-card">
          <div className="about-card-header text-center" style={{ justifyContent: 'center' }}>
            <div className="icon-wrapper bg-purple-500">
              <Users size={24} color="#fff" />
            </div>
            <h3>Tim Pengembang</h3>
          </div>
          <p className="team-subtitle">Kami yang berada di balik layar proyek ini:</p>
          
          <div className="team-grid">
            
            {/* Member 1 */}
            <div className="team-member-v2">
              <div className="member-avatar-glow">
                <div className="member-avatar-v2">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Salman&backgroundColor=transparent" alt="Salman" />
                </div>
              </div>
              <div className="member-info-v2">
                <span className="member-nim">607012430004</span>
                <h4>Salman Ridhwan Qomarudin</h4>
                <div className="member-roles">
                  <span className="role-badge">Machine Learning Engineer</span>
                  <span className="role-badge">Fullstack</span>
                </div>
              </div>
            </div>

            {/* Member 2 */}
            <div className="team-member-v2">
              <div className="member-avatar-glow">
                <div className="member-avatar-v2">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Diki&backgroundColor=transparent" alt="Diki" />
                </div>
              </div>
              <div className="member-info-v2">
                <span className="member-nim">607012400005</span>
                <h4>Diki Alif Taufik</h4>
                <div className="member-roles">
                  <span className="role-badge">Data Scientist</span>
                  <span className="role-badge">Analyst</span>
                </div>
              </div>
            </div>

            {/* Member 3 */}
            <div className="team-member-v2">
              <div className="member-avatar-glow">
                <div className="member-avatar-v2">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Vemas&backgroundColor=transparent" alt="Vemas" />
                </div>
              </div>
              <div className="member-info-v2">
                <span className="member-nim">607012400076</span>
                <h4>Vemas Seftaesa Dwi Setiawan</h4>
                <div className="member-roles">
                  <span className="role-badge">UI/UX Researcher</span>
                  <span className="role-badge">Documentation</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
