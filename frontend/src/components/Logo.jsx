import { useNavigate } from './useNavigate';

const Logo = ({ onHomeClick }) => {
  const handleLogoClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
  };

  return (
    <div className="logo-section" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
      <div className="logo-circle">
        <img
          src="/assets/logo.png"
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
        <div className="gra-text">GRA</div>
        <div className="gra-subtext">GHANA REVENUE AUTHORITY</div>
      </div>
    </div>
  );
};

export default Logo;
