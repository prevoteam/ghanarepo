import { useState } from 'react';
import './DashboardPages.css';
import PSPTransactionsGrid from './PSPTransactionsGrid';
import PSPDashboard from './PSPDashboard';
import { BASE_URL } from '../../utils/api';

const PSPIngestionStatus = () => {
  const [transactionData, setTransactionData] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [showTransactionResults, setShowTransactionResults] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const handleViewTransactions = async () => {
    setShowTransactionResults(true);
    setTransactionLoading(true);
    setTransactionError(null);
    setCurrentOffset(0);

    try {
      const response = await fetch(`${BASE_URL}/admin/monitoring/psp-transactions?limit=200&offset=0`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.code === 200) {
        setTransactionData(data.results.transactions || []);
        setTotalRecords(data.results.total || data.results.transactions?.length || 0);
        setCurrentOffset(200);
        setHasMore(data.results.pagination?.hasMore || false);
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching PSP transactions:', err);
      setTransactionError(err.message || 'Failed to fetch PSP transactions');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);

    try {
      const response = await fetch(`${BASE_URL}/admin/monitoring/psp-transactions?limit=200&offset=${currentOffset}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.code === 200) {
        // Append new transactions to existing data
        setTransactionData(prev => [...(prev || []), ...(data.results.transactions || [])]);
        setCurrentOffset(prev => prev + 200);
        setHasMore(data.results.pagination?.hasMore || false);
      } else {
        throw new Error(data.message || 'Failed to fetch more transactions');
      }
    } catch (err) {
      console.error('Error loading more PSP transactions:', err);
      setTransactionError(err.message || 'Failed to load more PSP transactions');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleStartNewIngestion = async () => {
    setLoadingMore(true);

    try {
      const response = await fetch(`${BASE_URL}/admin/monitoring/psp-transactions?limit=200&offset=0`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.code === 200) {
        setTransactionData(data.results.transactions || []);
        setTotalRecords(data.results.total || data.results.transactions?.length || 0);
        setCurrentOffset(200);
        setHasMore(data.results.pagination?.hasMore || false);
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error refreshing PSP transactions:', err);
      setTransactionError(err.message || 'Failed to refresh PSP transactions');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCloseTransactions = () => {
    setShowTransactionResults(false);
    setTransactionData(null);
    setTransactionError(null);
    setCurrentOffset(0);
    setHasMore(false);
  };

  // Show transactions grid when active
  if (showTransactionResults) {
    return (
      <div className="page-content">
        <PSPTransactionsGrid
          data={transactionData}
          loading={transactionLoading}
          error={transactionError}
          onClose={handleCloseTransactions}
          isInline={true}
          totalRecords={totalRecords}
          onStartNewIngestion={handleStartNewIngestion}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </div>
    );
  }

  return (
    <div className="page-content">
      <PSPDashboard onViewTransactions={handleViewTransactions} />
    </div>
  );
};

export default PSPIngestionStatus;
