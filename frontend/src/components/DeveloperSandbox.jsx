import { useState } from 'react';
import './DeveloperSandbox.css';

const DeveloperSandbox = ({ credentials, onGoHome, onGoToDeveloperPortal }) => {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div className="sandbox-content">
      {/* Main Content */}
      <main className="sandbox-main">
        <div className="sandbox-circles">
          <div className="sandbox-circle sandbox-circle-1"></div>
          <div className="sandbox-circle sandbox-circle-2"></div>
          <div className="sandbox-circle sandbox-circle-3"></div>
        </div>

        <div className="sandbox-card">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>

          <h1 className="sandbox-title">Registration Successful!</h1>
          <p className="sandbox-subtitle">
            Your PSP has been registered. Below are your sandbox credentials.
          </p>

          <div className="credentials-section">
            <h3>Your API Credentials</h3>

            <div className="credential-item">
              <label>PSP ID</label>
              <div className="credential-value">
                <span>{credentials?.psp_id || 'PSP-XXXX-XXXX'}</span>
                <button
                  className={`copy-btn ${copiedField === 'psp_id' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(credentials?.psp_id || 'PSP-XXXX-XXXX', 'psp_id')}
                >
                  {copiedField === 'psp_id' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="credential-item">
              <label>Client ID</label>
              <div className="credential-value">
                <span>{credentials?.client_id || 'client_xxxxxxxxxxxxx'}</span>
                <button
                  className={`copy-btn ${copiedField === 'client_id' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(credentials?.client_id || 'client_xxxxxxxxxxxxx', 'client_id')}
                >
                  {copiedField === 'client_id' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="credential-item">
              <label>Client Secret</label>
              <div className="credential-value">
                <span className="secret">{credentials?.client_secret || 'sk_test_xxxxxxxxxxxxx'}</span>
                <button
                  className={`copy-btn ${copiedField === 'client_secret' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(credentials?.client_secret || 'sk_test_xxxxxxxxxxxxx', 'client_secret')}
                >
                  {copiedField === 'client_secret' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="credential-item">
              <label>Webhook Key</label>
              <div className="credential-value">
                <span className="secret">{credentials?.webhook_key || 'whk_xxxxxxxxxxxxx'}</span>
                <button
                  className={`copy-btn ${copiedField === 'webhook_key' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(credentials?.webhook_key || 'whk_xxxxxxxxxxxxx', 'webhook_key')}
                >
                  {copiedField === 'webhook_key' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="sandbox-info">
            <h3>Sandbox Environment</h3>

            <div className="info-grid">
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
    </div>
  );
};

export default DeveloperSandbox;
