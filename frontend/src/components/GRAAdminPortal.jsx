import { useState } from 'react';
import './GRAAdminPortal.css';
import ConfigurationLogin from './ConfigurationLogin';

const GRAAdminPortal = ({ onBack, onSelectPortal }) => {
  const [showConfigLogin, setShowConfigLogin] = useState(false);

  if (showConfigLogin) {
    return <ConfigurationLogin onBack={() => setShowConfigLogin(false)} />;
  }

  return (
    <div className="admin-portal-content">
      {/* Main Content Section */}
      <section className="admin-main-section bg">
     

        {/* Admin Portal Card */}
        <div className="admin-portal-card my-3">
          <h1 className="admin-portal-title">GRA Admin Portal</h1>
          <p className="admin-portal-subtitle">
            Restricted access for GRA personnel only. Select your system.
          </p>

          <div className="admin-options">
            <div
              className="admin-option-card"
              onClick={() => onSelectPortal && onSelectPortal('monitoring')}
            >
              <div className="admin-option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 className="admin-option-title">Monitoring</h3>
              <p className="admin-option-description">
                Real-time system status and transaction logs.
              </p>
            </div>

            <div
              className="admin-option-card"
              onClick={() => setShowConfigLogin(true)}
            >
              <div className="admin-option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <h3 className="admin-option-title">Configuration Management</h3>
              <p className="admin-option-description">
                System parameters and tax rule settings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GRAAdminPortal;
