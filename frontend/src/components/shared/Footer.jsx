import './Footer.css';

const Footer = () => {
  return (
    <footer className="shared-footer container-fluid">
      <div className="footer-content container py-2">
        <div className="footer-text">Integrity. Fairness. Service</div>
        <div className="footer-copyright">© 2025 <span className='color-yellow'>Ghana Revenue Authority</span>. All rights reserved.</div>
        <button
          className="assistant-button"
          onClick={() => window.open('https://gra-demo.proteantech.in/chat/', '_blank')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Ask GRA Assistant
        </button>
      </div>
    </footer>
  );
};

export default Footer;
