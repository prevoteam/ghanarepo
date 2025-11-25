import { useState } from 'react';
import './RegisterNow.css';
import RegistrationForm from './RegistrationForm';
import GRAAdminPortal from './GRAAdminPortal';
import MonitoringLogin from './MonitoringLogin';
import MonitoringDashboard from './MonitoringDashboard';

const RegisterNow = ({ onLoginClick }) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showGRAAdminPortal, setShowGRAAdminPortal] = useState(false);
  const [showMonitoringLogin, setShowMonitoringLogin] = useState(false);
  const [showMonitoringDashboard, setShowMonitoringDashboard] = useState(false);

  const handlePortalSelect = (portalType) => {
    if (portalType === 'monitoring') {
      setShowGRAAdminPortal(false);
      setShowMonitoringLogin(true);
    }
    // Add other portal types here as needed
  };

  if (showRegistrationForm) {
    return (
      <RegistrationForm
        onBack={() => setShowRegistrationForm(false)}
        onLoginRedirect={onLoginClick}
      />
    );
  }

  const handleLogoClick = () => {
    // Scroll to top or refresh to home
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showMonitoringDashboard) {
    return (
      <MonitoringDashboard
        onLogout={() => {
          setShowMonitoringDashboard(false);
          setShowMonitoringLogin(false);
          setShowGRAAdminPortal(false);
        }}
      />
    );
  }

  if (showMonitoringLogin) {
    return (
      <MonitoringLogin
        onBack={() => {
          setShowMonitoringLogin(false);
          setShowGRAAdminPortal(true);
        }}
        onLoginSuccess={(data) => {
          console.log('Login successful:', data);
          setShowMonitoringLogin(false);
          setShowMonitoringDashboard(true);
        }}
      />
    );
  }

  if (showGRAAdminPortal) {
    return (
      <GRAAdminPortal
        onBack={() => setShowGRAAdminPortal(false)}
        onSelectPortal={handlePortalSelect}
      />
    );
  }

  return (
    <div className="register-container">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="logo-section" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
            <div className="logo-circle">
              <img
                src="/assets/logo.png"
                alt="GRA Logo"
                style={{
                  width: '52px',
                  height: '50px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            <div className="logo-text">
              <div className="gra-text">GRA</div>
              <div className="gra-subtext">GHANA REVENUE AUTHORITY</div>
            </div>
          </div>

          <div className="header-right">
            <button className="header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </button>
            <button className="header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              About Us
            </button>
            <div className="help-info">
              <div className="help-label">Need Help?</div>
              <div className="help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        <button className="nav-item active" onClick={() => setShowRegistrationForm(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Register Now
        </button>
        <button className="nav-item" onClick={onLoginClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Taxpayer Login
        </button>
        <button className="nav-item" onClick={() => setShowGRAAdminPortal(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          GRA Login
        </button>
        <button className="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Guidelines
        </button>
        <button className="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          FAQ
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-circles">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
          <div className="hero-circle hero-circle-4"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Building a Better Ghana</h1>
          <p className="hero-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </section>

      {/* Cards Section */}
      <section className="cards-section">
        <div className="card">
          <div className="card-icon card-icon-blue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h3 className="card-title">GRA Officer</h3>
          <p className="card-description">
            Authorized personnel access for system monitoring, configuration, and compliance management.
          </p>
        </div>

        <div className="card">
          <div className="card-icon card-icon-blue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h3 className="card-title">Resident Merchant</h3>
          <p className="card-description">
            Login to verify and comply VAT obligations for business in Ghana.
          </p>
        </div>

        <div className="card">
          <div className="card-icon card-icon-blue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <h3 className="card-title">Non-Resident Merchant</h3>
          <p className="card-description">
            Registration portal for international entities supplying digital services or goods to customers in Ghana.
          </p>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="news-section">
        <h2 className="news-title">Latest News</h2>

        <div className="news-item">
          <div className="news-image">
            <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=200&fit=crop" alt="Tax filing" />
            <div className="news-badge">TAX</div>
          </div>
          <div className="news-content">
            <div className="news-tag">PRESS RELEASE</div>
            <h3 className="news-heading">GRA launches new digital portal for seamless tax filing</h3>
            <p className="news-description">
              The Commissioner-General today unveiled the new integrated tax application system designed to simplify compliance...
            </p>
            <button className="news-link">Read More</button>
          </div>
        </div>

        <div className="news-item">
          <div className="news-image">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop" alt="Digital portal" />
            <div className="news-badge">TAX</div>
          </div>
          <div className="news-content">
            <div className="news-tag">PRESS RELEASE</div>
            <h3 className="news-heading">GRA launches new digital portal for seamless tax filing</h3>
            <p className="news-description">
              The Commissioner-General today unveiled the new integrated tax application system designed to simplify compliance...
            </p>
            <button className="news-link">Read More</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-text">Integrity. Fairness. Service</div>
          <div className="footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="assistant-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Ask GRA Assistant
          </button>
        </div>
      </footer>
    </div>
  );
};

export default RegisterNow;
