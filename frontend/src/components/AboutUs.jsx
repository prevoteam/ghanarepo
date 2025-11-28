import './AboutUs.css';

const AboutUs = ({ onBack }) => {
  return (
    <div className="aboutus-page bg">
      <div className="aboutus-content ">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>

        <h1 className="aboutus-title">About Us</h1>

        <p className="aboutus-intro">
          The Ghana Revenue Authority (GRA) was established in 2009 as a result of the integration of three revenue agencies: the Customs, Excise and Preventive Service (CEPS), the Internal Revenue Service (IRS), the Value Added Tax Service (VATS), and the Revenue Agencies Governing Board (RAGB).
        </p>

        <p className="aboutus-mandate">
          <strong>Our Mandate:</strong> To ensure maximum compliance with all relevant tax laws in order to ensure a sustainable revenue stream for government, trade facilitation and controlled and safe flow of goods across the country's borders.
        </p>

        <div className="vision-box">
          <div className="vision-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </div>
          <div className="vision-content">
            <h2 className="vision-title">Our Vision</h2>
            <p className="vision-text">To be a world-class revenue administration recognized for professionalism, integrity, and excellence.</p>
          </div>
        </div>

        <div className="aboutus-body">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>

   
    </div>
  );
};

export default AboutUs;
