import { useState } from 'react';
import './EcommerceDiscoveryResults.css';

const EcommerceDiscoveryResults = ({ data, loading, error, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (loading) {
    return (
      <div className="ecommerce-discovery-results">
        <div className="discovery-header">
          <h2>E-Commerce Discovery Results</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="discovery-loading">
          <div className="loading-spinner"></div>
          <p>Discovering e-commerce merchants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ecommerce-discovery-results">
        <div className="discovery-header">
          <h2>E-Commerce Discovery Results</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
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
      <div className="ecommerce-discovery-results">
        <div className="discovery-header">
          <h2>E-Commerce Discovery Results</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="discovery-empty">
          <p>No e-commerce merchants discovered.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="ecommerce-discovery-results">
      <div className="discovery-header">
        <h2>E-Commerce Discovery Results</h2>
        <div className="discovery-header-actions">
          <span className="results-count">{data.length} merchants found</span>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="discovery-table-container">
        <table className="discovery-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Merchant Name</th>
              <th>Email</th>
              <th>Website</th>
              <th>Company</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((merchant) => (
              <tr key={merchant.id}>
                <td>{merchant.id}</td>
                <td>{merchant.name}</td>
                <td>{merchant.email}</td>
                <td>
                  <a href={merchant.website} target="_blank" rel="noopener noreferrer">
                    {merchant.website}
                  </a>
                </td>
                <td>{merchant.company?.name || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${merchant.status?.toLowerCase() || 'pending'}`}>
                    {merchant.status || 'Pending'}
                  </span>
                </td>
              </tr>
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
