import './DashboardPages.css';

const ECommercePortals = () => {
  return (
    <div className="page-content">
      <div className="empty-state-card">
        <div className="empty-state-content">
          <div className="empty-state-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h2 className="empty-state-title">E-Commerce Portal Discovery</h2>
          <p className="empty-state-description">
            Initiate a scan to identify non-resident e-commerce<br/>
            platforms operating within the jurisdiction based on web<br/>
            traffic and payment gateway logs.
          </p>
          <button className="discover-btn">Discover Portals</button>
        </div>
      </div>
    </div>
  );
};

export default ECommercePortals;
