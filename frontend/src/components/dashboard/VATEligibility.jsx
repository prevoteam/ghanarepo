import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './DashboardPages.css';

const VATEligibility = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  // Popup states
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [vatRates, setVatRates] = useState([]);
  const [liabilityData, setLiabilityData] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // API Base URL from environment variable
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1';

  // Fetch VAT eligibility data from API
  const fetchVATEligibilityData = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL}/admin/monitoring/vat-eligibility`;
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status) {
        setTableData(data.data?.merchants || data.results?.merchants || []);
      } else {
        setError(data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching VAT eligibility data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch VAT rates from API
  const fetchVATRates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/monitoring/vat-rates`);
      const data = await response.json();

      console.log('VAT Rates API Response:', data);

      if (data.status) {
        const rates = data.data?.rates || data.results?.rates || [];
        console.log('Extracted rates:', rates);
        setVatRates(rates);
        return rates;
      }
      return [];
    } catch (err) {
      console.error('Error fetching VAT rates:', err);
      return [];
    }
  };

  // Calculate liability based on rates from API
  const calculateLiability = (transactionValue, rates) => {
    const grossValue = parseFloat(transactionValue) || 0;

    console.log('Calculating liability with grossValue:', grossValue);
    console.log('Rates received:', rates);

    // Get rates from database - search by levy_type
    const nhilRecord = rates.find(r => r.levy_type && r.levy_type.toUpperCase().includes('NHIL'));
    const getfundRecord = rates.find(r => r.levy_type && r.levy_type.toUpperCase().includes('GETFUND'));
    const covidRecord = rates.find(r => r.levy_type && r.levy_type.toUpperCase().includes('COVID'));
    const vatRecord = rates.find(r => r.levy_type && r.levy_type.toUpperCase().includes('STANDARD VAT'));

    console.log('Found records:', { nhilRecord, getfundRecord, covidRecord, vatRecord });

    // Extract rates (use defaults if not found)
    const nhilRate = parseFloat(nhilRecord?.rate) || 2.5;
    const getfundRate = parseFloat(getfundRecord?.rate) || 2.5;
    const covidRate = parseFloat(covidRecord?.rate) || 1;
    const vatRate = parseFloat(vatRecord?.rate) || 15;

    console.log('Extracted rates:', { nhilRate, getfundRate, covidRate, vatRate });

    // Calculate levies (NHIL + GETFund + COVID) as percentage of gross
    const leviesRate = nhilRate + getfundRate + covidRate;
    const leviesAmount = grossValue * (leviesRate / 100);

    console.log('Levies calculation:', { leviesRate, leviesAmount });

    // Calculate VAT on (Gross + Levies)
    const vatAmount = (grossValue + leviesAmount) * (vatRate / 100);

    console.log('VAT calculation:', { vatAmount });

    // Total liability
    const totalLiability = leviesAmount + vatAmount;

    // Total rate percentage
    const totalRate = grossValue > 0 ? ((totalLiability / grossValue) * 100).toFixed(1) : '0';

    const result = {
      grossValue,
      leviesAmount,
      leviesRate,
      vatAmount,
      vatRate,
      totalLiability,
      totalRate,
      nhilRate,
      getfundRate,
      covidRate
    };

    console.log('Final liability result:', result);

    return result;
  };

  // Fetch data on component mount and when filter changes
  useEffect(() => {
    fetchVATEligibilityData();
  }, [filterStatus]);

  // Format currency
  const formatCurrency = (amount) => {
    const value = parseFloat(amount) || 0;
    return `GH\u20B5${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Get status badge styling
  const getStatusBadge = (status, actionStatus) => {
    if (actionStatus === 'Processed' || status === 'Actioned') {
      return { bg: '#DBEAFE', text: '#2563EB', icon: '', label: 'Actioned' };
    }
    if (status === 'Registered') {
      return { bg: '#D1FAE5', text: '#059669', icon: '✓', label: 'Registered' };
    }
    return { bg: '#FEE2E2', text: '#DC2626', icon: '⚠', label: 'Unregistered' };
  };

  // Handle Initiate Action click
  const handleInitiateAction = async (merchant) => {
    setSelectedMerchant(merchant);
    setShowComplianceModal(true);
    setLiabilityData(null);
    setLoadingRates(true);

    try {
      const rates = await fetchVATRates();
      console.log('Rates fetched for merchant:', merchant.merchant_name, rates);

      if (rates && rates.length > 0) {
        const liability = calculateLiability(merchant.transaction_value, rates);
        setLiabilityData(liability);
      } else {
        console.warn('No rates found, using default calculation');
        const liability = calculateLiability(merchant.transaction_value, []);
        setLiabilityData(liability);
      }
    } catch (err) {
      console.error('Error in handleInitiateAction:', err);
      const liability = calculateLiability(merchant.transaction_value, []);
      setLiabilityData(liability);
    } finally {
      setLoadingRates(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowComplianceModal(false);
    setSelectedMerchant(null);
    setLiabilityData(null);
  };

  // Handle completed modal close
  const handleCloseCompleted = () => {
    setShowCompletedModal(false);
    setActionResult(null);
    setSelectedMerchant(null);
  };

  // Handle clicking on Processed badge to view details
  const handleViewProcessed = (merchant) => {
    const paymentLink = `https://pay.gra.gov.gh/invoice/${merchant.tin}/${Date.now()}`;
    setActionResult({
      tin: merchant.tin,
      merchant_id: merchant.id,
      merchant_name: merchant.merchant_name,
      merchant_email: merchant.merchant_email,
      payment_link: paymentLink,
      registration_status: 'Actioned',
      action_status: 'Processed'
    });
    setSelectedMerchant(merchant);
    setShowCompletedModal(true);
  };

  // Handle Proceed button click
  const handleProceed = async () => {
    if (!selectedMerchant) return;
    setProcessingAction(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/monitoring/compliance-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: selectedMerchant.id,
          merchant_name: selectedMerchant.merchant_name,
          merchant_email: selectedMerchant.merchant_email,
          transaction_value: selectedMerchant.transaction_value,
          vat_amount: liabilityData?.vatAmount,
          levies_amount: liabilityData?.leviesAmount,
          total_liability: liabilityData?.totalLiability
        })
      });

      const data = await response.json();
      console.log('Compliance action response:', data);

      if (data.status) {
        // Ensure we have proper data structure for the modal
        const resultData = data.results || {};
        const actionResultData = {
          tin: resultData.tin || 'N/A',
          merchant_id: resultData.merchant_id || selectedMerchant.id,
          merchant_name: resultData.merchant_name || selectedMerchant.merchant_name,
          merchant_email: resultData.merchant_email || selectedMerchant.merchant_email,
          payment_link: resultData.payment_link || '',
          registration_status: resultData.registration_status || 'Actioned',
          action_status: resultData.action_status || 'Processed'
        };

        setActionResult(actionResultData);

        // Update the table data locally
        setTableData(prev => prev.map(item => {
          if (item.id === selectedMerchant.id) {
            return {
              ...item,
              registration_status: 'Actioned',
              action_status: 'Processed',
              tin: actionResultData.tin
            };
          }
          return item;
        }));

        setShowComplianceModal(false);
        setShowCompletedModal(true);
      } else {
        alert(data.message || 'Failed to process compliance action');
      }
    } catch (error) {
      console.error('Error processing compliance action:', error);
      alert('Failed to process compliance action. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle copy payment link
  const handleCopyLink = () => {
    const link = actionResult?.payment_link;
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');

      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      // Header
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175);
      doc.text('GHANA REVENUE AUTHORITY', doc.internal.pageSize.width / 2, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      doc.text('VAT Compliance Division', doc.internal.pageSize.width / 2, 22, { align: 'center' });

      // Title
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('VAT ELIGIBILITY LIST', doc.internal.pageSize.width / 2, 32, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(102, 102, 102);
      doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.width / 2, 38, { align: 'center' });

      // Table data
      const tableColumn = ['#', 'Merchant Name', 'Email', 'PSP', 'Status', 'Transaction Value', 'VAT Amount', 'Action'];
      const tableRows = tableData.map((row, index) => [
        index + 1,
        row.merchant_name || 'N/A',
        row.merchant_email || 'N/A',
        row.psp_name || 'N/A',
        row.registration_status || 'N/A',
        `GHS ${parseFloat(row.transaction_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        `GHS ${parseFloat(row.vat_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        row.action_status || 'Pending'
      ]);

      // Generate table using autoTable
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 51, 51]
        },
        alternateRowStyles: {
          fillColor: [243, 244, 246]
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 35 },
          6: { cellWidth: 35 },
          7: { cellWidth: 25 }
        }
      });

      // Summary
      const finalY = doc.lastAutoTable.finalY + 10;
      const totalTransaction = tableData.reduce((sum, m) => sum + parseFloat(m.transaction_value || 0), 0);
      const totalVAT = tableData.reduce((sum, m) => sum + parseFloat(m.vat_amount || 0), 0);

      doc.setFontSize(10);
      doc.setTextColor(30, 64, 175);
      doc.text(`Total Merchants: ${tableData.length}`, 14, finalY);
      doc.text(`Total Transaction Value: GHS ${totalTransaction.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 14, finalY + 6);
      doc.text(`Total VAT Amount: GHS ${totalVAT.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 14, finalY + 12);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.text('This is an official document generated by the Ghana Revenue Authority.', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

      // Save
      doc.save(`VAT_Eligibility_List_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="page-content">
      <div className="table-card">
        <div className="table-header">
          <div className="table-title-section">
            <h2 className="table-title" style={{ color: 'white' }}>VAT Eligibility</h2>
            <p className="table-subtitle" style={{ color: 'white' }}>List of merchants eligible for VAT collection based on transaction thresholds.</p>
          </div>
          <div className="table-actions">
            <button className="action-btn outline" onClick={() => setFilterStatus(filterStatus ? '' : 'Unregistered')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter Status
            </button>
            <button className="action-btn primary" style={{ background: '#10B981', border: 'none' }} onClick={handleExportPDF}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export List
            </button>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>{error}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>MERCHANT NAME</th>
                  <th>PSP NAME</th>
                  <th>REGISTRATION STATUS</th>
                  <th>TRANSACTION VALUE</th>
                  <th>VAT AMOUNT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => {
                  const statusBadge = getStatusBadge(row.registration_status, row.action_status);
                  return (
                    <tr key={row.id || index}>
                      <td>
                        <div className="merchant-cell">
                          <span className="merchant-name-text">{row.merchant_name}</span>
                          <span className="merchant-email">{row.merchant_email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="psp-badge">{row.psp_name}</span>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background: statusBadge.bg,
                            color: statusBadge.text
                          }}
                        >
                          {statusBadge.icon && <span>{statusBadge.icon} </span>}
                          {statusBadge.label}
                        </span>
                      </td>
                      <td>{formatCurrency(row.transaction_value)}</td>
                      <td style={{ color: '#DC2626', fontWeight: '500' }}>{formatCurrency(row.vat_amount)}</td>
                      <td>
                        {row.action_status === 'Processed' ? (
                          <button
                            className="processed-badge-btn"
                            onClick={() => handleViewProcessed(row)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Processed
                          </button>
                        ) : row.action_status === 'Processing' ? (
                          <span className="processing-badge">
                            <svg className="processing-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/>
                            </svg>
                            Processing
                          </span>
                        ) : (
                          <button
                            className="initiate-action-btn"
                            onClick={() => handleInitiateAction(row)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="22" y1="2" x2="11" y2="13"/>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                            Initiate Action
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {tableData.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No merchants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Compliance Action Modal */}
      {showComplianceModal && selectedMerchant && (
        <div className="popup-overlay" onClick={handleCloseModal}>
          <div className="compliance-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-header-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Compliance Action
              </div>
              <button className="popup-close" onClick={handleCloseModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="popup-body">
              <div className="popup-merchant-info">
                <h3 className="popup-merchant-name">{selectedMerchant.merchant_name}</h3>
                <p className="popup-merchant-type">Unregistered Non-Resident Entity</p>
              </div>

              <div className="proposed-actions">
                <h4 className="proposed-actions-title">Proposed Automated Actions:</h4>
                <ul className="proposed-actions-list">
                  <li>Auto-generate Administrative TIN.</li>
                  <li>Calculate VAT Liability: <span className="highlight-blue">{loadingRates ? 'Calculating...' : (liabilityData ? formatCurrency(liabilityData.totalLiability) : '-')}</span></li>
                  <li>Send Notice of Registration & Liability to <span className="highlight-blue">{selectedMerchant.merchant_email}</span>.</li>
                  <li>Include "Pay Now" link in email.</li>
                </ul>
              </div>

              <div className="liability-computation">
                <div className="liability-header">
                  <div className="liability-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                    Liability Computation
                  </div>
                  <span className="rate-badge">Rate: Standard ({loadingRates ? '...' : (liabilityData?.totalRate || '0')}%)</span>
                </div>

                {loadingRates ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#6B7280' }}>
                    Loading rates...
                  </div>
                ) : (
                  <div className="liability-details">
                    <div className="liability-row">
                      <span>Gross Transaction Value</span>
                      <span className="liability-value">{liabilityData ? formatCurrency(liabilityData.grossValue) : '-'}</span>
                    </div>
                    <div className="liability-row sub-row">
                      <span>Levies (NHIL, GETFund, COVID)</span>
                      <span>{liabilityData ? formatCurrency(liabilityData.leviesAmount) : '-'}</span>
                    </div>
                    <div className="liability-row sub-row">
                      <span>VAT ({liabilityData?.vatRate || 15}% on Value + Levies)</span>
                      <span>{liabilityData ? formatCurrency(liabilityData.vatAmount) : '-'}</span>
                    </div>
                    <div className="liability-row total">
                      <span>Total Liability Assessment</span>
                      <span className="total-value">{liabilityData ? formatCurrency(liabilityData.totalLiability) : '-'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="popup-actions">
                <button
                  className="popup-btn cancel"
                  onClick={handleCloseModal}
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  className="popup-btn proceed"
                  onClick={handleProceed}
                  disabled={processingAction || loadingRates}
                >
                  {processingAction ? 'Processing...' : 'Proceed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Completed Modal */}
      {showCompletedModal && actionResult && (
        <div className="popup-overlay" onClick={handleCloseCompleted}>
          <div className="compliance-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="popup-header-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Compliance Action
              </div>
              <button className="popup-close" onClick={handleCloseCompleted}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="popup-body">
              <div className="popup-merchant-info">
                <h3 className="popup-merchant-name">{actionResult?.merchant_name || selectedMerchant?.merchant_name || 'N/A'}</h3>
                <p className="popup-merchant-type">Unregistered Non-Resident Entity</p>
              </div>

              <div className="action-complete">
                <div className="success-icon">
                  <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="35" cy="35" r="32" fill="#10B981"/>
                    <path d="M22 35L31 44L48 27" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="action-complete-title">Action Completed</h3>
              </div>

              <div className="action-details-box">
                <div className="detail-row">
                  <span className="detail-label">Target TIN:</span>
                  <span className="detail-value tin-value">{actionResult?.tin || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email Sent:</span>
                  <span className="detail-value">{actionResult?.merchant_email || selectedMerchant?.merchant_email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Attachment:</span>
                  <a
                    href={`${API_BASE_URL}/admin/monitoring/download-notice/${actionResult?.tin || 'notice'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-value attachment-link"
                    download="Notice_of_Liability.pdf"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Notice_of_Liability.pdf
                  </a>
                </div>
              </div>

              <div className="payment-link-section">
                <h4 className="payment-link-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Generated Payment Link
                </h4>
                <div className="payment-link-box">
                  <input
                    type="text"
                    className="payment-link-input"
                    value={actionResult?.payment_link || ''}
                    readOnly
                  />
                  <button className="copy-btn" onClick={handleCopyLink} title={copied ? 'Copied!' : 'Copy link'}>
                    {copied ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="payment-link-note">This link has been embedded in the email notification.</p>
              </div>

              <button className="popup-btn close-btn" onClick={handleCloseCompleted}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VATEligibility;
