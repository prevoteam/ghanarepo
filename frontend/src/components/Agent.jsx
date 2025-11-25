import { useState } from 'react';
import './Agent.css';
import { getUniqueId } from '../utils/sessionManager';

const Agent = ({ onNext, onPrevious, currentStep }) => {
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

      const response = await fetch('http://localhost:3000/v1/home/UpdateAgentDetails', {
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
    <div className="agent-page">
      {/* Header */}
      <header className="agent-header">
        <div className="agent-header-content">
          <div className="agent-logo-section">
            <div className="agent-logo-circle">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="#F59E0B" />
                <text x="25" y="32" fontSize="20" fontWeight="bold" fill="#2D3B8F" textAnchor="middle">G</text>
              </svg>
            </div>
            <div className="agent-logo-text">
              <div className="agent-gra-text">GRA</div>
              <div className="agent-gra-subtext">GHANA REVENUE AUTHORITY</div>
            </div>
          </div>

          <div className="agent-header-right">
            <button className="agent-header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </button>
            <button className="agent-header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              About Us
            </button>
            <div className="agent-help-info">
              <div className="agent-help-label">Need Help?</div>
              <div className="agent-help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="agent-navigation">
        <button className="agent-nav-item active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Register Now
        </button>
        <button className="agent-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Taxpayer Login
        </button>
        <button className="agent-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          GRA Login
        </button>
        <button className="agent-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Guidelines
        </button>
        <button className="agent-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          FAQ
        </button>
      </nav>

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

      {/* Footer */}
      <footer className="agent-footer">
        <div className="agent-footer-content">
          <div className="agent-footer-text">Integrity. Fairness. Service</div>
          <div className="agent-footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="agent-assistant-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Ask GRA Assistant
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Agent;
