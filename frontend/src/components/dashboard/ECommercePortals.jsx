import { useState } from 'react';
import './DashboardPages.css';
import EcommerceDiscoveryResults from './EcommerceDiscoveryResults';

const ECommercePortals = () => {
  const [discoveryData, setDiscoveryData] = useState(null);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState(null);
  const [showDiscoveryResults, setShowDiscoveryResults] = useState(false);

  const handleDiscoverPortals = () => {
    setShowDiscoveryResults(true);
    setDiscoveryLoading(true);
    setDiscoveryError(null);

    // Static data for now - TODO: Enable API call later
    const staticSites = [
      "https://ghanacommerce.com",
      "https://www.jumia.com.gh",
      "https://ghanamallonline.com",
      "https://www.aftership.com",
      "https://www.f6s.com",
      "https://www.noxmall.com",
      "https://www.tospinomall.com.gh",
      "https://www.trade.gov",
      "https://emmarnitechs.com",
      "https://smaizshop.com"
    ];

    // Simulate loading delay
    setTimeout(() => {
      const formattedData = staticSites.map((url, index) => ({
        id: index + 1,
        url: url
      }));

      setDiscoveryData(formattedData);
      setDiscoveryLoading(false);
    }, 500);
  };

  const handleCloseDiscovery = () => {
    setShowDiscoveryResults(false);
    setDiscoveryData(null);
    setDiscoveryError(null);
  };

  // Show discovery results when active
  if (showDiscoveryResults) {
    return (
      <div className="page-content">
        <EcommerceDiscoveryResults
          data={discoveryData}
          loading={discoveryLoading}
          error={discoveryError}
          onClose={handleCloseDiscovery}
          isInline={true}
        />
      </div>
    );
  }

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
          <h2 className="empty-state-title">e-Commerce Portal Discovery</h2>
          <p className="empty-state-description">
            Initiate a scan to identify non-resident e-Commerce<br/>
            platforms operating within the jurisdiction based on web<br/>
            traffic and payment gateway logs.
          </p>
          <button className="discover-btn" onClick={handleDiscoverPortals}>Discover Portals</button>
        </div>
      </div>
    </div>
  );
};

export default ECommercePortals;
