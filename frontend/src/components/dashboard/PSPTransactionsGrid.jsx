import { useState } from 'react';
import './PSPTransactionsGrid.css';

const PSPTransactionsGrid = ({ data, loading, error, onClose, isInline = false, totalRecords = 0, currentOffset = 0, onStartNewIngestion, loadingMore = false, onLoadMore, hasMore = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const StartNewIngestionButton = () => (
    <button
      className="start-ingestion-btn"
      onClick={onStartNewIngestion}
      disabled={loadingMore}
    >
      {loadingMore ? (
        <>
          <svg className="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
          </svg>
          <span>Refreshing...</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span>Start New Ingestion</span>
        </>
      )}
    </button>
  );

  const LoadMoreButton = () => (
    <button
      className="load-more-btn"
      onClick={onLoadMore}
      disabled={loadingMore}
    >
      {loadingMore ? (
        <>
          <svg className="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span>Load More (Next 200)</span>
        </>
      )}
    </button>
  );

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

  if (loading) {
    return (
      <div className={`psp-transactions-grid ${isInline ? 'inline-mode' : ''}`}>
        <div className="transactions-header">
          <h2>PSP Ingestion Status</h2>
          <BackButton />
        </div>
        <div className="transactions-loading">
          <div className="beautiful-loader">
            <div className="loader-ring">
              <div className="loader-ring-inner"></div>
            </div>
            <div className="loader-particles">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <p className="loading-text">Fetching PSP transaction data...</p>
          <p className="loading-subtext">Please wait while we retrieve the records</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`psp-transactions-grid ${isInline ? 'inline-mode' : ''}`}>
        <div className="transactions-header">
          <h2>PSP Ingestion Status</h2>
          <BackButton />
        </div>
        <div className="transactions-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Error fetching transaction data: {error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`psp-transactions-grid ${isInline ? 'inline-mode' : ''}`}>
        <div className="transactions-header">
          <h2>PSP Ingestion Status</h2>
          <BackButton />
        </div>
        <div className="transactions-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          <p>No PSP transactions found.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  // Get column names dynamically from data (excluding 'id')
  const columns = data.length > 0 ? Object.keys(data[0]).filter(key => key.toLowerCase() !== 'id') : [];

  const formatValue = (value, key) => {
    if (value === null || value === undefined) return '-';

    // Format dates
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('created') || key.toLowerCase().includes('updated')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (e) {
        return String(value);
      }
    }

    // Format currency/amount fields
    if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('value') || key.toLowerCase().includes('price')) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return num.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }

    return String(value);
  };

  const formatColumnHeader = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className={`psp-transactions-grid ${isInline ? 'inline-mode' : ''}`}>
      <div className="transactions-header">
        <h2>PSP Ingestion Status</h2>
        <div className="transactions-header-actions">
          <span className="results-count">Total Records: {totalRecords.toLocaleString()}</span>
          {onStartNewIngestion && <StartNewIngestionButton />}
          <BackButton />
        </div>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th className="sr-no-column">Sr No.</th>
              {columns.map((col) => (
                <th key={col}>{formatColumnHeader(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index}>
                <td className="sr-no-column">{startIndex + index + 1}</td>
                {columns.map((col) => (
                  <td key={col} className={col.toLowerCase().includes('amount') || col.toLowerCase().includes('value') ? 'amount-cell' : ''}>
                    {formatValue(item[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="transactions-pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            First
          </button>
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages} (Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} of {(currentOffset - data.length + 1)}-{currentOffset} loaded | Total: {totalRecords.toLocaleString()})
          </span>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Last
          </button>
          {hasMore && onLoadMore && (
            <LoadMoreButton />
          )}
        </div>
    </div>
  );
};

export default PSPTransactionsGrid;
