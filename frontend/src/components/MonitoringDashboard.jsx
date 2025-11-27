import { useState } from 'react';
import './MonitoringDashboard.css';
import PSPIngestionStatus from './dashboard/PSPIngestionStatus';
import MerchantDiscovery from './dashboard/MerchantDiscovery';
import MerchantStatistics from './dashboard/MerchantStatistics';
import VATEligibility from './dashboard/VATEligibility';
import HighRiskEntities from './dashboard/HighRiskEntities';
import ECommercePortals from './dashboard/ECommercePortals';
import BIReports from './dashboard/BIReports';

const MonitoringDashboard = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('psp-ingestion');

  const menuItems = [
    { id: 'psp-ingestion', label: 'PSP Ingestion Status', icon: 'database' },
    { id: 'merchant-discovery', label: 'Merchant Discovery', icon: 'search' },
    { id: 'merchant-statistics', label: 'Merchant Statistics', icon: 'chart' },
    { id: 'vat-eligibility', label: 'VAT Eligibility', icon: 'checkbox' },
    { id: 'high-risk', label: 'High Risk Entities', icon: 'warning' },
    { id: 'ecommerce', label: 'E-Commerce Portals', icon: 'cart' },
    { id: 'bi-reports', label: 'BI & Reports', icon: 'moon' },
  ];

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'database':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        );
      case 'search':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        );
      case 'chart':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 20V10"/>
            <path d="M12 20V4"/>
            <path d="M6 20v-6"/>
          </svg>
        );
      case 'checkbox':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'cart':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        );
      case 'moon':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (activeMenu) {
      case 'psp-ingestion': return 'PSP Ingestion Status';
      case 'merchant-discovery': return 'Merchant Discovery';
      case 'merchant-statistics': return 'Merchant Discovery';
      case 'vat-eligibility': return 'VAT Eligibility';
      case 'high-risk': return 'High risk entities';
      case 'ecommerce': return 'E-commerce portals';
      case 'bi-reports': return 'BI & Reports';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'psp-ingestion':
        return <PSPIngestionStatus />;
      case 'merchant-discovery':
        return <MerchantDiscovery />;
      case 'merchant-statistics':
        return <MerchantStatistics />;
      case 'vat-eligibility':
        return <VATEligibility />;
      case 'high-risk':
        return <HighRiskEntities />;
      case 'ecommerce':
        return <ECommercePortals />;
      case 'bi-reports':
        return <BIReports />;
      default:
        return <PSPIngestionStatus />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <rect width="40" height="40" rx="8" fill="#F59E0B"/>
                <text x="20" y="26" fontSize="16" fontWeight="bold" fill="#2D3B8F" textAnchor="middle">G</text>
              </svg>
            </div>
            <div className="sidebar-title">
              <span className="sidebar-title-main">Monitoring</span>
              <span className="sidebar-title-sub">GRA Admin Portal</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                {getIcon(item.icon)}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-decoration">
            <div className="sidebar-circle sidebar-circle-1"></div>
            <div className="sidebar-circle sidebar-circle-2"></div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Top Bar */}
          <header className="dashboard-topbar">
            <h1 className="topbar-title">{getPageTitle()}</h1>
            <div className="topbar-actions">
              <div className="system-status">
                <span className="status-dot"></span>
                <span>System Operation</span>
              </div>
              <button className="initiate-btn">Initiate Crawlers</button>
              <button className="logout-btn" onClick={onLogout} title="Logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div className="dashboard-content">
            {renderContent()}
          </div>
        </main>
      </div>

 
    </div>
  );
};

export default MonitoringDashboard;
