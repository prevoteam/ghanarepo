import { useState } from 'react';
import './DashboardPages.css';

const HighRiskEntities = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupState, setPopupState] = useState('initial'); // 'initial' or 'completed'
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [actionedMerchants, setActionedMerchants] = useState(new Set());

  const tableData = [
    {
      id: 1,
      merchantName: 'CourseHero Global',
      email: 'compliance@coursehero.com',
      sourcePSP: 'Stripe',
      transactionValue: 'GH₵450,000.00',
      transactionValueNum: 450000,
      estVATApplicable: 'GH₵85,000.00',
      riskScore: 'High',
      tin: 'P00123456'
    },
    {
      id: 2,
      merchantName: 'StreamFlix Inc',
      email: 'tax@streamflix.com',
      sourcePSP: 'PayPal',
      transactionValue: 'GH₵1,250,000.00',
      transactionValueNum: 1250000,
      estVATApplicable: 'GH₵230,000.00',
      riskScore: 'High',
      tin: 'P00234567'
    },
    {
      id: 3,
      merchantName: 'GamingPlus',
      email: 'legal@gamingplus.net',
      sourcePSP: 'Stripe',
      transactionValue: 'GH₵670,000.00',
      transactionValueNum: 670000,
      estVATApplicable: 'GH₵125,000.00',
      riskScore: 'High',
      tin: 'P00345678'
    },
  ];

  const handleInitiateAction = (merchant) => {
    setSelectedMerchant(merchant);
    setPopupState('initial');
    setShowPopup(true);
  };

  const handleProceed = () => {
    setPopupState('completed');
  };

  const handleClose = () => {
    if (selectedMerchant) {
      setActionedMerchants(prev => new Set([...prev, selectedMerchant.id]));
    }
    setShowPopup(false);
    setSelectedMerchant(null);
    setPopupState('initial');
  };

  const handleCancel = () => {
    setShowPopup(false);
    setSelectedMerchant(null);
    setPopupState('initial');
  };

  // Calculate liability values for popup
  const calculateLiability = (transactionValue) => {
    const gross = transactionValue;
    const levies = gross * 0.06; // 6% for NHIL, GETFund, COVID
    const vat = (gross + levies) * 0.15; // 15% VAT
    const total = levies + vat;
    return { gross, levies, vat, total };
  };

  const formatCurrency = (num) => {
    return `GH₵${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="page-content">
      <div className="table-card">
        <div className="table-header">
          <div className="table-title-section">
            <h2 className="table-title">High Risk Entities</h2>
            <p className="table-subtitle">Entities flagged with high risk scores requiring immediate attention.</p>
          </div>
          <div className="table-actions">
            <button className="action-btn outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>MERCHANT NAME</th>
                <th>SOURCE PSP</th>
                <th>TRANSACTION VALUE</th>
                <th>EST. VAT APPLICABLE</th>
                <th>RISK SCORE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <div className="merchant-cell">
                      <span className="merchant-name-link">
                        {row.merchantName}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </span>
                      <span className="merchant-email">{row.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="psp-badge">{row.sourcePSP}</span>
                  </td>
                  <td>{row.transactionValue}</td>
                  <td className="vat-applicable">{row.estVATApplicable}</td>
                  <td>
                    <span className="risk-badge high">
                      {row.riskScore}
                    </span>
                  </td>
                  <td>
                    {actionedMerchants.has(row.id) ? (
                      <span className="actioned-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Actioned
                      </span>
                    ) : (
                      <button
                        className="initiate-action-btn"
                        onClick={() => handleInitiateAction(row)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13"/>
                          <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                        Initiate Action
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Action Popup */}
      {showPopup && selectedMerchant && (
        <div className="popup-overlay">
          <div className="compliance-popup">
            {/* Popup Header */}
            <div className="popup-header">
              <div className="popup-header-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>Compliance Action</span>
              </div>
              <button className="popup-close" onClick={handleCancel}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Popup Body */}
            <div className="popup-body">
              {/* Merchant Info */}
              <div className="popup-merchant-info">
                <h3 className="popup-merchant-name">{selectedMerchant.merchantName}</h3>
                <p className="popup-merchant-type">Registered Taxpayer</p>
              </div>

              {popupState === 'initial' ? (
                <>
                  {/* Proposed Automated Actions */}
                  <div className="proposed-actions">
                    <h4 className="proposed-actions-title">Proposed Automated Actions:</h4>
                    <ul className="proposed-actions-list">
                      <li>Retrieve existing TIN: <span className="highlight-blue">{selectedMerchant.tin}</span>.</li>
                      <li>Calculate Pending VAT Liability: <span className="highlight-blue">{selectedMerchant.estVATApplicable}</span>.</li>
                      <li>Send Liability Intimation to <span className="highlight-blue">{selectedMerchant.email}</span>.</li>
                      <li>Include "Pay Now" link in email.</li>
                    </ul>
                  </div>

                  {/* Liability Computation */}
                  <div className="liability-computation">
                    <div className="liability-header">
                      <div className="liability-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <path d="M3 9h18"/>
                          <path d="M9 21V9"/>
                        </svg>
                        <span>Liability Computation</span>
                      </div>
                      <span className="rate-badge">Rate: Standard (21.9%)</span>
                    </div>

                    {(() => {
                      const liability = calculateLiability(selectedMerchant.transactionValueNum);
                      return (
                        <div className="liability-details">
                          <div className="liability-row">
                            <span>Gross Transaction Value</span>
                            <span className="liability-value">{formatCurrency(liability.gross)}</span>
                          </div>
                          <div className="liability-row">
                            <span>| Levies (NHIL, GETFund, COVID)</span>
                            <span className="liability-value">{formatCurrency(liability.levies)}</span>
                          </div>
                          <div className="liability-row">
                            <span>| VAT (15% on Value + Levies)</span>
                            <span className="liability-value">{formatCurrency(liability.vat)}</span>
                          </div>
                          <div className="liability-row total">
                            <span>Total Liability Assessment</span>
                            <span className="liability-value total-value">{formatCurrency(liability.total)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Action Buttons */}
                  <div className="popup-actions">
                    <button className="popup-btn cancel" onClick={handleCancel}>Cancel</button>
                    <button className="popup-btn proceed" onClick={handleProceed}>Proceed</button>
                  </div>
                </>
              ) : (
                <>
                  {/* Action Complete State */}
                  <div className="action-complete">
                    <div className="success-icon">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#10B981"/>
                        <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    <h3 className="action-complete-title">Action Complete !</h3>
                  </div>

                  {/* Action Details */}
                  <div className="action-details">
                    <div className="action-details-left">
                      <div className="detail-row">
                        <span className="detail-label">Target TIN :</span>
                        <span className="detail-value highlight-blue">{selectedMerchant.tin}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Email Sent :</span>
                        <span className="detail-value">{selectedMerchant.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Attachment :</span>
                        <span className="detail-value attachment">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          Notice_of_Liability.pdf
                        </span>
                      </div>
                    </div>
                    <div className="action-details-right">
                      <div className="qr-code">
                        <svg width="80" height="80" viewBox="0 0 100 100">
                          <rect width="100" height="100" fill="white"/>
                          <rect x="10" y="10" width="25" height="25" fill="#000"/>
                          <rect x="65" y="10" width="25" height="25" fill="#000"/>
                          <rect x="10" y="65" width="25" height="25" fill="#000"/>
                          <rect x="15" y="15" width="15" height="15" fill="white"/>
                          <rect x="70" y="15" width="15" height="15" fill="white"/>
                          <rect x="15" y="70" width="15" height="15" fill="white"/>
                          <rect x="18" y="18" width="9" height="9" fill="#000"/>
                          <rect x="73" y="18" width="9" height="9" fill="#000"/>
                          <rect x="18" y="73" width="9" height="9" fill="#000"/>
                          <rect x="40" y="10" width="5" height="5" fill="#000"/>
                          <rect x="50" y="10" width="5" height="5" fill="#000"/>
                          <rect x="40" y="20" width="5" height="5" fill="#000"/>
                          <rect x="45" y="25" width="5" height="5" fill="#000"/>
                          <rect x="40" y="40" width="20" height="20" fill="#000"/>
                          <rect x="45" y="45" width="10" height="10" fill="white"/>
                          <rect x="48" y="48" width="4" height="4" fill="#000"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Generated Payment Link */}
                  <div className="payment-link-section">
                    <h4 className="payment-link-title">Generated Payment Link</h4>
                    <div className="payment-link-box">
                      <input
                        type="text"
                        readOnly
                        value={`https://pay.gra.gov.gh/invoice/${selectedMerchant.tin}/${Date.now()}`}
                        className="payment-link-input"
                      />
                      <button className="copy-btn" onClick={() => navigator.clipboard.writeText(`https://pay.gra.gov.gh/invoice/${selectedMerchant.tin}/${Date.now()}`)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>
                    </div>
                    <p className="payment-link-note">This link has been embedded in the email notification.</p>
                  </div>

                  {/* Close Button */}
                  <div className="popup-actions">
                    <button className="popup-btn close-btn" onClick={handleClose}>Close</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighRiskEntities;
