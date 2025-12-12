import './Header.css';

const Header = ({
  onLogoClick,
  activeNav = '',
  onAboutUsClick,
  onContactUsClick,
  onGuidelinesClick,
  onFAQClick,
  onPSPClick,
  onTaxpayerCornerClick,
  showPSPNav = true,
  hideNavbar = false
}) => {
  return (
    <>
      {/* Top Header */}
      <header className="shared-header">
        <div className='container'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-xl-9 col-lg-9 col-md-6 col-sm-6 col-6'>
              {/* <div className="logo-section" style={{ cursor: 'pointer' }} onClick={onLogoClick}>
                <img
                  src="/assets/logo.png"
                  alt="GRA Logo"
              className='w-100'
                />
              </div> */}
               <div className="logo-section" style={{ cursor: 'pointer' }} onClick={onLogoClick}>
            <div className="logo-circle">
              <img
                src="/assets/logo-small.png"
                alt="GRA Logo"
                style={{
                  width: '52px',
                  height: '50px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            <div className="logo-text">
              <div className="gra-text">Ghana Unified e-Commerce Compliance Portal</div>
              <div className="gra-subtext">GHANA REVENUE AUTHORITY</div>
            </div>  
          </div>
            </div>
            <div className='col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6'>
            <div className="help-info">
              <div className="help-label">Need Help?</div>
              <div className="help-phone">+233 (0) 302 123 456</div>
            </div>
            </div>
          </div>



        </div>
      </header>

      {/* Navigation - Only show if hideNavbar is false */}
      {!hideNavbar && (
    <section className='header-box'>
      <nav className="container">
        <div className='shared-navigation'>
        <button
          type="button"
          className={`nav-item ${activeNav === 'about' ? 'active' : ''}`}
          onClick={onAboutUsClick}
        >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm1 10h-2v-6h2v6z"/>
</svg>
          About Us
        </button>
        <button
          type="button"
          className={`nav-item ${activeNav === 'taxpayer-corner' ? 'active' : ''}`}
          onClick={onTaxpayerCornerClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          Taxpayer Corner
        </button>
        <button
          type="button"
          className={`nav-item ${activeNav === 'contact' ? 'active' : ''}`}
          onClick={onContactUsClick}
        >
          <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM351.3 340.7c-6.188 6.188-16.28 6.594-23.28 1.062l-46.25-35.88c-7.5-5.812-10.12-15.97-6.438-24.84l13.5-32.38c-28.62-13.12-51.62-36.12-64.75-64.75l-32.38 13.5c-8.875 3.688-19.03 1.062-24.84-6.438l-35.88-46.25c-5.531-7-5.125-17.09 1.062-23.28l33.25-33.25c6.281-6.281 16.38-6.281 22.66 0C238.3 117.3 256 136.4 256 160c0 12.5-4.5 24.81-12.69 34.19l-12.62 15.19c18.75 39.56 52.88 73.69 92.44 92.44l15.19-12.62C327.2 260.5 339.5 256 352 256c23.59 0 42.66 17.75 49.31 33.56c3.219 7.312 1.75 15.88-3.75 21.38L351.3 340.7z"/>
</svg>
          Contact Us
        </button>
        <button
          type="button"
          className={`nav-item ${activeNav === 'guidelines' ? 'active' : ''}`}
          onClick={onGuidelinesClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Guidelines
        </button>
        <button
          type="button"
          className={`nav-item ${activeNav === 'faq' ? 'active' : ''}`}
          onClick={onFAQClick}
        >
         <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm1.22-4.93-.53.45c-.44.37-.69.9-.69 1.48v.25h-1.5v-.25c0-1.03.46-2 1.26-2.66l.69-.58c.39-.33.61-.82.61-1.34A1.75 1.75 0 0 0 12 7.5c-.97 0-1.75.78-1.75 1.75h-1.5A3.25 3.25 0 0 1 12 6c1.8 0 3.25 1.46 3.25 3.25 0 .97-.42 1.89-1.03 2.32z"/>
</svg>
          FAQ
        </button>
        {showPSPNav && (
          <button
            type="button"
            className={`nav-item psp-nav-item ${activeNav === 'psp' ? 'active' : ''}`}
            onClick={onPSPClick}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            PSP On-boarding
          </button>
        )}
        <a
          className="nav-item"
          href="https://ai.studio/apps/drive/1uF7OJ0XUNseox5CYzs0NgL2afVE0jExD?fullscreenApplet=true"
          target="_blank"
          rel="noopener noreferrer"
        >
          API Connect
        </a>
        {/* This is for git test */}
        </div>
      </nav>
      </section>
      )}
    </>
  );
};

export default Header;
