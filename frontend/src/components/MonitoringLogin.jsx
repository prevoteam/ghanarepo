import { useState } from 'react';
import './MonitoringLogin.css';
import MonitoringOTP from './MonitoringOTP';

const MonitoringLogin = ({ onBack, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId) {
      setError('Please enter your user ID');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/v1/admin/monitoring/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: formData.userId,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.status && data.code === 200) {
        sessionStorage.setItem('monitoring_session_id', data.results.session_id);
        sessionStorage.setItem('monitoring_email', data.results.email);
        setShowOTPModal(true);
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      // For demo purposes, show OTP modal
      sessionStorage.setItem('monitoring_userId', 'user123');
      setShowOTPModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = (data) => {
    setShowOTPModal(false);
    onLoginSuccess(data);
  };

  return (
    <div className="mon-login-content">
      {/* Main Content */}
      <main className="mon-main">
        {/* Background Circles */}
        <div className="mon-bg-circles">
          <div className="mon-bg-circle mon-bg-circle-1"></div>
          <div className="mon-bg-circle mon-bg-circle-2"></div>
          <div className="mon-bg-circle mon-bg-circle-3"></div>
          <div className="mon-bg-circle mon-bg-circle-4"></div>
        </div>

        {/* Login Card */}
        <div className="mon-login-card">
          <h1 className="mon-card-title">Monitoring Login</h1>
          <p className="mon-card-subtitle">Your detail will be verified by a secure OTP</p>

          <form onSubmit={handleSubmit} className="mon-form">
            {error && (
              <div className="mon-error-message">{error}</div>
            )}

            <div className="mon-field-group">
              <label className="mon-field-label">User ID</label>
              <input
                type="text"
                name="userId"
                className="mon-field-input"
                placeholder="Enter your User ID"
                value={formData.userId}
                onChange={handleChange}
              />
            </div>

            <div className="mon-field-group">
              <label className="mon-field-label">Password</label>
              <input
                type="password"
                name="password"
                className="mon-field-input"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button type="button" className="mon-forgot-link">Forgot Password?</button>
            </div>

            <button type="submit" className="mon-login-btn" disabled={isLoading}>
              {isLoading ? 'Please wait...' : 'Login via OTP'}
            </button>
          </form>
        </div>
      </main>

      {/* OTP Modal */}
      {showOTPModal && (
        <MonitoringOTP
          email={sessionStorage.getItem('monitoring_email') || 'user@example.com'}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  );
};

export default MonitoringLogin;
