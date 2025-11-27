import { useState } from 'react';
import './TaxpayerCorner.css';

const TaxpayerCorner = () => {
  const [activeSection, setActiveSection] = useState('cover');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const tableOfContents = [
    { id: 'cover', label: 'Cover Page', page: 1, icon: 'monitor' },
    { id: 'intro', label: '1. Introduction & Purpose', page: 3, icon: 'document' },
    { id: 'architecture', label: '2. Portal Architecture', page: 4, icon: 'grid' },
    { id: 'navigation', label: '3. User Navigation Journey', page: 5, icon: 'arrow' },
    { id: 'dashboard', label: '4. Module: Dashboard', page: 6, icon: 'grid' },
    { id: 'profile', label: '5. Module: Profile', page: 8, icon: 'user' },
    { id: 'obligations', label: '6. Module: Tax Obligations', page: 10, icon: 'document' },
    { id: 'filing', label: '7. Module: Filing', page: 11, icon: 'document' },
    { id: 'payments', label: '8. Module: Payments', page: 13, icon: 'card' },
    { id: 'certificates', label: '9. Module: Certificates', page: 15, icon: 'certificate' },
    { id: 'refunds', label: '10. Module: Refunds', page: 16, icon: 'refund' },
    { id: 'notifications', label: '11. Module: Notifications', page: 17, icon: 'bell' },
    { id: 'settings', label: '12. Module: Settings', page: 18, icon: 'settings' },
    { id: 'accessibility', label: '13. Accessibility & UX', page: 19, icon: 'accessibility' },
    { id: 'security', label: '14. Security & Data', page: 20, icon: 'security' },
    { id: 'disclaimer', label: '15. Disclaimer', page: 21, icon: 'warning' },
    { id: 'appendix', label: '16. Appendix', page: 22, icon: 'appendix' },
  ];

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'monitor':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        );
      case 'document':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        );
      case 'grid':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        );
      case 'arrow':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        );
      case 'user':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        );
      case 'card':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        );
      case 'certificate':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        );
      case 'refund':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        );
      case 'bell':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        );
      case 'settings':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        );
      case 'accessibility':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="4" r="2"/>
            <path d="M12 6v6m0 0l-4 6m4-6l4 6M6 10h12"/>
          </svg>
        );
      case 'security':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'appendix':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
    }
  };

  const handleSectionClick = (item) => {
    setActiveSection(item.id);
    setCurrentPage(item.page);
  };

  const handlePrint = () => {
    // Open PDF in new window and print
    const printWindow = window.open(`/assets/GRA_Taxpayer_Manual.pdf`, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/assets/GRA_Taxpayer_Manual.pdf';
    link.download = 'GRA_Taxpayer_Manual.pdf';
    link.click();
  };

  const handleDownloadWord = () => {
    alert('Word document download coming soon!');
  };

  return (
    <div className="taxpayer-corner-container">
      {/* Top Bar */}
      <div className="taxpayer-topbar">
        <div className="topbar-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h1 className="topbar-title">Taxpayer Corner Manual</h1>
        </div>
        <div className="topbar-actions">
          <button className="action-btn print-btn" onClick={handlePrint}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            <span>Print</span>
          </button>
          <button className="action-btn word-btn" onClick={handleDownloadWord}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>Download Word (.docx)</span>
          </button>
          <button className="action-btn pdf-btn" onClick={handleDownloadPDF}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="taxpayer-content">
        {/* Sidebar */}
        <aside className={`taxpayer-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <span className="toc-label">TABLE OF CONTENTS</span>
          </div>
          <nav className="toc-nav">
            {tableOfContents.map((item) => (
              <button
                key={item.id}
                className={`toc-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleSectionClick(item)}
              >
                <span className="toc-icon">{getIcon(item.icon)}</span>
                <span className="toc-label-text">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* PDF Viewer */}
        <main className="pdf-viewer-container">
          <div className="pdf-viewer">
            <iframe
              key={currentPage}
              src={`/assets/GRA_Taxpayer_Manual.pdf#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              title="GRA Taxpayer Manual"
              className="pdf-iframe"
            />
          </div>
        </main>
      </div>

    </div>
  );
};

export default TaxpayerCorner;
