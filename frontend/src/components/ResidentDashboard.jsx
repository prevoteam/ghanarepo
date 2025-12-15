import { useState, useEffect } from 'react';
import './ResidentDashboard.css';
import { Header, Footer } from './shared';
import { ADMIN_API_BASE_URL } from '../utils/api';

const ResidentDashboard = ({ uniqueId, onLogout }) => {
  const [showVatModal, setShowVatModal] = useState(false);
  const [editableSales, setEditableSales] = useState(50000);
  const [vatRates, setVatRates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Payment flow states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Card, 2: OTP, 3: Success
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardholderName: ''
  });
  const [otp, setOtp] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [dashboardData] = useState({
    companyName: 'Kwame General Trading',
    tin: 'TIN008041788',
    vatId: 'VP008041788',
    complianceStatus: 'ON TRACK',
    currentPeriod: 'Nov',
    totalSales: 50000.00,
    messages: [
      {
        type: 'warning',
        title: 'Return Deadline Approaching',
        description: 'Your Nov return is due in 5 days.'
      },
      {
        type: 'info',
        title: 'System Maintenance',
        description: 'Scheduled for Sunday 2am - 4am.'
      }
    ],
    recentHistory: [
      { period: 'Oct 2023 VAT', amount: 4200.00 },
      { period: 'Sep 2023 VAT', amount: 3850.00 }
    ]
  });

  // Fetch VAT rates from API when modal opens
  const fetchVatRates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/vat-rates`);
      const data = await response.json();
      if (data.status && data.results?.rates) {
        // Sort by calculation_order if available
        const sortedRates = data.results.rates.sort((a, b) =>
          (a.calculation_order || a.id) - (b.calculation_order || b.id)
        );
        setVatRates(sortedRates);
      }
    } catch (err) {
      console.error('Error fetching VAT rates:', err);
      // Fallback to default rates
      setVatRates([
        { id: 1, levy_type: 'GETFund Levy', rate: 2.5, calculation_order: 1 },
        { id: 2, levy_type: 'NHIL', rate: 2.5, calculation_order: 2 },
        { id: 3, levy_type: 'Covid-19 Levy', rate: 1.0, calculation_order: 3 },
        { id: 4, levy_type: 'VAT', rate: 15.0, calculation_order: 4 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate VAT components dynamically based on vatRates from API
  const calculateVatComponents = () => {
    const sales = parseFloat(editableSales) || 0;

    // Separate levies (applied to sales) and VAT (applied to taxable value)
    const levies = vatRates.filter(r =>
      !r.levy_type?.toLowerCase().includes('vat') &&
      !r.levy_type?.toLowerCase().includes('standard')
    );
    const vatRateItem = vatRates.find(r =>
      r.levy_type?.toLowerCase() === 'vat' ||
      r.levy_type?.toLowerCase().includes('standard') ||
      r.levy_type?.toLowerCase() === 'vat flat rate'
    );

    // Calculate levy amounts
    const levyCalculations = levies.map(levy => ({
      ...levy,
      amount: sales * (parseFloat(levy.rate) / 100)
    }));

    // Sum of all levy amounts
    const totalLevies = levyCalculations.reduce((sum, l) => sum + l.amount, 0);

    // Taxable value = Sales + Total Levies
    const taxableValue = sales + totalLevies;

    // VAT calculation
    const vatRate = parseFloat(vatRateItem?.rate) || 15.0;
    const vatAmount = taxableValue * (vatRate / 100);

    // Total Payable = All Levies + VAT
    const totalPayable = totalLevies + vatAmount;

    return {
      levyCalculations,
      taxableValue,
      vat: {
        levy_type: vatRateItem?.levy_type || 'VAT',
        rate: vatRate,
        amount: vatAmount
      },
      totalPayable
    };
  };

  const vatCalc = calculateVatComponents();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleOpenVatModal = () => {
    setEditableSales(dashboardData.totalSales);
    fetchVatRates(); // Fetch latest rates from API
    setShowVatModal(true);
  };

  const handleCloseVatModal = () => {
    setShowVatModal(false);
  };

  const handleSalesChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setEditableSales(value);
  };

  const handlePayNow = () => {
    console.log('Pay Now clicked, amount:', vatCalc.totalPayable);
    // Save the payment amount
    const amount = vatCalc.totalPayable;
    setPaymentAmount(amount);
    // Reset payment form
    setCardDetails({ cardNumber: '', expiry: '', cvc: '', cardholderName: '' });
    setOtp('');
    setPaymentStep(1);
    setReceiptNumber('');
    // Close VAT modal and open payment modal
    setShowVatModal(false);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStep(1);
    setCardDetails({ cardNumber: '', expiry: '', cvc: '', cardholderName: '' });
    setOtp('');
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value.replace('/', ''));
    } else if (field === 'cvc') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 3);
    }
    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handlePaySecurely = () => {
    // Validate card details
    if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.cardholderName) {
      alert('Please fill in all card details');
      return;
    }
    setPaymentProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentStep(2);
    }, 1500);
  };

  const handleConfirmPayment = () => {
    if (!otp || otp.length < 4) {
      alert('Please enter a valid OTP');
      return;
    }
    setPaymentProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      const receipt = 'GH-' + Math.floor(10000 + Math.random() * 90000);
      setReceiptNumber(receipt);
      setPaymentStep(3);
    }, 2000);
  };

  const handleCancelTransaction = () => {
    setShowPaymentModal(false);
    setPaymentStep(1);
  };

  return (
    <div className="rd-container">
      <Header
        activeNav=""
        showPSPNav={true}
        onLogout={onLogout}
      />

      <main className="rd-main">
        <div className="rd-content">
          {/* Company Banner */}
          <div className="rd-banner">
            <div className="rd-banner-info">
              <h1 className="rd-company-name">{dashboardData.companyName}</h1>
              <div className="rd-company-ids">
                <span className="rd-id-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  TIN : {dashboardData.tin}
                </span>
                <span className="rd-id-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M6 8h.01M10 8h.01M14 8h.01"/>
                  </svg>
                  VAT ID : {dashboardData.vatId}
                </span>
              </div>
            </div>
            <div className="rd-banner-right">
              <div className="rd-compliance-badge">
                <div className="rd-compliance-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="rd-compliance-text">
                  <span className="rd-compliance-label">COMPLIANCE STATUS</span>
                  <span className="rd-compliance-value">{dashboardData.complianceStatus}</span>
                </div>
              </div>
              <button className="rd-logout-btn" onClick={onLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
            {/* Decorative circles */}
            <div className="rd-banner-circle rd-circle-1"></div>
            <div className="rd-banner-circle rd-circle-2"></div>
          </div>

          {/* Main Content Grid */}
          <div className="rd-grid">
            {/* At a Glance Card */}
            <div className="rd-card rd-glance-card" onClick={handleOpenVatModal} style={{ cursor: 'pointer' }}>
              <div className="rd-card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <h3>At a Glance: Current Period ({dashboardData.currentPeriod})</h3>
              </div>
              <div className="rd-glance-content">
                <div className="rd-glance-item">
                  <span className="rd-glance-label">Total Sales (PSP Data)</span>
                  <span className="rd-glance-value rd-value-blue">GH₵{formatCurrency(dashboardData.totalSales)}</span>
                </div>
                <div className="rd-glance-item">
                  <span className="rd-glance-label">Est. VAT Liability</span>
                  <span className="rd-glance-value rd-value-orange">GH₵{formatCurrency(vatCalc.totalPayable)}</span>
                </div>
              </div>
              <span className="rd-glance-link">
                Click to view detailed computation & file return
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </div>

            {/* Messages Card */}
            <div className="rd-card rd-messages-card">
              <h3 className="rd-card-title">Messages</h3>
              <div className="rd-messages-list">
                {dashboardData.messages.map((message, index) => (
                  <div key={index} className="rd-message-item">
                    <span className={`rd-message-dot ${message.type}`}></span>
                    <div className="rd-message-content">
                      <span className="rd-message-title">{message.title}</span>
                      <span className="rd-message-desc">{message.description}</span>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#" className="rd-view-all-link">View All Messages</a>
            </div>

            {/* Recent History Card */}
            <div className="rd-card rd-history-card">
              <h3 className="rd-card-title">Recent History</h3>
              <div className="rd-history-list">
                {dashboardData.recentHistory.map((item, index) => (
                  <div key={index} className="rd-history-item">
                    <span className="rd-history-period">{item.period}</span>
                    <span className="rd-history-amount">GHS {formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
              <a href="#" className="rd-view-statement-link">View Statement</a>
            </div>
          </div>
        </div>

        {/* Decorative bottom circles */}
        <div className="rd-decoration">
          <div className="rd-deco-circle rd-deco-1"></div>
          <div className="rd-deco-circle rd-deco-2"></div>
        </div>
      </main>

      <Footer />

      {/* VAT Computation Modal */}
      {showVatModal && (
        <div className="rd-modal-overlay" onClick={handleCloseVatModal}>
          <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rd-modal-header">
              <div className="rd-modal-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <line x1="8" y1="6" x2="16" y2="6"/>
                  <line x1="8" y1="10" x2="16" y2="10"/>
                  <line x1="8" y1="14" x2="12" y2="14"/>
                </svg>
                <span>VAT Computation</span>
              </div>
              <button className="rd-modal-close" onClick={handleCloseVatModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="rd-modal-body">
              <div className="rd-sales-input-section">
                <label className="rd-sales-label">
                  Total Sales (GHS) - <span>Editable from PSP Data</span>
                </label>
                <div className="rd-sales-input-wrapper">
                  <span className="rd-currency-prefix">GHS</span>
                  <input
                    type="text"
                    className="rd-sales-input"
                    value={editableSales}
                    onChange={handleSalesChange}
                  />
                </div>
              </div>

              <div className="rd-vat-table">
                <div className="rd-vat-table-header">
                  <span>Description</span>
                  <span>Rate</span>
                  <span>Amount (GHS)</span>
                </div>

                {isLoading ? (
                  <div className="rd-vat-loading">Loading rates...</div>
                ) : (
                  <>
                    {/* Dynamically render levy rows from API */}
                    {vatCalc.levyCalculations.map((levy) => (
                      <div key={levy.id} className="rd-vat-table-row">
                        <span>{levy.levy_type}</span>
                        <span>{parseFloat(levy.rate).toFixed(1)}%</span>
                        <span>GH₵{formatCurrency(levy.amount)}</span>
                      </div>
                    ))}

                    {/* Taxable Value Row */}
                    <div className="rd-vat-table-row rd-taxable-row">
                      <span>Taxable Value for VAT</span>
                      <span>-</span>
                      <span>GH₵{formatCurrency(vatCalc.taxableValue)}</span>
                    </div>

                    {/* VAT Row */}
                    <div className="rd-vat-table-row">
                      <span>{vatCalc.vat.levy_type}</span>
                      <span>{parseFloat(vatCalc.vat.rate).toFixed(1)}%</span>
                      <span className="rd-vat-amount">GH₵{formatCurrency(vatCalc.vat.amount)}</span>
                    </div>

                    {/* Total Payable */}
                    <div className="rd-vat-table-total">
                      <span>Total Payable</span>
                      <span></span>
                      <span className="rd-total-amount">GH₵{formatCurrency(vatCalc.totalPayable)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rd-modal-footer">
              <button className="rd-btn-cancel" onClick={handleCloseVatModal}>
                Cancel
              </button>
              <button className="rd-btn-pay" onClick={handlePayNow}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure Payment Modal */}
      {showPaymentModal && (
        <div className="rd-modal-overlay" onClick={handleClosePaymentModal}>
          <div className="rd-payment-modal" onClick={(e) => e.stopPropagation()}>
            {/* Payment Modal Header */}
            <div className="rd-payment-header">
              <div className="rd-payment-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>SECURE PAYMENT</span>
              </div>
              <button className="rd-payment-close" onClick={handleClosePaymentModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Step 1: Card Details */}
            {paymentStep === 1 && (
              <div className="rd-payment-body">
                <div className="rd-payment-amount">
                  <span className="rd-amount-label">TOTAL AMOUNT</span>
                  <span className="rd-amount-value">GH₵{formatCurrency(paymentAmount)}</span>
                </div>

                <div className="rd-payment-form">
                  <div className="rd-form-group">
                    <label>CARD NUMBER</label>
                    <div className="rd-input-with-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardDetails.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                        maxLength="19"
                      />
                    </div>
                  </div>

                  <div className="rd-form-row">
                    <div className="rd-form-group rd-form-half">
                      <label>EXPIRY</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                        maxLength="5"
                      />
                    </div>
                    <div className="rd-form-group rd-form-half">
                      <label>CVC</label>
                      <div className="rd-input-with-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={(e) => handleCardInputChange('cvc', e.target.value)}
                          maxLength="3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rd-form-group">
                    <label>CARDHOLDER NAME</label>
                    <input
                      type="text"
                      placeholder="Name on Card"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                    />
                  </div>
                </div>

                <button
                  className="rd-btn-pay-secure"
                  onClick={handlePaySecurely}
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? 'Processing...' : 'Pay Securely'}
                </button>

                <div className="rd-payment-methods">
                  <div className="rd-payment-method-icon"></div>
                  <div className="rd-payment-method-icon"></div>
                  <div className="rd-payment-method-icon"></div>
                </div>
              </div>
            )}

            {/* Step 2: OTP Authentication */}
            {paymentStep === 2 && (
              <div className="rd-payment-body">
                <div className="rd-payment-amount">
                  <span className="rd-amount-label">TOTAL AMOUNT</span>
                  <span className="rd-amount-value">GH₵{formatCurrency(paymentAmount)}</span>
                </div>

                <div className="rd-otp-section">
                  <div className="rd-otp-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                  </div>
                  <h3 className="rd-otp-title">Authentication Required</h3>
                  <p className="rd-otp-subtitle">
                    Please enter the OTP sent to your mobile number ending in ****89
                  </p>

                  <input
                    type="text"
                    className="rd-otp-input"
                    placeholder="Enter OTP Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                    maxLength="6"
                  />

                  <button
                    className="rd-btn-confirm-payment"
                    onClick={handleConfirmPayment}
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? 'Verifying...' : 'Confirm Payment'}
                  </button>

                  <button className="rd-btn-cancel-transaction" onClick={handleCancelTransaction}>
                    Cancel Transaction
                  </button>
                </div>

                <div className="rd-payment-methods">
                  <div className="rd-payment-method-icon"></div>
                  <div className="rd-payment-method-icon"></div>
                  <div className="rd-payment-method-icon"></div>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {paymentStep === 3 && (
              <div className="rd-payment-success">
                <div className="rd-success-banner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>
                    Payment of <strong>GH₵{formatCurrency(paymentAmount)}</strong> processed successfully! Receipt #{receiptNumber}
                  </span>
                  <button className="rd-success-close" onClick={handleClosePaymentModal}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
