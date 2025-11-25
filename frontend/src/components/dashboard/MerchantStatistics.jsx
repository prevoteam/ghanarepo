import './DashboardPages.css';

const MerchantStatistics = () => {
  const tableData = [
    {
      srNo: '01',
      merchantName: 'Course Hero Global',
      email: 'compliance@coursehero.com',
      sourcePSP: 'Stripe',
      transactionValue: 'GH₵450,000.00',
      estVATApplicable: 'GH₵85,000.00',
      riskScore: 'High'
    },
    {
      srNo: '02',
      merchantName: 'StreamFlix Inc',
      email: 'tax@streamflix.com',
      sourcePSP: 'PayPal',
      transactionValue: 'GH₵1,250,000.00',
      estVATApplicable: 'GH₵230,000.00',
      riskScore: 'High'
    },
    {
      srNo: '03',
      merchantName: 'DesignTools Pro',
      email: 'finance@designtools.com',
      sourcePSP: 'Paddle',
      transactionValue: 'GH₵89,000.00',
      estVATApplicable: 'GH₵16,500.00',
      riskScore: 'Medium'
    },
    {
      srNo: '04',
      merchantName: 'CloudHost NV',
      email: 'billing@cloudhost.nv',
      sourcePSP: '2Checkout',
      transactionValue: 'GH₵320,000.00',
      estVATApplicable: 'GH₵60,000.00',
      riskScore: 'Low'
    },
    {
      srNo: '05',
      merchantName: 'GamingPlus',
      email: 'legal@gamingplus.net',
      sourcePSP: 'Stripe',
      transactionValue: 'GH₵670,000.00',
      estVATApplicable: 'GH₵125,000.00',
      riskScore: 'High'
    },
    {
      srNo: '06',
      merchantName: 'EduLearn Systems',
      email: 'accounts@edulearn.com',
      sourcePSP: 'Paystack',
      transactionValue: 'GH₵150,000.00',
      estVATApplicable: 'GH₵28,000.00',
      riskScore: 'Medium'
    },
  ];

  const getRiskBadge = (risk) => {
    const colors = {
      High: { bg: '#FEE2E2', text: '#DC2626' },
      Medium: { bg: '#FEF3C7', text: '#D97706' },
      Low: { bg: '#DBEAFE', text: '#2563EB' }
    };
    return colors[risk] || colors.Medium;
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
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.srNo}</td>
                  <td>
                    <div className="merchant-cell">
                      <a href="#" className="merchant-name">{row.merchantName}</a>
                      <span className="merchant-email">{row.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="psp-badge">{row.sourcePSP}</span>
                  </td>
                  <td>{row.transactionValue}</td>
                  <td>{row.estVATApplicable}</td>
                  <td>
                    <span
                      className="risk-badge"
                      style={{
                        background: getRiskBadge(row.riskScore).bg,
                        color: getRiskBadge(row.riskScore).text
                      }}
                    >
                      {row.riskScore}
                    </span>
                  </td>
                  <td>
                    <button className="initiate-action-btn">Initiate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MerchantStatistics;
