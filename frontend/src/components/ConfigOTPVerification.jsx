import { useState, useRef, useEffect } from 'react';
import './ConfigOTPVerification.css';

const ConfigOTPVerification = ({ contactInfo, onClose, onVerified, userRole }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(116); // 01:56 in seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}sec`;
  };

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleResendOTP = () => {
    setTimer(116);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleValidate = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert('Please enter complete OTP');
      return;
    }

    setIsVerifying(true);
    // Simulate API verification
    setTimeout(() => {
      setIsVerifying(false);
      onVerified(userRole);
    }, 1000);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="config-otp-overlay" onClick={handleOverlayClick}>
      <div className="config-otp-modal">
        <button className="config-otp-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2 className="config-otp-title">OTP Verification</h2>
        <p className="config-otp-subtitle">
          OTP Sent on <span className="config-otp-contact">{contactInfo}</span>
        </p>

        <div className="config-otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="config-otp-input"
            />
          ))}
        </div>

        <div className="config-otp-timer-row">
          <span className="config-otp-timer">{formatTime(timer)}</span>
          <button
            className="config-otp-resend"
            onClick={handleResendOTP}
            disabled={timer > 0}
          >
            Resend OTP
          </button>
        </div>

        <button
          className="config-otp-validate-btn"
          onClick={handleValidate}
          disabled={isVerifying || otp.some((d) => !d)}
        >
          {isVerifying ? 'Validating...' : 'Validate'}
        </button>
      </div>
    </div>
  );
};

export default ConfigOTPVerification;
