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

  const handleFetchData = async (itemKey, item) => {
    setFetchingUrl(itemKey);

    try {
      const response = await fetch('https://gra-demo.proteantech.in/ecom/api/ghana-ecommerce');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const accounts = data.accounts || [];

      // Filter accounts that match the company name
      const matchedAccounts = accounts.filter(
        acc => acc.account_title?.toLowerCase() === item.companyName?.toLowerCase()
      );

      // Aggregate social media handles from different platforms
      let instagramHandle = null;
      let facebookPage = null;
      let tiktokHandle = null;
      let website = null;

      matchedAccounts.forEach(acc => {
        if (acc.platform === 'instagram' && acc.username) {
          instagramHandle = acc.username;
        }
        if (acc.platform === 'facebook' && acc.username) {
          facebookPage = acc.username;
        }
        if (acc.platform === 'tiktok' && acc.username) {
          tiktokHandle = acc.username;
        }
        if (acc.website) {
          website = acc.website;
        }
      });

      // Build consolidated data
      const consolidatedData = {
        "Company Name": item.companyName,
        "Category": item.category,
        "Description": item.description,
        "Location": item.location,
        "Email": item.email,
        "Phone": item.phone,
        "Verified": item.verified,
        "Followers": item.followers,
        "Website": website,
        "Instagram Handle": instagramHandle,
        "Facebook Page": facebookPage,
        "TikTok Handle": tiktokHandle
      };

      setSiteDetails(prev => ({
        ...prev,
        [itemKey]: consolidatedData
      }));
    } catch (err) {
      console.error('Error fetching site details:', err);
      // Use existing item data as fallback
      setSiteDetails(prev => ({
        ...prev,
        [itemKey]: {
          "Company Name": item.companyName,
          "Category": item.category,
          "Description": item.description,
          "Location": item.location,
          "Email": item.email,
          "Phone": item.phone,
          "Verified": item.verified,
          "Followers": item.followers,
          "Website": null,
          "Instagram Handle": null,
          "Facebook Page": null,
          "TikTok Handle": null
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
          <BackButton />
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
          <h2>e-Commerce Discovery Results</h2>
          <BackButton />
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
          <BackButton />
        </div>
      </div>

      <div className="discovery-table-container">
        <table className="discovery-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Followers</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => {
              const itemKey = item.id;
              const isExpanded = siteDetails[itemKey];
              const isFetching = fetchingUrl === itemKey;

              return (
                <>
                  <tr key={item.id}>
                    <td className="company-cell">
                      <div className="company-info">
                        <span className="company-name">{item.companyName}</span>
                        <span className="company-desc">{item.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td>{item.location}</td>
                    <td className="email-cell">
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    </td>
                    <td>{item.phone}</td>
                    <td className="followers-cell">
                      {item.followers?.toLocaleString() || '0'}
                    </td>
                    <td>
                      <span className={`status-badge ${item.verified ? 'verified' : 'unverified'}`}>
                        {item.verified ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Verified
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            Unverified
                          </>
                        )}
                      </span>
                    </td>
                    <td className="action-cell">
                      {!isExpanded ? (
                        <button
                          className="fetch-data-btn"
                          onClick={() => handleFetchData(itemKey, item)}
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
                          onClick={() => handleCloseDetails(itemKey)}
                          style={{ background: '#6b7280' }}
                        >
                          Hide Details
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="details-row" key={`${item.id}-details`}>
                      <td colSpan="8">
                        <div className="site-details-card">
                          <button className="close-details-btn" onClick={() => handleCloseDetails(itemKey)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                          <div className="details-grid">
                            <div className="detail-item">
                              <span className="detail-label">Company Name</span>
                              <span className="detail-value">{siteDetails[itemKey]?.["Company Name"] || item.companyName}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Category</span>
                              <span className="detail-value highlight">{siteDetails[itemKey]?.Category || item.category}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Location</span>
                              <span className="detail-value">{siteDetails[itemKey]?.Location || item.location}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Email</span>
                              <span className="detail-value">{siteDetails[itemKey]?.Email || item.email}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Phone</span>
                              <span className="detail-value">{siteDetails[itemKey]?.Phone || item.phone}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Followers</span>
                              <span className="detail-value">{(siteDetails[itemKey]?.Followers || item.followers)?.toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Website</span>
                              <span className="detail-value">
                                {siteDetails[itemKey]?.Website ? (
                                  <a href={siteDetails[itemKey].Website} target="_blank" rel="noopener noreferrer">
                                    {siteDetails[itemKey].Website}
                                  </a>
                                ) : 'N/A'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Instagram Handle</span>
                              <span className="detail-value">
                                {siteDetails[itemKey]?.["Instagram Handle"] ? (
                                  <a href={`https://instagram.com/${siteDetails[itemKey]["Instagram Handle"]}`} target="_blank" rel="noopener noreferrer">
                                    @{siteDetails[itemKey]["Instagram Handle"]}
                                  </a>
                                ) : 'N/A'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Facebook Page</span>
                              <span className="detail-value">
                                {siteDetails[itemKey]?.["Facebook Page"] ? (
                                  <a href={`https://facebook.com/${siteDetails[itemKey]["Facebook Page"]}`} target="_blank" rel="noopener noreferrer">
                                    {siteDetails[itemKey]["Facebook Page"]}
                                  </a>
                                ) : 'N/A'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">TikTok Handle</span>
                              <span className="detail-value">
                                {siteDetails[itemKey]?.["TikTok Handle"] ? (
                                  <a href={`https://tiktok.com/@${siteDetails[itemKey]["TikTok Handle"]}`} target="_blank" rel="noopener noreferrer">
                                    @{siteDetails[itemKey]["TikTok Handle"]}
                                  </a>
                                ) : 'N/A'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Verified</span>
                              <span className={`status-badge ${siteDetails[itemKey]?.Verified ? 'verified' : 'unverified'}`}>
                                {siteDetails[itemKey]?.Verified ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="detail-item full-width">
                              <span className="detail-label">Description</span>
                              <span className="detail-value about-text">{siteDetails[itemKey]?.Description || item.description}</span>
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
