import { useState } from 'react';
import './RegisterNow.css';
import GRAAdminPortal from './GRAAdminPortal';
import MonitoringLogin from './MonitoringLogin';
import MonitoringDashboard from './MonitoringDashboard';

const RegisterNow = ({ onLoginClick, onNonResidentLoginClick }) => {
  const [showGRAAdminPortal, setShowGRAAdminPortal] = useState(false);
  const [showMonitoringLogin, setShowMonitoringLogin] = useState(false);
  const [showMonitoringDashboard, setShowMonitoringDashboard] = useState(false);

  const handlePortalSelect = (portalType) => {
    if (portalType === 'monitoring') {
      setShowGRAAdminPortal(false);
      setShowMonitoringLogin(true);
    }
  };

  const handleNonResidentClick = () => {
    if (onNonResidentLoginClick) {
      onNonResidentLoginClick();
    }
  };

  // GRA Admin Portal flow (kept internal as it's a complex flow)
  if (showMonitoringDashboard) {
    return (
      <MonitoringDashboard
        onLogout={() => {
          setShowMonitoringDashboard(false);
          setShowMonitoringLogin(false);
          setShowGRAAdminPortal(false);
        }}
      />
    );
  }

  if (showMonitoringLogin) {
    return (
      <MonitoringLogin
        onBack={() => {
          setShowMonitoringLogin(false);
          setShowGRAAdminPortal(true);
        }}
        onLoginSuccess={(data) => {
          console.log('Login successful:', data);
          setShowMonitoringLogin(false);
          setShowMonitoringDashboard(true);
        }}
      />
    );
  }

  if (showGRAAdminPortal) {
    return (
      <GRAAdminPortal
        onBack={() => setShowGRAAdminPortal(false)}
        onSelectPortal={handlePortalSelect}
      />
    );
  }

  return (
    <div className="register-now-content">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-circles">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
          <div className="hero-circle hero-circle-4"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Building a Better Ghana</h1>
          <p className="hero-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </section>

      {/* Cards Section */}
      <section className="cards-section">
        <div className="card card-clickable" onClick={() => setShowGRAAdminPortal(true)}>
          <div className="card-icon card-icon-blue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h3 className="card-title">GRA Officer</h3>
          <p className="card-description">
            Authorized personnel access for system monitoring, configuration, and compliance management.
          </p>
        </div>

        <div className="card card-clickable" onClick={onLoginClick}>
          <div className="card-icon card-icon-blue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h3 className="card-title">Resident Merchant</h3>
          <p className="card-description">
            Login to verify and comply VAT obligations for business in Ghana.
          </p>
        </div>

        <div className="card card-clickable" onClick={handleNonResidentClick}>
          <div className="card-icon card-icon-blue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <h3 className="card-title">Non-Resident Merchant</h3>
          <p className="card-description">
            Registration portal for international entities supplying digital services or goods to customers in Ghana.
          </p>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="news-section">
        <h2 className="news-title">Latest News</h2>

        <div className="news-item">
          <div className="news-image">
            <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=200&fit=crop" alt="Tax filing" />
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

        <div className="news-item">
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
      </section>
    </div>
  );
};

export default RegisterNow;
