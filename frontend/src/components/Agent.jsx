import { useState } from 'react';
import './Agent.css';
import { getUniqueId } from '../utils/sessionManager';
import { API_BASE_URL } from '../utils/api';
import { Header, Footer } from './shared';

const Agent = ({ onNext, onPrevious, currentStep, onRegisterNow, onLoginRedirect }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    ghanaCardNumber: '',
    agentFullName: '',
    agentEmail: '',
    agentGhanaId: '',
    agentMobile: '',
    agentCountryCode: '+91'
  });

  const steps = [
    { number: 1, label: 'Verification', completed: true },
    { number: 2, label: 'Entity Type', completed: true },
    { number: 3, label: 'Identity', completed: true },
    { number: 4, label: 'Agent', active: true },
    { number: 5, label: 'Market' },
    { number: 6, label: 'Payment' },
    { number: 7, label: 'Eligibility' },
    { number: 8, label: 'Completed' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.dateOfBirth || !formData.ghanaCardNumber) {
      alert('Please fill all Personal Details fields');
      return;
    }

    if (!formData.agentFullName || !formData.agentEmail || !formData.agentGhanaId || !formData.agentMobile) {
      alert('Please fill all Local Agent Details fields');
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
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth,
          ghana_card_number: formData.ghanaCardNumber,
          agent_full_name: formData.agentFullName,
          agent_email: formData.agentEmail,
          agent_ghana_id: formData.agentGhanaId,
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
        activeNav="register"
        onRegisterClick={onRegisterNow}
        onLoginClick={onLoginRedirect}
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
            <div className="agent-progress-container">
              <div className="agent-progress-steps">
                {steps.map((step, index) => (
                  <div key={step.number} className="agent-progress-step-wrapper">
                    <div className="agent-progress-step-info">
                      <div className="agent-progress-step-label">Step {step.number} of 8</div>
                      <div
                        className={`agent-progress-circle ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
                      >
                        {step.completed ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <span>{step.number}</span>
                        )}
                      </div>
                      <div className="agent-progress-step-name">{step.label}</div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`agent-progress-line ${step.completed ? 'completed' : ''}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="agent-section">
              <h2 className="agent-section-title">Personal Details</h2>
              <div className="agent-form-grid">
                <div className="agent-form-field">
                  <label className="agent-form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="agent-form-input"
                    placeholder="Pankaj Dhote"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="agent-form-field">
                  <label className="agent-form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="agent-form-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="agent-form-field">
                  <label className="agent-form-label">Ghana Card Number</label>
                  <input
                    type="text"
                    name="ghanaCardNumber"
                    className="agent-form-input"
                    placeholder="985284523578"
                    value={formData.ghanaCardNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Add Local Agent Details Section */}
            <div className="agent-section">
              <h2 className="agent-section-title">Add Local Agent Details</h2>
              <div className="agent-form-grid">
                <div className="agent-form-field">
                  <label className="agent-form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="agentFullName"
                    className="agent-form-input"
                    placeholder="Pankaj Dhote"
                    value={formData.agentFullName}
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
                    placeholder="Megha@proteantech.in"
                    value={formData.agentEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="agent-form-field">
                  <label className="agent-form-label">
                    Ghana ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="agentGhanaId"
                    className="agent-form-input"
                    placeholder="985284523578"
                    value={formData.agentGhanaId}
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
                      <option value="+91">+91</option>
                      <option value="+233">+233</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <input
                      type="tel"
                      name="agentMobile"
                      className="agent-form-input agent-mobile-input"
                      placeholder="9876543213"
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
