import { useEffect } from 'react';
import './DashboardPages.css';
import { usePSPData } from '../../context/PSPDataContext';

const MerchantStatistics = () => {
  const {
    transactionData,
    totalRecords,
    currentOffset,
    loading,
    isDataLoaded,
    loadInitialData
  } = usePSPData();

  // Auto-load data on mount if not already loaded
  useEffect(() => {
    if (!isDataLoaded && !loading) {
      loadInitialData();
    }
  }, [isDataLoaded, loading, loadInitialData]);

  // Calculate risk score based on TIN (registered) and transaction value
  const calculateRiskScore = (row) => {
    const hasTIN = row.merchant_tin && row.merchant_tin.trim() !== '';
    const transactionValue = parseFloat(row.amount_ghs) || 0;

    if (hasTIN) {
      // Registered (Yes)
      if (transactionValue > 100000) {
        return { score: 3, level: 'Medium', registered: 'Yes' };
      } else if (transactionValue > 50000) {
        return { score: 1, level: 'Low', registered: 'Yes' };
      } else {
        return { score: 0, level: 'Low', registered: 'Yes' };
      }
    } else {
      // Not Registered (No)
      if (transactionValue > 100000) {
        return { score: 5, level: 'High', registered: 'No' };
      } else if (transactionValue > 50000) {
        return { score: 4, level: 'High', registered: 'No' };
      } else {
        return { score: 3, level: 'Medium', registered: 'No' };
      }
    }
  };

  const getRiskBadgeStyle = (level) => {
    const colors = {
      High: { bg: '#FEE2E2', text: '#DC2626' },
      Medium: { bg: '#FEF3C7', text: '#D97706' },
      Low: { bg: '#DBEAFE', text: '#2563EB' }
    };
    return colors[level] || colors.Medium;
  };

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
        <div className="merchant-statistics-loading">
          <div className="loader-spinner"></div>
          <p>Loading merchant statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
        <div className="table-header-new row align-items-center">
          <div className='col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12'>
            <div className="table-title-section">
            <h2 className="table-title text-dark">Merchant Statistics</h2>
            <p className="table-subtitle text-muted">Risk analysis based on TIN registration and transaction value.</p>
            <span className="records-info-badge">
              Showing {formatNumber(currentOffset - transactionData.length + 1)}-{formatNumber(currentOffset)} of {formatNumber(transactionData.length)} loaded | Total: {formatNumber(totalRecords)}
            </span>
          </div>
          </div>
         <div className='col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12'>
          <div className="table-actions d-flex justify-content-end">
           <button className="action-btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter by Risk
            </button>
          </div>
          </div>
        </div>

      <div className="table-card">
        <div className="table-container">
          {transactionData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              No data found. Please load data from Merchant Discovery page.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Merchant Name</th>
                  <th>Source PSP</th>
                  <th>Transaction Value</th>
                  <th>Est. VAT Applicable</th>
                  <th>Risk Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.map((row, index) => {
                  const riskData = calculateRiskScore(row);
                  const badgeStyle = getRiskBadgeStyle(riskData.level);
                  const transactionValue = parseFloat(row.amount_ghs) || 0;
                  const vatApplicable = transactionValue * 0.15; // 15% VAT
                  return (
                    <tr key={row.id || index}>
                      <td>{String(index + 1).padStart(2, '0')}</td>
                      <td>
                        <div className="merchant-cell">
                          <a href="#" className="merchant-name">{row.merchant_name || '-'}</a>
                          <span className="merchant-email">{row.merchant_email || '-'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="psp-badge">{row.psp_provider || '-'}</span>
                      </td>
                      <td>GH₵{transactionValue.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>GH₵{vatApplicable.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>
                        <span
                          className="risk-badge"
                          style={{
                            background: badgeStyle.bg,
                            color: badgeStyle.text
                          }}
                        >
                          {riskData.level}
                        </span>
                      </td>
                      <td>
                        <button className="initiate-action-btn">Initiate</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantStatistics;
