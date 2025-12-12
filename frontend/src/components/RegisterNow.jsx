import { useState, useEffect } from 'react';
import './RegisterNow.css';
import GRAAdminLogin from './GRAAdminLogin';
import MonitoringDashboard from './MonitoringDashboard';
import ConfigDashboard from './ConfigDashboard';
import AdminDashboard from './AdminDashboard';

const RegisterNow = ({ onLoginClick, onNonResidentLoginClick, onDashboardStateChange }) => {
  const [showGRAAdminLogin, setShowGRAAdminLogin] = useState(false);
  const [showMonitoringDashboard, setShowMonitoringDashboard] = useState(false);
  const [showConfigDashboard, setShowConfigDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Restore GRA session on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('gra_token');
    const savedRole = localStorage.getItem('gra_user_role');

    if (savedToken && savedRole) {
      setUserRole(savedRole);

      // Route to appropriate dashboard based on saved role
      if (savedRole === 'admin') {
        setShowAdminDashboard(true);
        if (onDashboardStateChange) onDashboardStateChange(true);
      } else if (savedRole === 'monitoring') {
        setShowMonitoringDashboard(true);
        if (onDashboardStateChange) onDashboardStateChange(true);
      } else if (savedRole === 'gra_maker' || savedRole === 'gra_checker') {
        setShowConfigDashboard(true);
        if (onDashboardStateChange) onDashboardStateChange(true);
      }
    }
  }, [onDashboardStateChange]);

  const handleNonResidentClick = () => {
    if (onNonResidentLoginClick) {
      onNonResidentLoginClick();
    }
  };

  const handleGRALoginSuccess = (data) => {
    console.log('GRA Admin Login successful:', data);

    const role = data.userRole || localStorage.getItem('gra_user_role');

    setShowGRAAdminLogin(false);
    setUserRole(role);

    // Route based on user role
    // - admin -> AdminDashboard
    // - monitoring -> MonitoringDashboard
    // - gra_maker, gra_checker -> ConfigDashboard
    if (role === 'admin') {
      // Admin user - go to Admin Dashboard
      setShowAdminDashboard(true);
      // Notify parent to hide navbar
      if (onDashboardStateChange) onDashboardStateChange(true);
    } else if (role === 'monitoring') {
      // Monitoring user - go to Monitoring Dashboard
      setShowMonitoringDashboard(true);
      // Notify parent to hide navbar
      if (onDashboardStateChange) onDashboardStateChange(true);
    } else if (role === 'gra_maker' || role === 'gra_checker') {
      // Maker/Checker - go to Config Dashboard
      setShowConfigDashboard(true);
      // Notify parent to hide navbar
      if (onDashboardStateChange) onDashboardStateChange(true);
    } else {
      // Default to Monitoring Dashboard
      setShowMonitoringDashboard(true);
      // Notify parent to hide navbar
      if (onDashboardStateChange) onDashboardStateChange(true);
    }
  };

  const handleLogout = () => {
    // Clear all session data from localStorage
    localStorage.removeItem('gra_session_id');
    localStorage.removeItem('gra_unique_id');
    localStorage.removeItem('gra_user_role');
    localStorage.removeItem('gra_token');
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('currentView');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginType');

    setShowMonitoringDashboard(false);
    setShowConfigDashboard(false);
    setShowAdminDashboard(false);
    setShowGRAAdminLogin(false);
    setUserRole(null);

    // Notify parent to show header/footer again
    if (onDashboardStateChange) onDashboardStateChange(false);
  };

  // GRA Admin Portal flow
  if (showAdminDashboard) {
    return (
      <AdminDashboard
        onLogout={handleLogout}
      />
    );
  }

  if (showMonitoringDashboard) {
    return (
      <MonitoringDashboard
        onLogout={handleLogout}
      />
    );
  }

  if (showConfigDashboard) {
    // Normalize role: convert 'gra_maker' -> 'maker' and 'gra_checker' -> 'checker'
    const normalizedRole = userRole?.replace('gra_', '') || 'maker';
    return (
      <ConfigDashboard
        onLogout={handleLogout}
        userRole={normalizedRole}   
      />
    );
  }

  if (showGRAAdminLogin) {
    return (
      <GRAAdminLogin
        onBack={() => setShowGRAAdminLogin(false)}
        onLoginSuccess={handleGRALoginSuccess}
      />
    );
  }

  return (
    <div className='register-container '>
      {/* Hero Section */}
      <section className="hero-section-new">
        {/* <div className="hero-overlay"></div> */}
        <div className="container hero-content-wrapper">
          {/* Left Content */}
          <div className="hero-left">
            <h1 className="hero-title-new">
              Streamlining<br/>
              <span className="text-yellow">Compliance</span><br/>
              for the Digital<br/>
              Economy
            </h1>
            <p className="hero-description">
              Welcome to Ghana's official unified platform<br/>
              for e-Commerce registration, VAT filing, and<br/>
              automated compliance monitoring.
            </p>
            <div className="hero-buttons">
              <button className="btn-white btn">View Guidelines</button>
              <button className="btn-outline-white btn">Learn More</button>
            </div>
          </div>

          {/* Right Portal Card */}
          <div className="portal-card">
            <div className="portal-header-home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Secure Portal Access</span>
            </div>

            <div className="portal-options">
              {/* Resident Merchant */}
              <div className="portal-option" onClick={onLoginClick}>
                <div className="portal-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="portal-option-text">
                  <span className="portal-option-title">Resident Merchant</span>
                  <span className="portal-option-desc">Local entities with TIN/Ghana Card</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>

              {/* Non-Resident Merchant */}
              <div className="portal-option" onClick={handleNonResidentClick}>
                <div className="portal-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div className="portal-option-text">
                  <span className="portal-option-title">Non-Resident Merchant</span>
                  <span className="portal-option-desc">International digital service providers</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>

              {/* GRA Officer */}
              <div className="portal-option" onClick={() => setShowGRAAdminLogin(true)}>
                <div className="portal-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div className="portal-option-text">
                  <span className="portal-option-title">GRA Officer</span>
                  <span className="portal-option-desc">Admin & Compliance monitoring</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>

          </div>
        </div>
      </section>


    </div>
  );
};

export default RegisterNow;
