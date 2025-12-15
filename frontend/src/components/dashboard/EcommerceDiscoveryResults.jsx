import { useState } from 'react';
import './EcommerceDiscoveryResults.css';

const EcommerceDiscoveryResults = ({ data, loading, error, onClose, isInline = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchingUrl, setFetchingUrl] = useState(null);
  const [siteDetails, setSiteDetails] = useState({});
  const itemsPerPage = 10;


  const handleFetchData = async (url) => {
    setFetchingUrl(url);

    try {
      const apiBaseUrl = import.meta.env.VITE_GHANA_SITES_API_URL || '/python/api';
      const response = await fetch(`${apiBaseUrl}/result-json?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setSiteDetails(prev => ({
        ...prev,
        [url]: data
      }));
    } catch (err) {
      console.error('Error fetching site details:', err);
      setSiteDetails(prev => ({
        ...prev,
        [url]: {
          "URL": url,
          "Website": "Error fetching data",
          "Domain": url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
          "Sector": "Unknown",
          "Address": "Not Found",
          "Headquarters": "Not Found",
          "About": "Failed to fetch website information. Please try again.",
          "Emails": "Not Found",
          "Phones": "Not Found"
        }
      }));
    } finally {
      setFetchingUrl(null);
    }
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
          <h2>e-Commerce Discovery Results</h2>
        </div>
        <div className="discovery-loading">
          <div className="loading-spinner"></div>
          <p>Discovering e-Commerce sites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`ecommerce-discovery-results ${isInline ? 'inline-mode' : ''}`}>
        <div className="discovery-header">
          <h2>e-Commerce Discovery Results</h2>
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
          <h2>e-Commerce Discovery Results</h2>
        </div>
        <div className="discovery-empty">
          <p>No e-Commerce sites discovered.</p>
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
        <h2>e-Commerce Discovery Results</h2>
        <div className="discovery-header-actions">
          <span className="results-count">{data.length} sites found</span>
        </div>
      </div>

      <div className="discovery-table-container">
        <table className="discovery-table">
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>URL</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => {
              const isExpanded = siteDetails[item.url];
              const isFetching = fetchingUrl === item.url;

              return (
                <>
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td className="url-cell">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.url}
                      </a>
                    </td>
                    <td className="action-cell">
                      {!isExpanded ? (
                        <button
                          className="fetch-data-btn"
                          onClick={() => handleFetchData(item.url)}
                          disabled={isFetching}
                        >
                          {isFetching ? (
                            <>
                              <span className="btn-spinner"></span>
                              Fetching...
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                              Fetch Data
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          className="fetch-data-btn"
                          onClick={() => handleCloseDetails(item.url)}
                          style={{ background: '#6b7280' }}
                        >
                          Hide Details
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="details-row" key={`${item.id}-details`}>
                      <td colSpan="3">
                        <div className="site-details-card">
                          <button className="close-details-btn" onClick={() => handleCloseDetails(item.url)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                          <div className="details-grid">
                            <div className="detail-item">
                              <span className="detail-label">Website</span>
                              <span className="detail-value">{siteDetails[item.url]?.Website || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Domain</span>
                              <span className="detail-value">{siteDetails[item.url]?.Domain || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Sector</span>
                              <span className="detail-value highlight">{siteDetails[item.url]?.Sector || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Headquarters</span>
                              <span className="detail-value">{siteDetails[item.url]?.Headquarters || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Emails</span>
                              <span className="detail-value">{siteDetails[item.url]?.Emails || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Phones</span>
                              <span className="detail-value">{siteDetails[item.url]?.Phones || 'N/A'}</span>
                            </div>
                            <div className="detail-item full-width">
                              <span className="detail-label">About</span>
                              <span className="detail-value about-text">{siteDetails[item.url]?.About || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
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
