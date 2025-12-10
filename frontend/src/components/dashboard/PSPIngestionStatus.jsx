import { useState } from 'react';
import './DashboardPages.css';
import PSPTransactionsGrid from './PSPTransactionsGrid';
import PSPDashboard from './PSPDashboard';
import { usePSPData } from '../../context/PSPDataContext';

const PSPIngestionStatus = () => {
  const [showTransactionGrid, setShowTransactionGrid] = useState(false);

  const {
    transactionData,
    totalRecords,
    currentOffset,
    loading,
    loadingMore,
    error,
    hasMore,
    isDataLoaded,
    loadInitialData,
    loadNextBatch,
    refreshData
  } = usePSPData();

  const handleViewTransactions = () => {
    setShowTransactionGrid(true);
  };

  const handleCloseTransactions = () => {
    setShowTransactionGrid(false);
  };

  // Show message if no data loaded yet (user needs to go to Merchant Discovery first)
  if (!isDataLoaded && !loading) {
    return (
      <div className="page-content">
        <div className="psp-dashboard">
          <div className="no-data-message">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <h3>No Data Loaded</h3>
            <p>Go to <strong>Merchant Discovery</strong> page to load PSP transaction data.</p>
            <p className="info-text">Once loaded, the same 200 records will be shared across PSP Ingestion Status, Merchant Statistics, and High Risk Entities pages.</p>
            <button onClick={loadInitialData} className="load-data-btn">
              Load Data Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state on initial load
  if (loading && !isDataLoaded) {
    return (
      <div className="page-content">
        <div className="psp-dashboard">
          <div className="dashboard-loading">
            <div className="loader-spinner"></div>
            <p>Loading PSP transaction data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && transactionData.length === 0) {
    return (
      <div className="page-content">
        <div className="psp-dashboard">
          <div className="dashboard-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>Error loading data: {error}</p>
            <button onClick={loadInitialData} className="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // Show transactions grid when requested
  if (showTransactionGrid) {
    return (
      <div className="page-content">
        <PSPTransactionsGrid
          data={transactionData}
          loading={loading}
          error={error}
          onClose={handleCloseTransactions}
          isInline={true}
          totalRecords={totalRecords}
          onStartNewIngestion={refreshData}
          loadingMore={loadingMore}
          onLoadMore={loadNextBatch}
          hasMore={hasMore}
        />
      </div>
    );
  }

  // Show dashboard with calculated stats from shared data
  return (
    <div className="page-content">
      <PSPDashboard
        transactionData={transactionData}
        totalRecords={totalRecords}
        currentOffset={currentOffset}
        onViewTransactions={handleViewTransactions}
        onLoadMore={loadNextBatch}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    </div>
  );
};

export default PSPIngestionStatus;
