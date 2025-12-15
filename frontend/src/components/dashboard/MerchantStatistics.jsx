import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import './DashboardPages.css';
import { usePSPData } from '../../context/PSPDataContext';
import { QR_CODE_API_URL, PAYMENT_PORTAL_URL } from '../../utils/api';

const MerchantStatistics = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupState, setPopupState] = useState('initial');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [actionedMerchants, setActionedMerchants] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    transactionData,
    totalRecords,
    currentOffset,
    loading,
    loadingMore,
    isDataLoaded,
    hasMore,
    loadInitialData,
    loadNextBatch
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

  // Handle initiate action click
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

  // Pagination calculations
  const totalPages = Math.ceil(transactionData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = transactionData.slice(startIndex, startIndex + itemsPerPage);

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
              Showing {formatNumber(transactionData.length)} loaded
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
                {paginatedData.map((row, index) => {
                  const riskData = calculateRiskScore(row);
                  const badgeStyle = getRiskBadgeStyle(riskData.level);
                  const transactionValue = parseFloat(row.amount_ghs) || 0;
                  const vatApplicable = transactionValue * 0.15; // 15% VAT
                  const merchantData = {
                    id: row.id || (startIndex + index),
                    merchantName: row.merchant_name || '-',
                    email: row.merchant_email || '-',
                    sourcePSP: row.psp_provider || '-',
                    transactionValueNum: transactionValue,
                    estVATApplicable: formatCurrency(vatApplicable),
                    riskScore: riskData.level,
                    tin: row.merchant_tin || 'Not Registered'
                  };
                  return (
                    <tr key={row.id || (startIndex + index)}>
                      <td>{String(startIndex + index + 1).padStart(2, '0')}</td>
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
                        {actionedMerchants.has(merchantData.id) ? (
                          <span className="actioned-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Actioned
                          </span>
                        ) : (
                          <button
                            className="initiate-action-btn"
                            onClick={() => handleInitiateAction(merchantData)}
                          >
                            Initiate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {transactionData.length > 0 && (
          <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '20px', borderTop: '1px solid #e5e7eb', background: '#f8fafc' }}>
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: currentPage === 1 ? '#e2e8f0' : '#2D3B8F', color: currentPage === 1 ? '#94a3b8' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '13px', transition: 'all 0.2s' }}
            >
              First
            </button>
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: currentPage === 1 ? '#e2e8f0' : '#2D3B8F', color: currentPage === 1 ? '#94a3b8' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '13px', transition: 'all 0.2s' }}
            >
              Previous
            </button>
            <span className="pagination-info" style={{ padding: '8px 20px', color: '#1e293b', fontSize: '14px', fontWeight: '500', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              Page {currentPage} of {totalPages} (Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, transactionData.length)} of {transactionData.length})
            </span>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: currentPage === totalPages ? '#e2e8f0' : '#2D3B8F', color: currentPage === totalPages ? '#94a3b8' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '13px', transition: 'all 0.2s' }}
            >
              Next
            </button>
          </div>
        )}
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
                <p className="popup-merchant-type">{selectedMerchant.tin !== 'Not Registered' ? 'Registered Taxpayer' : 'Unregistered Merchant'}</p>
              </div>

              {popupState === 'initial' ? (
                <>
                  {/* Proposed Automated Actions */}
                  <div className="proposed-actions">
                    <h4 className="proposed-actions-title">Proposed Automated Actions:</h4>
                    <ul className="proposed-actions-list">
                      {selectedMerchant.tin !== 'Not Registered' ? (
                        <li>Retrieve existing TIN: <span className="highlight-blue">{selectedMerchant.tin}</span>.</li>
                      ) : (
                        <li>Register new TIN for merchant.</li>
                      )}
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
                        <span
                          className="detail-value attachment"
                          onClick={async () => {
                            const doc = new jsPDF();
                            const liability = calculateLiability(selectedMerchant.transactionValueNum);
                            const paymentLink = `${PAYMENT_PORTAL_URL}/invoice/${selectedMerchant.tin}`;

                            // Add GRA Header
                            doc.setFontSize(18);
                            doc.setFont('helvetica', 'bold');
                            doc.setTextColor(30, 64, 175);
                            doc.text('GHANA REVENUE AUTHORITY', 105, 20, { align: 'center' });

                            doc.setFontSize(12);
                            doc.setTextColor(51, 51, 51);
                            doc.text('VAT Compliance Division', 105, 28, { align: 'center' });

                            doc.setFontSize(14);
                            doc.setTextColor(0, 0, 0);
                            doc.text('NOTICE OF VAT LIABILITY', 105, 40, { align: 'center' });

                            doc.setLineWidth(0.5);
                            doc.setDrawColor(30, 64, 175);
                            doc.line(20, 45, 190, 45);

                            // Document details
                            doc.setFontSize(10);
                            doc.setFont('helvetica', 'normal');
                            doc.setTextColor(51, 51, 51);
                            doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, 55);
                            doc.text(`Reference: GRA/VAT/${selectedMerchant.tin}`, 20, 62);

                            // Merchant details
                            doc.setFontSize(12);
                            doc.setFont('helvetica', 'bold');
                            doc.setTextColor(30, 64, 175);
                            doc.text('TAXPAYER DETAILS', 20, 75);

                            doc.setFontSize(10);
                            doc.setFont('helvetica', 'normal');
                            doc.setTextColor(51, 51, 51);
                            doc.text(`Name: ${selectedMerchant.merchantName}`, 20, 85);
                            doc.text(`TIN: ${selectedMerchant.tin}`, 20, 92);
                            doc.text(`Email: ${selectedMerchant.email}`, 20, 99);

                            // Liability details box
                            doc.setDrawColor(30, 64, 175);
                            doc.setLineWidth(0.3);
                            doc.rect(20, 110, 170, 55);

                            doc.setFontSize(12);
                            doc.setFont('helvetica', 'bold');
                            doc.setTextColor(30, 64, 175);
                            doc.text('LIABILITY ASSESSMENT', 25, 120);

                            doc.setFontSize(10);
                            doc.setFont('helvetica', 'normal');
                            doc.setTextColor(51, 51, 51);
                            doc.text(`Gross Transaction Value:`, 25, 130);
                            doc.text(`${formatCurrency(liability.gross)}`, 150, 130);

                            doc.text(`Levies (NHIL, GETFund, COVID):`, 25, 138);
                            doc.text(`${formatCurrency(liability.levies)}`, 150, 138);

                            doc.text(`VAT (15% on Value + Levies):`, 25, 146);
                            doc.text(`${formatCurrency(liability.vat)}`, 150, 146);

                            doc.setFont('helvetica', 'bold');
                            doc.text(`Total Liability:`, 25, 158);
                            doc.setTextColor(220, 38, 38);
                            doc.text(`${formatCurrency(liability.total)}`, 150, 158);

                            // Notice text
                            doc.setFontSize(10);
                            doc.setFont('helvetica', 'normal');
                            doc.setTextColor(51, 51, 51);
                            const noticeText = 'This is to notify you of your pending VAT liability as assessed by the Ghana Revenue Authority. Please ensure payment is made within 30 days of receiving this notice to avoid penalties and interest charges.';
                            const splitNotice = doc.splitTextToSize(noticeText, 170);
                            doc.text(splitNotice, 20, 175);

                            // Footer
                            doc.setTextColor(128, 128, 128);
                            doc.setFontSize(8);
                            doc.text('This is an official document generated by the Ghana Revenue Authority.', 105, 270, { align: 'center' });
                            doc.text('For inquiries, contact: vat.compliance@gra.gov.gh', 105, 277, { align: 'center' });

                            // Save the PDF
                            doc.save(`Notice_of_Liability_${selectedMerchant.tin}.pdf`);
                          }}
                        >
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
                        <img
                          src={`${QR_CODE_API_URL}/?size=80x80&data=${PAYMENT_PORTAL_URL}/invoice/${selectedMerchant.tin}`}
                          alt="Payment QR Code"
                          width="80"
                          height="80"
                        />
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
                        value={`${PAYMENT_PORTAL_URL}/invoice/${selectedMerchant.tin}/${Date.now()}`}
                        className="payment-link-input"
                      />
                      <button className="copy-btn" onClick={() => navigator.clipboard.writeText(`${PAYMENT_PORTAL_URL}/invoice/${selectedMerchant.tin}/${Date.now()}`)}>
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

export default MerchantStatistics;
