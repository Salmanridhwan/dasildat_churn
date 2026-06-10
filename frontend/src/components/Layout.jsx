import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Activity, Info } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { path: '/predict', label: 'Predict', icon: Activity },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">📡</span> 
            <span className="brand-text">Telco Churn</span>
          </Link>
        </div>
        <div className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span className="nav-label">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 Kelompok Tubes Dasildat | Universitas Telkom</p>
          <p className="footer-subtext">Mata Kuliah Dasar Ilmu Data</p>
        </div>
      </footer>
    </div>
  );
}
