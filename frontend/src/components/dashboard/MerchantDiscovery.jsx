import { useState, useEffect } from 'react';
import './DashboardPages.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MerchantDiscovery = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch merchant discovery data
  const fetchMerchantData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/v1/admin/monitoring/merchant-discovery?limit=100`);
      const data = await response.json();

      if (data.status) {
        setTableData(data.results.merchants);
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, []);

  return (
    <div className="page-content">
      <div className="table-card">
        <div className="table-header">
          <div className="table-title-section">
            <h2 className="table-title">Merchant Discovery by PSP</h2>
            <p className="table-subtitle">Breakdown of merchant entities identified through PSP data ingestion.</p>
          </div>
          <div className="table-actions">
            <button className="action-btn outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
            </button>
            <button className="action-btn outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
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
                  <th>PSP Name</th>
                  <th>Merchant Discovered</th>
                  <th>Registered</th>
                  <th>Unregistered</th>
                  <th>VAT Eligible</th>
                  <th>Compliance Rate</th>
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
                      <td className="font-medium">{row.psp_provider || '-'}</td>
                      <td>{row.transaction_id || '-'}</td>
                      <td>{row.sender_account || '-'}</td>
                      <td>{row.receiver_account || '-'}</td>
                      <td>{row.amount_ghs || '0.00'}</td>
                      <td>{row.e_levy_amount || '0.00'}</td>
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

export default MerchantDiscovery;
