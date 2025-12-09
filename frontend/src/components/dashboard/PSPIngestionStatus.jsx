import { useState } from 'react';
import './DashboardPages.css';
import PSPTransactionsGrid from './PSPTransactionsGrid';
import { BASE_URL } from '../../utils/api';

const PSPIngestionStatus = () => {
  const [transactionData, setTransactionData] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [showTransactionResults, setShowTransactionResults] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const handleViewTransactions = async () => {
    setShowTransactionResults(true);
    setTransactionLoading(true);
    setTransactionError(null);

    try {
      const response = await fetch(`${BASE_URL}/admin/monitoring/psp-transactions?limit=200`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.code === 200) {
        setTransactionData(data.results.transactions || []);
        setTotalRecords(data.results.total || data.results.transactions?.length || 0);
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

  const handleCloseTransactions = () => {
    setShowTransactionResults(false);
    setTransactionData(null);
    setTransactionError(null);
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
        />
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="empty-state-card">
        <div className="empty-state-content">
          <div className="empty-state-icon psp-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              <path d="M3 12v7c0 1.66 4 3 9 3s9-1.34 9-3v-7"/>
            </svg>
          </div>
          <h2 className="empty-state-title">PSP Ingestion Status</h2>
          <p className="empty-state-description">
            View real-time PSP transaction data ingested from<br/>
            payment service providers. Monitor transaction records<br/>
            and track payment gateway activity.
          </p>
          <button className="discover-btn" onClick={handleViewTransactions}>View Transactions</button>
        </div>
      </div>
    </div>
  );
};

export default PSPIngestionStatus;
