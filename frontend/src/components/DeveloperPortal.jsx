import { useState } from 'react';
import './DeveloperPortal.css';

const DeveloperPortal = ({ credentials, onGoHome }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/v1/transactions/report');
  const [apiKey, setApiKey] = useState(credentials?.client_secret || '');
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    "merchant_id": "MRCH-8939",
    "transaction_id": "txn_123456789",
    "amount": 150.00,
    "currency": "GHS",
    "customer_country": "GH",
    "timestamp": "2023-10-25T14:30:00Z"
  }, null, 2));
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiEndpoints = [
    { method: 'POST', path: '/v1/transactions/report', label: '/v1/transactions/report' },
    { method: 'GET', path: '/v1/merchants/{id}/compliance', label: '/v1/merchants/{id}/compliance' },
    { method: 'POST', path: '/v1/transactions/report', label: '/v1/transactions/report' },
    { method: 'GET', path: '/v1/tax-rates', label: '/v1/tax-rates' },
  ];

  const handleLogoClick = () => {
    if (onGoHome) onGoHome();
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponse(null);

    // Simulate API call
    setTimeout(() => {
      setResponse({
        status: 200,
        data: {
          success: true,
          transaction_id: "txn_123456789",
          vat_calculated: 22.50,
          currency: "GHS",
          message: "Transaction recorded successfully"
        }
      });
      setIsLoading(false);
    }, 1500);
  };

  const resetSample = () => {
    setRequestBody(JSON.stringify({
      "merchant_id": "MRCH-8939",
      "transaction_id": "txn_123456789",
      "amount": 150.00,
      "currency": "GHS",
      "customer_country": "GH",
      "timestamp": "2023-10-25T14:30:00Z"
    }, null, 2));
  };

  return (
    <div className="portal-container">
      {/* Sidebar */}
      <aside className="portal-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <div className="sidebar-brand">
              <span className="brand-title">GRA Developer</span>
              <span className="brand-version">v1.2.0 (Sandbox)</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Overview
          </button>
          <button
            className={`sidebar-item ${activeSection === 'authentication' ? 'active' : ''}`}
            onClick={() => setActiveSection('authentication')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Authentication
          </button>

          <div className="sidebar-section-title">API REFERENCE</div>

          {apiEndpoints.map((endpoint, index) => (
            <button
              key={index}
              className={`sidebar-item api-item ${selectedEndpoint === endpoint.path && activeSection === 'console' ? 'active' : ''}`}
              onClick={() => {
                setSelectedEndpoint(endpoint.path);
                setActiveSection('console');
              }}
            >
              <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
                {endpoint.method}
              </span>
              {endpoint.label}
            </button>
          ))}

          <div className="sidebar-divider"></div>

          <button
            className={`sidebar-item ${activeSection === 'console' ? 'active' : ''}`}
            onClick={() => setActiveSection('console')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            API Test Console
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="portal-main">
        {activeSection === 'overview' && (
          <div className="portal-content">
            <header className="content-header">
              <h1>Overview</h1>
              <p>Welcome to the Ghana Unified Tax API Platform.</p>
            </header>

            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon feature-icon-blue">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <h3>Restful API</h3>
                <p>Standard JSON-based REST architecture for easy integration with any stack.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon feature-icon-green">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <h3>Bank-Grade Security</h3>
                <p>Mutual TLS and OAuth 2.0 standards to ensure data integrity and privacy.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon feature-icon-purple">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3>Real-time Reporting</h3>
                <p>Submit transaction data instantaneously for automated VAT calculation.</p>
              </div>
            </div>

            <div className="getting-started">
              <h2>Getting Started</h2>
              <p>To begin integration, you must first register your Payment Service Provider (PSP) or Digital Platform to obtain your Client ID and Secret.</p>
              <div className="getting-started-buttons">
                <button className="btn-outline" onClick={() => setActiveSection('authentication')}>
                  Read Integration Guide
                </button>
                <button className="btn-filled" onClick={() => setActiveSection('console')}>
                  View SDKs
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'authentication' && (
          <div className="portal-content">
            <header className="content-header">
              <h1>Auth</h1>
              <p>Learn how to authenticate your API requests securely.</p>
            </header>

            <div className="auth-content">
              <p className="auth-text">
                The GRA API uses API keys to authenticate requests. You can view and manage your API keys in the Dashboard.
              </p>
              <p className="auth-text">
                Authentication to the API is performed via HTTP Basic Auth. Provide your API key as the basic auth username value. You do not need to provide a password.
              </p>

              <div className="code-example">
                <div className="code-header">
                  <span>cURL Example</span>
                  <button className="copy-code-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
                <pre className="code-block">
{`curl https://api.gra.gov.gh/v1/transactions \\
  -u sk_test_51M... \\
  -d amount=150.00 \\
  -d currency=GHS`}
                </pre>
              </div>

              <div className="security-note">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <div>
                  <strong>Keep your keys secret</strong>
                  <p>Authentication keys give access to your merchant's financial data. Do not share them in publicly accessible areas such as GitHub, client-side code, etc.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'console' && (
          <div className="portal-content api-console">
            <header className="content-header">
              <h1>Interactive API Console</h1>
              <p>Test endpoints in real-time using the Sandbox environment.</p>
            </header>

            <div className="console-layout">
              <div className="console-left">
                <div className="console-section">
                  <h3>Endpoint</h3>
                  <div className="endpoint-display">
                    <span className="protocol-badge">HTTPS</span>
                    <span className="endpoint-host">sandbox-api.gra.gov.gh</span>
                    <input
                      type="text"
                      value={`POST ${selectedEndpoint}`}
                      onChange={(e) => setSelectedEndpoint(e.target.value)}
                      className="endpoint-input"
                    />
                  </div>
                </div>

                <div className="console-section">
                  <h3>Authorization (API Key)</h3>
                  <div className="api-key-input">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                    />
                  </div>
                </div>

                <div className="console-section">
                  <div className="section-header">
                    <h3>Request Body (JSON)</h3>
                    <button className="reset-btn" onClick={resetSample}>Reset Sample</button>
                  </div>
                  <textarea
                    className="request-body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={12}
                  />
                </div>

                <button
                  className="send-request-btn"
                  onClick={handleSendRequest}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>

              <div className="console-right">
                <div className="response-panel">
                  <h3>Response</h3>
                  <div className="response-content">
                    {isLoading && (
                      <div className="loading-response">
                        <div className="spinner"></div>
                        <span>Sending request...</span>
                      </div>
                    )}
                    {response && !isLoading && (
                      <pre className="response-json">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    )}
                    {!response && !isLoading && (
                      <div className="empty-response">
                        <span>Response will appear here</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="portal-footer">
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
      </main>
    </div>
  );
};

export default DeveloperPortal;
