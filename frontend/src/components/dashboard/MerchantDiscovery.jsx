import './DashboardPages.css';

const MerchantDiscovery = () => {
  const tableData = [
    { srNo: '01', pspName: 'Stripe', merchantDiscovered: '1,240', registered: '450', unregistered: '790', vatEligible: '320', complianceRate: 36 },
    { srNo: '02', pspName: 'PayPal', merchantDiscovered: '980', registered: '450', unregistered: '360', vatEligible: '150', complianceRate: 63 },
    { srNo: '03', pspName: 'Paystack', merchantDiscovered: '850', registered: '450', unregistered: '650', vatEligible: '400', complianceRate: 24 },
    { srNo: '04', pspName: 'Flutterwave', merchantDiscovered: '620', registered: '450', unregistered: '470', vatEligible: '320', complianceRate: 24 },
    { srNo: '05', pspName: 'Paddle', merchantDiscovered: '310', registered: '450', unregistered: '230', vatEligible: '110', complianceRate: 26 },
    { srNo: '06', pspName: '2Checkout', merchantDiscovered: '180', registered: '450', unregistered: '90', vatEligible: '45', complianceRate: 50 },
  ];

  const totals = {
    merchantDiscovered: '4,180',
    registered: '1,590',
    unregistered: '2,590',
    vatEligible: '1,345'
  };

  const getComplianceColor = (rate) => {
    if (rate >= 50) return '#10B981';
    if (rate >= 30) return '#F59E0B';
    return '#F59E0B';
  };

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
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.srNo}</td>
                  <td className="font-medium">{row.pspName}</td>
                  <td>{row.merchantDiscovered}</td>
                  <td>{row.registered}</td>
                  <td>{row.unregistered}</td>
                  <td>{row.vatEligible}</td>
                  <td>
                    <div className="compliance-cell">
                      <span style={{ color: getComplianceColor(row.complianceRate) }}>{row.complianceRate}%</span>
                      <div className="compliance-bar">
                        <div
                          className="compliance-fill"
                          style={{
                            width: `${row.complianceRate}%`,
                            background: getComplianceColor(row.complianceRate)
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>Total</strong></td>
                <td></td>
                <td><strong>{totals.merchantDiscovered}</strong></td>
                <td><strong>{totals.registered}</strong></td>
                <td><strong>{totals.unregistered}</strong></td>
                <td><strong>{totals.vatEligible}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MerchantDiscovery;
