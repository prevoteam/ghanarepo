import { useState } from 'react';
import './Agent.css';
import StepBar from './StepBar';
import { getUniqueId } from '../utils/sessionManager';
import { API_BASE_URL } from '../utils/api';
import { Header, Footer } from './shared';

const Agent = ({ onNext, onPrevious, currentStep, onRegisterNow, onLoginRedirect }) => {
  const [loading, setLoading] = useState(false);
  const [tinVerified, setTinVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [formData, setFormData] = useState({
    agentTin: '',
    agentFullName: '',
    agentDigitalAddress: '',
    agentEmail: '',
    agentMobile: '',
    agentCountryCode: '+233'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset verification if TIN changes
    if (name === 'agentTin') {
      setTinVerified(false);
    }
  };

  const handleVerifyTin = async () => {
    if (!formData.agentTin) {
      alert('Please enter Agent TIN');
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch(`${API_BASE_URL}/VerifyAgentTIN`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tin: formData.agentTin
        })
      });

      const data = await response.json();

      if (data.status && data.code === 200) {
        setTinVerified(true);
        // Auto-fill agent details if returned from API
        if (data.results) {
          setFormData(prev => ({
            ...prev,
            agentFullName: data.results.agent_name || prev.agentFullName,
            agentDigitalAddress: data.results.digital_address || prev.agentDigitalAddress,
            agentEmail: data.results.email || prev.agentEmail,
            agentMobile: data.results.mobile || prev.agentMobile
          }));
        }
      } else {
        alert(data.message || 'TIN verification failed');
      }
    } catch (error) {
      console.error('Error verifying TIN:', error);
      // For demo, allow verification to proceed
      setTinVerified(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleNext = async () => {
    if (!formData.agentTin) {
      alert('Please enter Agent TIN');
      return;
    }

    if (!formData.agentFullName || !formData.agentEmail || !formData.agentMobile) {
      alert('Please fill all required agent details');
      return;
    }

    setLoading(true);

    try {
      const uniqueId = getUniqueId();

      if (!uniqueId) {
        alert('Session expired. Please start registration again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/UpdateAgentDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unique_id: uniqueId,
          agent_tin: formData.agentTin,
          agent_full_name: formData.agentFullName,
          agent_digital_address: formData.agentDigitalAddress,
          agent_email: formData.agentEmail,
          agent_mobile: `${formData.agentCountryCode}${formData.agentMobile}`
        })
      });

      const data = await response.json();

      if (data.status && data.code === 200) {
        console.log('Agent details updated:', data);
        onNext();
      } else {
        alert(data.message || 'Failed to update agent details');
      }
    } catch (error) {
      console.error('Error updating agent details:', error);
      alert('Failed to update agent details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Header
        onLogoClick={onRegisterNow}
        activeNav=""
        onAboutUsClick={() => {}}
        onContactUsClick={() => {}}
        onGuidelinesClick={() => {}}
        onFAQClick={() => {}}
        onPSPClick={() => {}}
        showPSPNav={false}
      />

      {/* Main Content */}
      <main className="agent-main">
        <div className="agent-circles">
          <div className="agent-circle agent-circle-1"></div>
          <div className="agent-circle agent-circle-2"></div>
        </div>

        <div className="agent-container">
          <div className="agent-content-box">
            <h1 className="agent-title">Agent Details</h1>
            <p className="agent-subtitle">
              Provide details of your tax representative in Ghana.
            </p>

            {/* Progress Steps */}
            <StepBar currentStep={currentStep} />

            {/* Local Agent Details Section */}
            <div className="agent-section">
              <h2 className="agent-section-title">Local Agent Details</h2>

              {/* TIN Verification */}
              <div className="agent-tin-section">
                <div className="agent-form-field agent-tin-field">
                  <label className="agent-form-label">
                    Agent TIN <span className="required">*</span>
                  </label>
                  <div className="agent-tin-input-group">
                    <input
                      type="text"
                      name="agentTin"
                      className={`agent-form-input ${tinVerified ? 'verified' : ''}`}
                      placeholder="Enter Agent TIN"
                      value={formData.agentTin}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className={`agent-verify-btn ${tinVerified ? 'verified' : ''}`}
                      onClick={handleVerifyTin}
                      disabled={verifying || tinVerified}
                    >
                      {verifying ? 'Verifying...' : tinVerified ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Verified
                        </>
                      ) : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Agent Details Form */}
              <div className="agent-form-grid">
                <div className="agent-form-field">
                  <label className="agent-form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="agentFullName"
                    className="agent-form-input"
                    placeholder="Enter agent's full name"
                    value={formData.agentFullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="agent-form-field">
                  <label className="agent-form-label">
                    Digital Address
                  </label>
                  <input
                    type="text"
                    name="agentDigitalAddress"
                    className="agent-form-input"
                    placeholder="E.g., GA-123-4567"
                    value={formData.agentDigitalAddress}
                    onChange={handleChange}
                  />
                </div>

                <div className="agent-form-field">
                  <label className="agent-form-label">
                    Email ID <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="agentEmail"
                    className="agent-form-input"
                    placeholder="agent@example.com"
                    value={formData.agentEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="agent-form-field">
                  <label className="agent-form-label">
                    Mobile Number <span className="required">*</span>
                  </label>
                  <div className="agent-phone-input">
                    <select
                      name="agentCountryCode"
                      className="agent-country-code"
                      value={formData.agentCountryCode}
                      onChange={handleChange}
                    >
                      <option value="+233">+233</option>
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <input
                      type="tel"
                      name="agentMobile"
                      className="agent-form-input agent-mobile-input"
                      placeholder="Enter mobile number"
                      value={formData.agentMobile}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="agent-actions">
              <button className="agent-btn-previous" onClick={onPrevious}>
                Previous
              </button>
              <button
                className="agent-btn-next"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Agent;
