import { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ uniqueId, onLogout }) => {
  // Static data - always show without API call
  const [dashboardData] = useState({
    tin: 'P008041768',
    vat_id: 'VP008041768',
    compliance_status: 'ON TRACK',
    total_sales: '50,000.00',
    est_vat_liability: '10,950.00'
  });
  const loading = false;
  const error = null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount).replace('GHS', 'GH₵');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading && !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-circle">
            <span>O</span>
          </div>
          <div className="sidebar-logo-text">
            <div className="sidebar-gra-title">GRA</div>
            <div className="sidebar-gra-subtitle">GHANA REVENUE AUTHORITY</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Register Now
          </button>
          <button className="sidebar-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Taxpayer Login
          </button>
          <button className="sidebar-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            GRA Login
          </button>
          <button className="sidebar-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Guidelines
          </button>
          <button className="sidebar-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            FAQ
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <h1 className="dashboard-page-title">Dashboard</h1>
          <div className="topbar-actions">
            <div className="topbar-help">
              <div className="topbar-help-label">Need Help?</div>
              <div className="topbar-help-phone">+233 (0) 302 123 456</div>
            </div>
            <button className="btn-logout" onClick={onLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {dashboardData && (
          <div className="dashboard-content">
            {/* Hero Section */}
            <div className="dashboard-hero">
              <div className="hero-content">
                <h2 className="hero-title">Lorem Ipsum</h2>
                <div className="hero-credentials">
                  <div className="hero-credential">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>TIN : P008041768</span>
                  </div>
                  <div className="hero-credential">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <span>VAT ID : VP008041768</span>
                  </div>
                </div>

                <div className="compliance-status">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>COMPLIANCE STATUS<br />ON TRACK</span>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="dashboard-main-grid">
              {/* Left Column - At a Glance */}
              <div className="dashboard-left-col">
                <div className="glance-section">
                  <div className="glance-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    <span>At a Glance: Current Period (Nov)</span>
                  </div>
                  <div className="glance-stats">
                    <div className="glance-stat">
                      <div className="glance-label">Total Sales (PSP Data)</div>
                      <div className="glance-value primary">GH₵50,000.00</div>
                    </div>
                    <div className="glance-divider"></div>
                    <div className="glance-stat">
                      <div className="glance-label">Est. VAT Liability</div>
                      <div className="glance-value secondary">GH₵10,950.00</div>
                    </div>
                  </div>
                  <button className="glance-link">
                    Click to view detailed computation & file return →
                  </button>
                </div>

                {/* Recent History Card */}
                <div className="dashboard-card">
                  <h3 className="card-title">Recent History</h3>
                  <div className="history-list">
                    <div className="history-row">
                      <span className="history-label">Oct 2023 VAT</span>
                      <span className="history-amount">GH₵ 4,200.00</span>
                    </div>
                    <div className="history-row">
                      <span className="history-label">Sep 2023 VAT</span>
                      <span className="history-amount">GH₵ 3,890.00</span>
                    </div>
                  </div>
                  <button className="card-link">View Statement</button>
                </div>
              </div>

              {/* Right Column - Messages */}
              <div className="dashboard-right-col">
                <div className="dashboard-card messages-card">
                  <h3 className="card-title">Messages</h3>
                  <div className="messages-list">
                    <div className="message-item">
                      <div className="message-dot"></div>
                      <div className="message-content">
                        <div className="message-title">Return Deadline Approaching</div>
                        <div className="message-desc">Your Nov return is due in 5 days.</div>
                      </div>
                    </div>
                    <div className="message-item">
                      <div className="message-dot"></div>
                      <div className="message-content">
                        <div className="message-title">System Maintenance</div>
                        <div className="message-desc">Scheduled for Sunday, 2am - 4am.</div>
                      </div>
                    </div>
                  </div>
                  <button className="card-link">View All Messages</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-text">Integrity. Fairness. Service</div>
            <div className="footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
            <button className="assistant-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Ask GRA Assistant
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
