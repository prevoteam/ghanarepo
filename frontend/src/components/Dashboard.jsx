import { useState, useEffect } from 'react';
import './Dashboard.css';
import { dashboardApi } from '../utils/api';
import { Header, Footer } from './shared';

const Dashboard = ({ uniqueId, onLogout, userRole = 'resident', onLogoClick, onAboutUsClick, onContactUsClick, onGuidelinesClick, onFAQClick, onPSPClick, onTaxpayerCornerClick }) => {
  const [showVATModal, setShowVATModal] = useState(false);
  const [totalSales, setTotalSales] = useState(50000);
  const [businessName, setBusinessName] = useState('Kwame General Trading');

  // Payment flow states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
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
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    tin: 'TIN008041788',
    vat_id: 'VP008041788',
    compliance_status: 'ON TRACK',
    total_sales: '50,000.00',
    est_vat_liability: '10,950.00'
  });

  // VAT Rates from database (dynamic) - defaults used until API response
  const [vatRates, setVatRates] = useState({
    getfund_levy: { name: 'GETFund Levy', rate: 2.5 },
    nhil: { name: 'NHIL', rate: 2.5 },
    covid_19_health_recovery_levy: { name: 'Covid-19 Levy', rate: 1.0 },
    standard_vat: { name: 'VAT', rate: 15.0 }
  });

  // console.log('VAT Rates:', vatRates);
  const [ratesLoading, setRatesLoading] = useState(true);

  // Fetch VAT rates from database
  useEffect(() => {
    const fetchVATRates = async () => {
      try {
        const response = await dashboardApi.getVATRates();
        console.log('VAT Rates API Response:', response);
        if (response && response.results && response.results.ratesMap) {
          const ratesMap = response.results.ratesMap;
          console.log('Fetched VAT Rates Map:', ratesMap);
          // Map API keys to our expected keys
          setVatRates({
            getfund_levy: ratesMap.getfund_levy || { name: 'GETFund Levy', rate: 2.5 },
            nhil: ratesMap.nhil || { name: 'NHIL', rate: 2.5 },
            covid_19_health_recovery_levy: ratesMap.covid_19_health_recovery_levy || { name: 'Covid-19 Levy', rate: 1.0 },
            standard_vat: ratesMap.standard_vat || { name: 'VAT', rate: 15.0 }
          });
        }
      } catch (err) {
        console.error('Failed to fetch VAT rates:', err);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchVATRates();
  }, []);

  // Calculate VAT components using dynamic rates
  // Note: Using ?? (nullish coalescing) instead of || to handle rate: 0 correctly
  const calculateVAT = (sales) => {
    const getfundRate = (vatRates.getfund_levy?.rate ?? 2.5) / 100;
    const nhilRate = (vatRates.nhil?.rate ?? 2.5) / 100;
    const covidRate = (vatRates.covid_19_health_recovery_levy?.rate ?? 1.0) / 100;
    const vatRate = (vatRates.standard_vat?.rate ?? 15) / 100;

    const getfundLevy = sales * getfundRate;
    const nhil = sales * nhilRate;
    const covidLevy = sales * covidRate;
    const taxableValue = sales + getfundLevy + nhil + covidLevy;
    const vat = taxableValue * vatRate;
    const totalPayable = getfundLevy + nhil + covidLevy + vat;

    return {
      getfundLevy,
      getfundRate: vatRates.getfund_levy?.rate ?? 2.5,
      nhil,
      nhilRate: vatRates.nhil?.rate ?? 2.5,
      covidLevy,
      covidRate: vatRates.covid_19_health_recovery_levy?.rate ?? 1.0,
      taxableValue,
      vat,
      vatRate: vatRates.standard_vat?.rate ?? 15,
      totalPayable
    };
  };

  const vatCalc = calculateVAT(totalSales);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Payment handlers
  const handlePayNow = () => {
    setPaymentAmount(vatCalc.totalPayable);
    setCardDetails({ cardNumber: '', expiry: '', cvc: '', cardholderName: '' });
    setOtp('');
    setPaymentStep(1);
    setReceiptNumber('');
    setShowVATModal(false);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStep(1);
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
    if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.cardholderName) {
      alert('Please fill in all card details');
      return;
    }
    setPaymentProcessing(true);
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
    setTimeout(() => {
      setPaymentProcessing(false);
      const receipt = 'GH-' + Math.floor(10000 + Math.random() * 90000);
      setReceiptNumber(receipt);
      // Close modal and show success banner on dashboard
      setShowPaymentModal(false);
      setShowSuccessBanner(true);
      // Auto-hide banner after 10 seconds
      setTimeout(() => {
        setShowSuccessBanner(false);
      }, 10000);
    }, 2000);
  };

  const handleCancelTransaction = () => {
    setShowPaymentModal(false);
    setPaymentStep(1);
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardApi.getDashboard(uniqueId);
        if (response && response.results) {
          const data = response.results;
          setDashboardData({
            tin: data.user?.tin || 'TIN008041788',
            vat_id: data.user?.vat_id || 'VP008041788',
            compliance_status: data.user?.compliance_status || 'ON TRACK',
            total_sales: data.sales?.total_sales || '50,000.00',
            est_vat_liability: data.sales?.est_vat_liability || '10,950.00'
          });
          if (data.user?.name) {
            setBusinessName(data.user.name);
          }
        }
      } catch (err) {
        console.log('Using default dashboard data');
      }
    };

    if (uniqueId) {
      fetchDashboard();
    }
  }, [uniqueId]);

  const handleSalesChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setTotalSales(value);
  };

  return (
    <div className="merchant-dashboard">
      {/* Shared Header */}
      <Header
        onLogoClick={onLogoClick}
        onAboutUsClick={onAboutUsClick}
        onContactUsClick={onContactUsClick}
        onGuidelinesClick={onGuidelinesClick}
        onFAQClick={onFAQClick}
        onPSPClick={onPSPClick}
        onTaxpayerCornerClick={onTaxpayerCornerClick}
        showPSPNav={true}
      />

      {/* Main Content */}
      <main className="dashboard-content container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-info">
            <h1 className="business-name">{businessName}</h1>
            <div className="credentials">
              <div className="credential-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>TIN : {dashboardData.tin}</span>
              </div>
              <div className="credential-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span>VAT ID : {dashboardData.vat_id}</span>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="compliance-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div className="compliance-text">
                <span className="compliance-label">COMPLIANCE STATUS</span>
                <span className="compliance-value">{dashboardData.compliance_status}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={onLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Payment Success Banner */}
        {showSuccessBanner && (
          <div className="payment-success-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>
              Payment of <strong>GH₵{formatCurrency(paymentAmount)}</strong> processed successfully! Receipt #{receiptNumber}
            </span>
            <button className="banner-close" onClick={() => setShowSuccessBanner(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="grid-left">
            {/* At a Glance Card - Clickable */}
            <div className="glance-card" onClick={() => setShowVATModal(true)}>
              <div className="glance-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <span>At a Glance: Current Period (Nov)</span>
              </div>
              <div className="glance-content">
                <div className="glance-item">
                  <span className="glance-label">Total Sales (PSP Data)</span>
                  <span className="glance-value primary">GH₵{formatCurrency(totalSales)}</span>
                </div>
                <div className="glance-item">
                  <span className="glance-label">Est. VAT Liability</span>
                  <span className="glance-value secondary">GH₵{formatCurrency(vatCalc.totalPayable)}</span>
                </div>
              </div>
              <div className="glance-link">
                Click to view detailed computation & file return →
              </div>
            </div>

            {/* Recent History Card */}
            <div className="history-card">
              <h3 className="card-title">Recent History</h3>
              <div className="history-list">
                <div className="history-item">
                  <span className="history-label">Oct 2023 VAT</span>
                  <span className="history-amount">GHS 4,200.00</span>
                </div>
                <div className="history-item">
                  <span className="history-label">Sep 2023 VAT</span>
                  <span className="history-amount">GHS 3,850.00</span>
                </div>
              </div>
              <button className="view-link">View Statement</button>
            </div>
          </div>

          {/* Right Column - Messages */}
          <div className="grid-right">
            <div className="messages-card">
              <h3 className="card-title">Messages</h3>
              <div className="messages-list">
                <div className="message-item">
                  <div className="message-dot"></div>
                  <div className="message-content">
                    <span className="message-title">Return Deadline Approaching</span>
                    <span className="message-desc">Your Nov return is due in 5 days.</span>
                  </div>
                </div>
                <div className="message-item">
                  <div className="message-dot"></div>
                  <div className="message-content">
                    <span className="message-title">System Maintenance</span>
                    <span className="message-desc">Scheduled for Sunday 2am - 4am.</span>
                  </div>
                </div>
              </div>
              <button className="view-link">View All Messages</button>
            </div>
          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* VAT Computation Modal */}
      {showVATModal && (
        <div className="modal-overlay" onClick={() => setShowVATModal(false)}>
          <div className="vat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vat-modal-header">
              <div className="vat-modal-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                VAT Computation
              </div>
              <button className="modal-close-btn" onClick={() => setShowVATModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="vat-modal-body">
              <div className="sales-input-section">
                <label className="sales-label">Total Sales (GHS) - Editable from PSP Data</label>
                <div className="sales-input-wrapper">
                  <span className="currency-prefix">GHS</span>
                  <input
                    type="number"
                    className="sales-input"
                    value={totalSales}
                    onChange={handleSalesChange}
                  />
                </div>
              </div>

              {ratesLoading && (
                <div className="rates-loading-banner" style={{
                  background: '#FEF3C7',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/>
                  </svg>
                  <span style={{ color: '#92400E', fontSize: '14px' }}>Loading VAT rates from server...</span>
                </div>
              )}

              <table className="vat-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Rate</th>
                    <th>Amount (GHS)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{vatRates.getfund_levy?.name || 'GETFund Levy'}</td>
                    <td>{vatCalc.getfundRate}%</td>
                    <td>GH₵{formatCurrency(vatCalc.getfundLevy)}</td>
                  </tr>
                  <tr>
                    <td>{vatRates.nhil?.name || 'NHIL'}</td>
                    <td>{vatCalc.nhilRate}%</td>
                    <td>GH₵{formatCurrency(vatCalc.nhil)}</td>
                  </tr>
                  <tr>
                    <td>{vatRates.covid_19_health_recovery_levy?.name || 'Covid-19 Levy'}</td>
                    <td>{vatCalc.covidRate}%</td>
                    <td>GH₵{formatCurrency(vatCalc.covidLevy)}</td>
                  </tr>
                  <tr>
                    <td>Taxable Value for VAT</td>
                    <td>-</td>
                    <td>GH₵{formatCurrency(vatCalc.taxableValue)}</td>
                  </tr>
                  <tr className="vat-row">
                    <td>{vatRates.standard_vat?.name || 'VAT'}</td>
                    <td>{vatCalc.vatRate}%</td>
                    <td><strong>GH₵{formatCurrency(vatCalc.vat)}</strong></td>
                  </tr>
                  <tr className="total-row">
                    <td><strong>Total Payable</strong></td>
                    <td></td>
                    <td className="total-amount">GH₵{formatCurrency(vatCalc.totalPayable)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="vat-modal-actions">
                <button className="btn-cancel" onClick={() => setShowVATModal(false)}>
                  Cancel
                </button>
                <button className="btn-pay-now" onClick={handlePayNow}>
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secure Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={handleClosePaymentModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            {/* Payment Modal Header */}
            <div className="payment-header">
              <div className="payment-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>SECURE PAYMENT</span>
              </div>
              <button className="payment-close" onClick={handleClosePaymentModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Step 1: Card Details */}
            {paymentStep === 1 && (
              <div className="payment-body">
                <div className="payment-amount">
                  <span className="amount-label">TOTAL AMOUNT</span>
                  <span className="amount-value">GH₵{formatCurrency(paymentAmount)}</span>
                </div>

                <div className="payment-form">
                  <div className="form-group">
                    <label>CARD NUMBER</label>
                    <div className="input-with-icon">
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

                  <div className="form-row">
                    <div className="form-group form-half">
                      <label>EXPIRY</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                        maxLength="5"
                      />
                    </div>
                    <div className="form-group form-half">
                      <label>CVC</label>
                      <div className="input-with-icon">
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

                  <div className="form-group">
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
                  className="btn-pay-secure"
                  onClick={handlePaySecurely}
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? 'Processing...' : 'Pay Securely'}
                </button>

                <div className="payment-methods">
                  <div className="payment-method-icon"></div>
                  <div className="payment-method-icon"></div>
                  <div className="payment-method-icon"></div>
                </div>
              </div>
            )}

            {/* Step 2: OTP Authentication */}
            {paymentStep === 2 && (
              <div className="payment-body">
                <div className="payment-amount">
                  <span className="amount-label">TOTAL AMOUNT</span>
                  <span className="amount-value">GH₵{formatCurrency(paymentAmount)}</span>
                </div>

                <div className="otp-section">
                  <div className="otp-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                  </div>
                  <h3 className="otp-title">Authentication Required</h3>
                  <p className="otp-subtitle">
                    Please enter the OTP sent to your mobile number ending in ****89
                  </p>

                  <input
                    type="tel"
                    className="otp-input"
                    placeholder="Enter OTP Code"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                    }}
                    maxLength={6}
                    autoComplete="one-time-code"
                  />

                  <button
                    className="btn-confirm-payment"
                    onClick={handleConfirmPayment}
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? 'Verifying...' : 'Confirm Payment'}
                  </button>

                  <button className="btn-cancel-transaction" onClick={handleCancelTransaction}>
                    Cancel Transaction
                  </button>
                </div>

                <div className="payment-methods">
                  <div className="payment-method-icon"></div>
                  <div className="payment-method-icon"></div>
                  <div className="payment-method-icon"></div>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {paymentStep === 3 && (
              <div className="payment-success">
                <div className="success-banner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>
                    Payment of <strong>GH₵{formatCurrency(paymentAmount)}</strong> processed successfully! Receipt #{receiptNumber}
                  </span>
                  <button className="success-close" onClick={handleClosePaymentModal}>
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

export default Dashboard;
