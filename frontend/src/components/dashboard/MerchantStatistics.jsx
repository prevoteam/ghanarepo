import { useState, useEffect } from 'react';
import './DashboardPages.css';
import { ADMIN_API_BASE_URL } from '../../utils/api';

const MerchantStatistics = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch merchant statistics data
  const fetchMerchantStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ADMIN_API_BASE_URL}/merchant-statistics?limit=100`);
      const data = await response.json();

      if (data.status) {
        setTableData(data.results.merchants);
      }
    } catch (error) {
      console.error('Error fetching merchant statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantStatistics();
  }, []);

  const getRiskBadge = (status) => {
    const colors = {
      FAILED: { bg: '#FEE2E2', text: '#DC2626', label: 'High' },
      PENDING: { bg: '#FEF3C7', text: '#D97706', label: 'Medium' },
      SUCCESS: { bg: '#DBEAFE', text: '#2563EB', label: 'Low' }
    };
    return colors[status?.toUpperCase()] || colors.PENDING;
  };

  return (
    <div className="page-content">
      <div className="table-card">
        <div className="table-header">
          <div className="table-title-section">
            <h2 className="table-title">Unregistered Merchant Statistics</h2>
            <p className="table-subtitle">High-volume non-resident entities identified for compliance action.</p>
          </div>
          <div className="table-actions">
            <button className="action-btn outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter by Risk
            </button>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
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
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{String(index + 1).padStart(2, '0')}</td>
                      <td>
                        <div className="merchant-cell">
                          <a href="#" className="merchant-name">{row.receiver_account || '-'}</a>
                          <span className="merchant-email">{row.sender_account || '-'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="psp-badge">{row.psp_provider || '-'}</span>
                      </td>
                      <td>GH₵{row.amount_ghs || '0.00'}</td>
                      <td>GH₵{row.e_levy_amount || '0.00'}</td>
                      <td>
                        <span
                          className="risk-badge"
                          style={{
                            background: getRiskBadge(row.status).bg,
                            color: getRiskBadge(row.status).text
                          }}
                        >
                          {getRiskBadge(row.status).label}
                        </span>
                      </td>
                      <td>
                        <button className="initiate-action-btn">Initiate</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantStatistics;
