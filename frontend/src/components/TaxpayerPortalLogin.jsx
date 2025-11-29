import './TaxpayerPortalLogin.css';

const TaxpayerPortalLogin = ({ onSelectLoginType }) => {
  const handleResidentLogin = () => {
    onSelectLoginType('resident');
  };

  const handleNonResidentLogin = () => {
    onSelectLoginType('nonresident');
  };

  return (
    <div className="taxpayer-portal-content">
      <main className="portal-main">
        <div className="portal-content">
          <h1 className="portal-title">Taxpayer Portal Login</h1>
          <p className="portal-subtitle">Select your profile type to login securely.</p>

          <div className="login-cards">
            {/* Resident Login Card */}
            <div className="login-card resident" onClick={handleResidentLogin}>
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 className="card-title">Resident Login</h3>
              <p className="card-description">Login with your username and password.</p>
            </div>

            {/* Non-Resident Login Card */}
            <div className="login-card nonresident" onClick={handleNonResidentLogin}>
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3 className="card-title">Non-Resident Login</h3>
              <p className="card-description">International entities and e-Service providers.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaxpayerPortalLogin;
