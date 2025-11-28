import { useState } from 'react';
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

  const handleNonResidentClick = () => {
    if (onNonResidentLoginClick) {
      onNonResidentLoginClick();
    }
  };

  const handleGRALoginSuccess = (data) => {
    console.log('GRA Admin Login successful:', data);

    const role = data.userRole || sessionStorage.getItem('gra_user_role');

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
    // Clear all session data
    sessionStorage.removeItem('gra_session_id');
    sessionStorage.removeItem('gra_user_role');
    sessionStorage.removeItem('gra_token');

    setShowMonitoringDashboard(false);
    setShowConfigDashboard(false);
    setShowAdminDashboard(false);
    setShowGRAAdminLogin(false);
    setUserRole(null);
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
    <div className='register-container'>
      {/* Hero Section */}
      <section className="hero-section">
     
        <div className="container">
          <h1 className="hero-title">Your Single Gateway for Compliant Online Business in Ghana</h1>
          <p className="hero-subtitle mb-0">
            Register • Verify • Update • Stay Tax Compliant
          </p>
        </div>
      </section>

      {/* Cards Section */}
     <div className="container my-5">
      <div className="row g-4">

        {/* GRA Officer */}
        <div className="col-md-4" onClick={() => setShowGRAAdminLogin(true)}>
          <div
            className="py-4 h-100 role-card"
            style={{
              background: "#ffffff",
              border: "1px solid #E5E7EB",
              borderRadius: "18px",
              position: "relative",
              transition: "background 0.3s ease"
            }}
          >
            {/* Icon box exactly like image */}
            <div
              style={{
                background: "#1F3A83",
                width: "58px",
                height: "40px",
                borderRadius: "0px 8px 8px 0px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}
              
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>

           <div className='px-4'>
             <h5 className="fw-semibold mb-2">GRA Officer</h5>
            <p className="text-muted mb-0">
              Authorized personnel access for system monitoring, configuration,
              and compliance management.
            </p>
           </div>
          </div>
        </div>

        {/* Resident Merchant */}
        <div className="col-md-4" onClick={onLoginClick}>
         <div
            className="py-4 h-100 role-card"
            style={{
              background: "#ffffff",
              border: "1px solid #E5E7EB",
              borderRadius: "18px",
              transition: "background 0.3s ease"
            }}
          >
            <div
              style={{
                background: "#1F3A83",
              width: "58px",
                height: "40px",
                borderRadius: "0px 8px 8px 0px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
   <div className='px-4'>
            <h5 className="fw-semibold mb-2">Resident Merchant</h5>
            <p className="text-muted mb-0">
              Login to verify and comply VAT obligations for business in Ghana.
            </p>
            </div>
          </div>
        </div>

        {/* Non-Resident Merchant */}
        <div className="col-md-4" onClick={handleNonResidentClick}>
         <div
            className="py-4 h-100 role-card"
            style={{
              background: "#ffffff",
              border: "1px solid #E5E7EB",
              borderRadius: "18px",
              transition: "background 0.3s ease"
            }}
          >
            <div
              style={{
                background: "#1F3A83",
               width: "58px",
                height: "40px",
                borderRadius: "0px 8px 8px 0px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
   <div className='px-4'>
            <h5 className="fw-semibold mb-2">Non-Resident Merchant</h5>
            <p className="text-muted mb-0">
              Registration portal for international entities supplying digital
              services or goods to customers in Ghana.
            </p>
            </div>
          </div>
        </div>

      </div>
    </div>


      {/* Latest News Section */}
 
      <section className='container mb-5' >
          <div className="news-section">
        <h2 className="news-title">Latest News</h2>

        <div className="news-item d-flex align-items-center">
          <div className="news-image">
            <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=200&fit=crop" alt="Tax filing" />
            {/* <div className="news-badge">TAX</div> */}
          </div>
          <div className="news-content">
            <span className="news-tag">PRESS RELEASE</span>
            <h3 className="news-heading">GRA launches new digital portal for seamless tax filing</h3>
            <p className="news-description">
              The Commissioner-General today unveiled the new integrated tax application system designed to simplify compliance...
            </p>
            <button className="news-link">Read More</button>
          </div>
        </div>
        <div className='border-bottom-1px'></div>

        <div className="news-item d-flex align-items-center mt-3">
          <div className="news-image">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop" alt="Digital portal" />
            <div className="news-badge">TAX</div>
          </div>
          <div className="news-content">
            <div className="news-tag">PRESS RELEASE</div>
            <h3 className="news-heading">GRA launches new digital portal for seamless tax filing</h3>
            <p className="news-description">
              The Commissioner-General today unveiled the new integrated tax application system designed to simplify compliance...
            </p>
            <button className="news-link">Read More</button>
          </div>
        </div>
        </div>
      </section>


    </div>
  );
};

export default RegisterNow;
