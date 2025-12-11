import { useState } from 'react';
import './DashboardPages.css';
import EcommerceDiscoveryResults from './EcommerceDiscoveryResults';
import { GHANA_SITES_API_URL } from '../../utils/api';

const ECommercePortals = () => {
  const [discoveryData, setDiscoveryData] = useState(null);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState(null);
  const [showDiscoveryResults, setShowDiscoveryResults] = useState(false);

  const handleDiscoverPortals = async () => {
    setShowDiscoveryResults(true);
    setDiscoveryLoading(true);
    setDiscoveryError(null);

    try {
      const response = await fetch(`${GHANA_SITES_API_URL}/ghana-sites`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Format the data - API returns { success: true, sites: [...] }
      const sites = data.sites || [];
      const formattedData = sites.map((url, index) => ({
        id: index + 1,
        url: url
      }));

      setDiscoveryData(formattedData);
    } catch (err) {
      console.error('Error fetching e-commerce sites:', err);
      setDiscoveryError(err.message || 'Failed to fetch e-commerce sites');
    } finally {
      setDiscoveryLoading(false);
    }
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
