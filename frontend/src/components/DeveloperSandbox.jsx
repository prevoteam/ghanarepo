import { useState } from 'react';
import './DeveloperSandbox.css';

const DeveloperSandbox = ({ credentials, onGoHome, onGoToDeveloperPortal }) => {
  const [copiedField, setCopiedField] = useState(null);

  const handleLogoClick = () => {
    if (onGoHome) onGoHome();
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div className="sandbox-container">
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
            <div className="help-info">
              <div className="help-label">Need Help?</div>
              <div className="help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        <button className="nav-item" onClick={onGoHome}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          About Us
        </button>
        <button className="nav-item" onClick={onGoHome}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Conact Us
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
        <button className="nav-item active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          PSP On-boarding
        </button>
      </nav>

      {/* Main Content */}
      <main className="sandbox-main">
        <div className="sandbox-circles">
          <div className="sandbox-circle sandbox-circle-1"></div>
          <div className="sandbox-circle sandbox-circle-2"></div>
          <div className="sandbox-circle sandbox-circle-3"></div>
        </div>

        <div className="sandbox-card">
          <div className="sandbox-header">
            <div className="sandbox-header-left">
              <h1 className="sandbox-title">Developer Sandbox</h1>
              <p className="sandbox-subtitle">PSP Integration Environment</p>
            </div>
            <div className="env-badge">ENV: SANDBOX</div>
          </div>

          <div className="approval-banner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div className="approval-text">
              <strong>Application Approved</strong>
              <span>Your application for {credentials?.entity_name || 'PSP'} has been provisioned. Use the credentials below to start your integration.</span>
            </div>
          </div>

          <div className="credentials-grid">
            <div className="credentials-section">
              <h3 className="section-title">API Credentials</h3>

              <div className="credential-item">
                <label>Client ID</label>
                <div className="credential-value">
                  <span>{credentials?.client_id || 'psp_client_xxx'}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(credentials?.client_id || '', 'clientId')}
                    title="Copy to clipboard"
                  >
                    {copiedField === 'clientId' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="credential-item">
                <label>Client Secret</label>
                <div className="credential-value">
                  <span>{credentials?.client_secret || 'sk_test_xxx'}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(credentials?.client_secret || '', 'clientSecret')}
                    title="Copy to clipboard"
                  >
                    {copiedField === 'clientSecret' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="credential-item">
                <label>Webhook Signing Key</label>
                <div className="credential-value">
                  <span>{credentials?.webhook_key || 'whsec_xxx'}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(credentials?.webhook_key || '', 'webhookKey')}
                    title="Copy to clipboard"
                  >
                    {copiedField === 'webhookKey' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="configuration-section">
              <h3 className="section-title">Configuration</h3>

              <div className="config-item">
                <label>Sandbox Base URL</label>
                <a href="https://sandbox-api.gra.gov.gh/v1" className="config-link" target="_blank" rel="noopener noreferrer">
                  https://sandbox-api.gra.gov.gh/v1
                </a>
              </div>

              <div className="config-box">
                <h4>Sandbox Base URL</h4>
                <ul>
                  <li>Authentication & OAuth 2.0</li>
                  <li>Reporting Transactions</li>
                  <li>Error Codes & Troubleshooting</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-secondary" onClick={onGoHome}>
              Return Home
            </button>
            <button className="btn-primary" onClick={onGoToDeveloperPortal}>
              Go to Developer Portal
            </button>
          </div>
        </div>
      </main>

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

export default DeveloperSandbox;
