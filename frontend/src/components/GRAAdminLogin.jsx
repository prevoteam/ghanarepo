import { useState } from 'react';
import './GRAAdminLogin.css';
import GRAAdminOTP from './GRAAdminOTP';
import { ADMIN_API_BASE_URL } from '../utils/api';

const GRAAdminLogin = ({ onBack, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');

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
      setError('Please enter your User ID or Email');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/gra-admin-login`, {
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
        sessionStorage.setItem('gra_session_id', data.results.session_id);
        sessionStorage.setItem('gra_unique_id', data.results.unique_id || '');
        sessionStorage.setItem('gra_user_role', data.results.user_role);
        sessionStorage.setItem('gra_user_table', data.results.user_table);
        setUserRole(data.results.user_role);
        setUserEmail(data.results.email || '');
        setShowOTPModal(true);
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = (data) => {
    setShowOTPModal(false);

    const role = sessionStorage.getItem('gra_user_role');
    const userTable = sessionStorage.getItem('gra_user_table');

    // Pass role info to parent for routing
    onLoginSuccess({
      ...data,
      userRole: role,
      userTable: userTable
    });
  };

  return (
    <div className="">
      {/* Main Content */}
      <main className="gra-login-main bg">
      

        {/* Login Card */}
        <div className="gra-login-card">
          <h1 className="gra-card-title">GRA Admin Portal</h1>
          <p className="gra-card-subtitle">Restricted access for GRA personnel only</p>

          <form onSubmit={handleSubmit} className="gra-form">
            {error && (
              <div className="gra-error-message">{error}</div>
            )}

            <div className="gra-field-group">
              <label className="gra-field-label">User ID / Email</label>
              <input
                type="text"
                name="userId"
                className="gra-field-input"
                placeholder="Enter your User ID or Email"
                value={formData.userId}
                onChange={handleChange}
              />
            </div>

            <div className="gra-field-group">
              <label className="gra-field-label">Password</label>
              <input
                type="password"
                name="password"
                className="gra-field-input"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button type="button" className="gra-forgot-link">Forgot Password?</button>
            </div>

            <button type="submit" className="gra-login-btn" disabled={isLoading}>
              {isLoading ? 'Please wait...' : 'Login'}
            </button>
          </form>
        </div>
      </main>

      {/* OTP Modal */}
      {showOTPModal && (
        <GRAAdminOTP
          email={userEmail}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  );
};

export default GRAAdminLogin;
