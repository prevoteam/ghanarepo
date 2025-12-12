import { useEffect } from 'react';
import './DashboardPages.css';
import { usePSPData } from '../../context/PSPDataContext';
import PSPTransactionsGrid from './PSPTransactionsGrid';

const MerchantDiscovery = () => {
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

  // Auto-load data on mount if not already loaded
  useEffect(() => {
    if (!isDataLoaded && !loading) {
      loadInitialData();
    }
  }, [isDataLoaded, loading, loadInitialData]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return num.toLocaleString();
    }
    return num?.toString() || '0';
  };

  // Show loading state
  if (loading && !isDataLoaded) {
    return (
      <div className="page-content">
        <div className="merchant-discovery-loading">
          <div className="loader-spinner"></div>
          <p>Loading PSP transaction data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && transactionData.length === 0) {
    return (
      <div className="page-content">
        <div className="merchant-discovery-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Error loading data: {error}</p>
          <button onClick={loadInitialData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="merchant-discovery-header">
        <div className="discovery-info">
          <h2>Merchant Discovery</h2>
          <p className="discovery-description">
            Load and browse PSP transaction data. Data is shared across PSP Ingestion Status,
            Merchant Statistics, and High Risk Merchants pages.
          </p>
        </div>
      </div>

      {/* Transaction Grid */}
      <PSPTransactionsGrid
        data={transactionData}
        loading={loading}
        error={error}
        onClose={() => {}}
        isInline={true}
        totalRecords={totalRecords}
        currentOffset={currentOffset}
        onStartNewIngestion={refreshData}
        loadingMore={loadingMore}
        onLoadMore={loadNextBatch}
        hasMore={hasMore}
        hideBackButton={true}
      />
    </div>
  );
};

export default MerchantDiscovery;
