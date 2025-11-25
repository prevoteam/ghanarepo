import { useState } from 'react';
import './GRAAdminPortal.css';

const GRAAdminPortal = ({ onBack, onSelectPortal }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if (onSelectPortal) {
      onSelectPortal(option);
    }
  };

  return (
    <div className="gra-portal-page">
      {/* Header */}
      <header className="gra-header">
        <div className="gra-header-content">
          <div className="gra-logo-section">
            <div className="gra-logo-circle">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#F59E0B" strokeWidth="4" />
                <text x="25" y="32" fontSize="18" fontWeight="bold" fill="#F59E0B" textAnchor="middle">G</text>
              </svg>
            </div>
            <div className="gra-logo-text">
              <div className="gra-title">GRA</div>
              <div className="gra-subtitle">GHANA REVENUE AUTHORITY</div>
            </div>
          </div>

          <div className="gra-header-right">
            <button className="gra-header-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </button>
            <button className="gra-header-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              About Us
            </button>
            <div className="gra-help-info">
              <div className="gra-help-label">Need Help?</div>
              <div className="gra-help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="gra-navigation">
        <button className="gra-nav-item" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Register Now
        </button>
        <button className="gra-nav-item" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Taxpayer Login
        </button>
        <button className="gra-nav-item active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          GRA Login
        </button>
        <button className="gra-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Guidelines
        </button>
        <button className="gra-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          FAQ
        </button>
      </nav>

      {/* Main Content */}
      <main className="gra-main">
        {/* Background Circles */}
        <div className="gra-bg-circles">
          <div className="gra-bg-circle gra-bg-circle-1"></div>
          <div className="gra-bg-circle gra-bg-circle-2"></div>
          <div className="gra-bg-circle gra-bg-circle-3"></div>
          <div className="gra-bg-circle gra-bg-circle-4"></div>
        </div>

        {/* Login Card */}
        <div className="gra-login-card">
          <h1 className="gra-card-title">GRA Admin Portal</h1>
          <p className="gra-card-subtitle">Restricted access for GRA personnel only. Select your system.</p>

          <div className="gra-options-container">
            {/* Monitoring Option */}
            <div
              className={`gra-option-card ${selectedOption === 'monitoring' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('monitoring')}
            >
              <div className="gra-option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 className="gra-option-title">Monitoring</h3>
              <p className="gra-option-description">
                Real-time system status<br/>and transaction logs.
              </p>
            </div>

            {/* Configuration Management Option */}
            <div
              className={`gra-option-card ${selectedOption === 'configuration' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('configuration')}
            >
              <div className="gra-option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <h3 className="gra-option-title">Configuration<br/>Management</h3>
              <p className="gra-option-description">
                System parameters and<br/>tax rule settings.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="gra-footer">
        <div className="gra-footer-content">
          <div className="gra-footer-text">Integrity. Fairness. Service</div>
          <div className="gra-footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="gra-assistant-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            Ask GRA Assistant
          </button>
        </div>
      </footer>
    </div>
  );
};

export default GRAAdminPortal;
