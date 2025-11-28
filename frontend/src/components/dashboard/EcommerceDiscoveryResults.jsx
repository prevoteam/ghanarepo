import { useState } from 'react';
import './EcommerceDiscoveryResults.css';

const EcommerceDiscoveryResults = ({ data, loading, error, onClose, isInline = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchingUrl, setFetchingUrl] = useState(null);
  const [siteDetails, setSiteDetails] = useState({});
  const itemsPerPage = 10;

  const BackButton = () => (
    <button className={isInline ? "back-btn" : "close-btn"} onClick={onClose}>
      {isInline ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Back to Dashboard</span>
        </>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      )}
    </button>
  );

  const handleFetchData = async (url) => {
    setFetchingUrl(url);

    // Static data for now - TODO: Enable API call later
    // const response = await fetch(`http://127.0.0.1:8000/api/result-json?url=${encodeURIComponent(url)}`);
    // const data = await response.json();

    // Simulate API delay and return static data
    setTimeout(() => {
      const staticResponse = {
        "URL": url,
        "Website": "E-Commerce Development Company in Ghana | Ghana Com...",
        "Domain": url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
        "Sector": "E-commerce",
        "Address": "Not Found",
        "Headquarters": "Not Found",
        "About": "About Us - Sample e-commerce website description. This is a placeholder for the actual website information that would be fetched from the API.",
        "Emails": "contact@example.com",
        "Phones": "None"
      };

      setSiteDetails(prev => ({
        ...prev,
        [url]: staticResponse
      }));
      setFetchingUrl(null);
    }, 800);
  };

  const handleCloseDetails = (url) => {
    setSiteDetails(prev => {
      const newDetails = { ...prev };
      delete newDetails[url];
      return newDetails;
    });
  };

  if (loading) {
    return (
      <div className={`ecommerce-discovery-results ${isInline ? 'inline-mode' : ''}`}>
        <div className="discovery-header">
          <h2>E-Commerce Discovery Results</h2>
          <BackButton />
        </div>
        <div className="discovery-loading">
          <div className="loading-spinner"></div>
          <p>Discovering e-commerce sites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`ecommerce-discovery-results ${isInline ? 'inline-mode' : ''}`}>
        <div className="discovery-header">
          <h2>E-Commerce Discovery Results</h2>
          <BackButton />
        </div>
        <div className="discovery-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Error fetching discovery data: {error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`ecommerce-discovery-results ${isInline ? 'inline-mode' : ''}`}>
        <div className="discovery-header">
          <h2>E-Commerce Discovery Results</h2>
          <BackButton />
        </div>
        <div className="discovery-empty">
          <p>No e-commerce sites discovered.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={`ecommerce-discovery-results ${isInline ? 'inline-mode' : ''}`}>
      <div className="discovery-header">
        <h2>E-Commerce Discovery Results</h2>
        <div className="discovery-header-actions">
          <span className="results-count">{data.length} sites found</span>
          <BackButton />
        </div>
      </div>

      <div className="discovery-table-container">
        <table className="discovery-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <>
                <tr key={item.id}>
                  <td className="url-cell">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.url}
                    </a>
                  </td>
                  <td className="action-cell">
                    <button
                      className="fetch-data-btn"
                      onClick={() => handleFetchData(item.url)}
                      disabled={fetchingUrl === item.url}
                    >
                      {fetchingUrl === item.url ? (
                        <>
                          <span className="btn-spinner"></span>
                          Fetching...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Fetch Data
                        </>
                      )}
                    </button>
                  </td>
                </tr>
                {siteDetails[item.url] && (
                  <tr key={`${item.id}-details`} className="details-row">
                    <td colSpan="2">
                      <div className="site-details-card">
                        <button className="close-details-btn" onClick={() => handleCloseDetails(item.url)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Website</span>
                            <span className="detail-value">{siteDetails[item.url].Website}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Domain</span>
                            <span className="detail-value">{siteDetails[item.url].Domain}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Sector</span>
                            <span className="detail-value highlight">{siteDetails[item.url].Sector}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Address</span>
                            <span className="detail-value">{siteDetails[item.url].Address}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Headquarters</span>
                            <span className="detail-value">{siteDetails[item.url].Headquarters}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Emails</span>
                            <span className="detail-value">{siteDetails[item.url].Emails}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Phones</span>
                            <span className="detail-value">{siteDetails[item.url].Phones}</span>
                          </div>
                          <div className="detail-item full-width">
                            <span className="detail-label">About</span>
                            <span className="detail-value about-text">{siteDetails[item.url].About}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="discovery-pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EcommerceDiscoveryResults;
