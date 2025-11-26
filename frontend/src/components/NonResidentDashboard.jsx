import { useState } from 'react';
import './NonResidentDashboard.css';
import { Header, Footer } from './shared';

const NonResidentDashboard = ({ uniqueId, onLogout }) => {
  const [dashboardData] = useState({
    companyName: 'Global Digital Services',
    vatRegNo: 'P0098765432',
    filingFrequency: 'Monthly',
    nextFilingDue: '15th Dec 2023',
    status: 'Active',
    complianceHealth: 'Amber',
    complianceWarnings: [
      'Late filing for Oct 2023 detected.',
      'PSP transaction mismatch (Nov).'
    ],
    totalSales: 125430.00,
    salesGrowth: 12,
    vatCollected: 22577.40,
    vatRate: 18,
    topSalesChannels: [
      { name: 'Website Direct', percentage: 65 },
      { name: 'Jumia Marketplace', percentage: 20 },
      { name: 'Social Media (WhatsApp)', percentage: 15 }
    ],
    alerts: [
      { type: 'deadline', title: 'Filing Deadline', description: 'November VAT return is due in 5 days.' },
      { type: 'document', title: 'Document Expiry', description: 'Business Registration proof expires in 30 days.' },
      { type: 'system', title: 'System Update', description: 'Maintenance scheduled for Dec 20th.' }
    ],
    pspPayments: {
      cardPayments: 85200,
      momoReceipts: 32150,
      bankTransfers: 8080,
      unclassified: 1450
    },
    reconciliationAlert: {
      pspInflows: 126880,
      declaredSales: 125430,
      difference: 1.1,
      unclassifiedMomo: '024****991'
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="nrd-container">
      <Header
        activeNav=""
        showPSPNav={true}
      />

      <main className="nrd-main">
        <div className="nrd-content">
          {/* Welcome Header */}
          <div className="nrd-welcome">
            <div className="nrd-welcome-left">
              <h1 className="nrd-welcome-title">Welcome, {dashboardData.companyName}</h1>
              <p className="nrd-welcome-subtitle">Non-Resident Taxpayer Portal</p>
            </div>
            <button className="nrd-btn-logout" onClick={onLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>

          {/* Top Cards Row */}
          <div className="nrd-top-cards">
            {/* VAT Status Overview */}
            <div className="nrd-card nrd-vat-status">
              <h3 className="nrd-card-title">VAT Status Overview</h3>
              <div className="nrd-status-badge">
                <div className="nrd-status-icon nrd-status-active">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="nrd-status-text">
                  <span className="nrd-status-label">Current Status</span>
                  <span className="nrd-status-value nrd-status-active-text">{dashboardData.status}</span>
                </div>
              </div>
              <div className="nrd-status-details">
                <div className="nrd-status-row">
                  <span>VAT Registration No.</span>
                  <span>{dashboardData.vatRegNo}</span>
                </div>
                <div className="nrd-status-row">
                  <span>Filing Frequency</span>
                  <span>{dashboardData.filingFrequency}</span>
                </div>
                <div className="nrd-status-row">
                  <span>Next Filing Due</span>
                  <span className="nrd-link">{dashboardData.nextFilingDue}</span>
                </div>
              </div>
            </div>

            {/* Compliance Health */}
            <div className="nrd-card nrd-compliance">
              <h3 className="nrd-card-title">Compliance Health</h3>
              <div className="nrd-compliance-circle">
                <div className="nrd-circle-amber">
                  <span className="nrd-circle-text">Amber</span>
                  <span className="nrd-circle-subtext">WARNING</span>
                </div>
              </div>
              <div className="nrd-compliance-warnings">
                <div className="nrd-warning-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Agent Verified</span>
                </div>
                <ul className="nrd-warning-list">
                  {dashboardData.complianceWarnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Digital Merchant ID */}
            <div className="nrd-card nrd-merchant-id">
              <h3 className="nrd-card-title-light">Digital Merchant ID</h3>
              <div className="nrd-qr-code">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="white">
                  <rect x="10" y="10" width="25" height="25" />
                  <rect x="65" y="10" width="25" height="25" />
                  <rect x="10" y="65" width="25" height="25" />
                  <rect x="40" y="10" width="5" height="5" />
                  <rect x="50" y="10" width="5" height="5" />
                  <rect x="40" y="20" width="5" height="5" />
                  <rect x="50" y="25" width="5" height="5" />
                  <rect x="40" y="40" width="5" height="5" />
                  <rect x="50" y="40" width="5" height="5" />
                  <rect x="60" y="40" width="5" height="5" />
                  <rect x="70" y="40" width="5" height="5" />
                  <rect x="80" y="40" width="5" height="5" />
                  <rect x="40" y="50" width="5" height="5" />
                  <rect x="40" y="60" width="5" height="5" />
                  <rect x="50" y="60" width="5" height="5" />
                  <rect x="60" y="60" width="5" height="5" />
                  <rect x="70" y="70" width="5" height="5" />
                  <rect x="80" y="80" width="5" height="5" />
                  <rect x="65" y="65" width="25" height="25" fill="none" stroke="white" strokeWidth="3"/>
                </svg>
              </div>
              <p className="nrd-merchant-name">{dashboardData.companyName}</p>
              <p className="nrd-merchant-reg">{dashboardData.vatRegNo}</p>
              <button className="nrd-btn-download">Download Badge</button>
            </div>
          </div>

          {/* Middle Section */}
          <div className="nrd-middle-section">
            {/* Sales & Revenue Snapshot */}
            <div className="nrd-card nrd-sales-card">
              <h3 className="nrd-card-title">Sales & Revenue Snapshot (Nov)</h3>
              <div className="nrd-sales-metrics">
                <div className="nrd-metric">
                  <div className="nrd-metric-icon nrd-metric-sales">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                  </div>
                  <div className="nrd-metric-details">
                    <span className="nrd-metric-label">Total Sales (Ghana)</span>
                    <span className="nrd-metric-value">GHS {formatCurrency(dashboardData.totalSales)}</span>
                    <span className="nrd-metric-growth">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      </svg>
                      +{dashboardData.salesGrowth}% vs last month
                    </span>
                  </div>
                </div>
                <div className="nrd-metric">
                  <div className="nrd-metric-icon nrd-metric-vat">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M12 8v8"/>
                      <path d="M8 12h8"/>
                    </svg>
                  </div>
                  <div className="nrd-metric-details">
                    <span className="nrd-metric-label">VAT Collected</span>
                    <span className="nrd-metric-value">GHS {formatCurrency(dashboardData.vatCollected)}</span>
                    <span className="nrd-metric-note">{dashboardData.vatRate}% Flat Rate Applied</span>
                  </div>
                </div>
              </div>

              <div className="nrd-sales-channels">
                <h4 className="nrd-channels-title">Top Sales Channels</h4>
                {dashboardData.topSalesChannels.map((channel, index) => (
                  <div key={index} className="nrd-channel-row">
                    <span className="nrd-channel-name">{channel.name}</span>
                    <div className="nrd-channel-bar-container">
                      <div
                        className="nrd-channel-bar"
                        style={{ width: `${channel.percentage}%` }}
                      ></div>
                    </div>
                    <span className="nrd-channel-percentage">{channel.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="nrd-card nrd-alerts-card">
              <h3 className="nrd-card-title">Alerts & Notifications</h3>
              <div className="nrd-alerts-list">
                {dashboardData.alerts.map((alert, index) => (
                  <div key={index} className={`nrd-alert-item nrd-alert-${alert.type}`}>
                    <div className="nrd-alert-indicator"></div>
                    <div className="nrd-alert-content">
                      <span className="nrd-alert-title">{alert.title}</span>
                      <span className="nrd-alert-description">{alert.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PSP Payments Summary */}
          <div className="nrd-card nrd-psp-card">
            <h3 className="nrd-card-title">PSP Payments Summary</h3>
            <div className="nrd-psp-grid">
              <div className="nrd-psp-item">
                <span className="nrd-psp-label">Card Payments</span>
                <span className="nrd-psp-value">GHS {formatCurrency(dashboardData.pspPayments.cardPayments)}</span>
              </div>
              <div className="nrd-psp-item">
                <span className="nrd-psp-label">MoMo Receipts</span>
                <span className="nrd-psp-value">GHS {formatCurrency(dashboardData.pspPayments.momoReceipts)}</span>
              </div>
              <div className="nrd-psp-item">
                <span className="nrd-psp-label">Bank Transfers</span>
                <span className="nrd-psp-value">GHS {formatCurrency(dashboardData.pspPayments.bankTransfers)}</span>
              </div>
              <div className="nrd-psp-item nrd-psp-unclassified">
                <span className="nrd-psp-label nrd-psp-label-warning">Unclassified / Suspense</span>
                <span className="nrd-psp-value nrd-psp-value-warning">GHS {formatCurrency(dashboardData.pspPayments.unclassified)}</span>
              </div>
            </div>

            {/* Reconciliation Alert */}
            <div className="nrd-reconciliation-alert">
              <div className="nrd-reconciliation-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="nrd-reconciliation-content">
                <span className="nrd-reconciliation-title">Reconciliation Alert Detected</span>
                <p className="nrd-reconciliation-text">
                  PSP inflows (GHS {formatCurrency(dashboardData.reconciliationAlert.pspInflows)}) exceed declared sales revenue (GHS {formatCurrency(dashboardData.reconciliationAlert.declaredSales)}) by {dashboardData.reconciliationAlert.difference}%.
                </p>
                <p className="nrd-reconciliation-text">
                  Unclassified payment received from MoMo number {dashboardData.reconciliationAlert.unclassifiedMomo}.
                </p>
              </div>
              <button className="nrd-btn-reconcile">Reconcile Now</button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NonResidentDashboard;
