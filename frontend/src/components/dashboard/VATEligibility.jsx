import './DashboardPages.css';

const VATEligibility = () => {
  const tableData = [
    {
      srNo: '01',
      merchantName: 'Netflix Services',
      email: 'tax@netflix.com',
      sourcePSP: 'Stripe',
      registrationStatus: 'Registered',
      transactionValue: 'GH₵5,000,000.00',
      vatAmount: 'GH₵750,000.00'
    },
    {
      srNo: '02',
      merchantName: 'Udemy Inc',
      email: 'compliance@udemy.com',
      sourcePSP: 'PayPal',
      registrationStatus: 'Unregistered',
      transactionValue: 'GH₵850,000.00',
      vatAmount: 'GH₵127,500.00'
    },
    {
      srNo: '03',
      merchantName: 'Zoom Video Comm',
      email: 'billing@zoom.us',
      sourcePSP: 'Paystack',
      registrationStatus: 'Registered',
      transactionValue: 'GH₵2,300,000.00',
      vatAmount: 'GH₵345,000.00'
    },
    {
      srNo: '04',
      merchantName: 'Canva Pty Ltd',
      email: 'tax@canva.com',
      sourcePSP: 'Paddle',
      registrationStatus: 'Unregistered',
      transactionValue: 'GH₵450,000.00',
      vatAmount: 'GH₵67,500.00'
    },
    {
      srNo: '05',
      merchantName: 'Adobe Systems',
      email: 'ar@adobe.com',
      sourcePSP: 'Stripe',
      registrationStatus: 'Registered',
      transactionValue: 'GH₵4,200,000.00',
      vatAmount: 'GH₵630,000.00'
    },
    {
      srNo: '06',
      merchantName: 'Spotify AB',
      email: 'accounts@spotify.com',
      sourcePSP: 'Adyen',
      registrationStatus: 'Unregistered',
      transactionValue: 'GH₵980,000.00',
      vatAmount: 'GH₵147,000.00'
    },
  ];

  const getStatusBadge = (status) => {
    if (status === 'Registered') {
      return { bg: '#D1FAE5', text: '#059669', icon: '✓' };
    }
    return { bg: '#FEE2E2', text: '#DC2626', icon: '⚠' };
  };

  return (
    <div className="page-content">
      <div className="table-card">
        <div className="table-header">
          <div className="table-title-section">
            <h2 className="table-title">VAT Eligibility</h2>
            <p className="table-subtitle">List of merchants eligible for VAT collection based on transaction thresholds.</p>
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
                <th>Sr No</th>
                <th>Merchant Name</th>
                <th>Source PSP</th>
                <th>Registration Status</th>
                <th>Transaction Value</th>
                <th>VAT Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.srNo}</td>
                  <td>
                    <div className="merchant-cell">
                      <span className="merchant-name-text">{row.merchantName}</span>
                      <span className="merchant-email">{row.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="psp-badge">{row.sourcePSP}</span>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        background: getStatusBadge(row.registrationStatus).bg,
                        color: getStatusBadge(row.registrationStatus).text
                      }}
                    >
                      {getStatusBadge(row.registrationStatus).icon} {row.registrationStatus}
                    </span>
                  </td>
                  <td>{row.transactionValue}</td>
                  <td>{row.vatAmount}</td>
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

export default VATEligibility;
