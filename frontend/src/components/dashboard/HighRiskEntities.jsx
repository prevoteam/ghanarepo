import { useState } from 'react';
import { jsPDF } from 'jspdf';
import './DashboardPages.css';
import { QR_CODE_API_URL, PAYMENT_PORTAL_URL } from '../../utils/api';

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
                        <span
                          className="detail-value attachment"
                          onClick={async () => {
                            // Create PDF using jsPDF
                            const doc = new jsPDF();
                            const liability = calculateLiability(selectedMerchant.transactionValueNum);
                            const paymentLink = `https://pay.gra.gov.gh/invoice/${selectedMerchant.tin}`;

                            // Fetch QR code as base64
                            let qrCodeBase64 = null;
                            try {
                              const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentLink)}`);
                              const qrBlob = await qrResponse.blob();
                              qrCodeBase64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(qrBlob);
                              });
                            } catch (err) {
                              console.error('Failed to fetch QR code:', err);
                            }

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

                            // Reset color
                            doc.setTextColor(0, 0, 0);

                            // Notice text
                            doc.setFontSize(10);
                            doc.setFont('helvetica', 'normal');
                            doc.setTextColor(51, 51, 51);
                            const noticeText = 'This is to notify you of your pending VAT liability as assessed by the Ghana Revenue Authority. Please ensure payment is made within 30 days of receiving this notice to avoid penalties and interest charges.';
                            const splitNotice = doc.splitTextToSize(noticeText, 170);
                            doc.text(splitNotice, 20, 175);

                            // QR Code Section
                            doc.setDrawColor(30, 64, 175);
                            doc.rect(20, 195, 170, 60);

                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'bold');
                            doc.setTextColor(30, 64, 175);
                            doc.text('SCAN TO PAY', 25, 205);

                            // Add QR Code if available
                            if (qrCodeBase64) {
                              doc.addImage(qrCodeBase64, 'PNG', 25, 210, 40, 40);
                            }

                            // Payment link text
                            doc.setFontSize(10);
                            doc.setFont('helvetica', 'bold');
                            doc.setTextColor(51, 51, 51);
                            doc.text('Payment Link:', 75, 215);
                            doc.setFont('helvetica', 'normal');
                            doc.setTextColor(30, 64, 175);
                            doc.text(paymentLink, 75, 223);

                            doc.setFontSize(9);
                            doc.setTextColor(102, 102, 102);
                            doc.text('Scan this QR code with your mobile device', 75, 235);
                            doc.text('to make a secure payment directly to GRA.', 75, 242);

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

export default HighRiskEntities;
