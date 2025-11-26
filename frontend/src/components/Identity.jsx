import { useState, useRef } from 'react';
import './Identity.css';
import StepBar from './StepBar';
import { getUniqueId } from '../utils/sessionManager';
import { API_BASE_URL } from '../utils/api';

const Identity = ({ onNext, onPrevious, currentStep, onRegisterNow, onLoginRedirect }) => {
  const [passportFile, setPassportFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [passportProgress, setPassportProgress] = useState(0);
  const [selfieProgress, setSelfieProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const passportInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file, type);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file, type);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const validateAndSetFile = (file, type) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload JPEG, PNG, PDG, or MP4 files only');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 50MB');
      return;
    }

    if (type === 'passport') {
      setPassportFile(file);
      simulateUpload(setPassportProgress);
    } else {
      setSelfieFile(file);
      simulateUpload(setSelfieProgress);
    }
  };

  const simulateUpload = (setProgress) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const handleRemoveFile = (type) => {
    if (type === 'passport') {
      setPassportFile(null);
      setPassportProgress(0);
    } else {
      setSelfieFile(null);
      setSelfieProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleNext = async () => {
    if (!passportFile || !selfieFile) {
      alert('Please upload both passport and selfie');
      return;
    }

    setLoading(true);

    try {
      const uniqueId = getUniqueId();

      if (!uniqueId) {
        alert('Session expired. Please start registration again.');
        return;
      }

      // Upload passport
      const passportFormData = new FormData();
      passportFormData.append('document', passportFile);
      passportFormData.append('uniqueId', uniqueId);
      passportFormData.append('passport_document', 'true');

      const passportResponse = await fetch(`${API_BASE_URL}/UpdateRegistration`, {
        method: 'POST',
        body: passportFormData
      });

      const passportData = await passportResponse.json();

      if (!passportData.status || passportData.code !== 200) {
        alert(passportData.message || 'Failed to upload passport');
        setLoading(false);
        return;
      }

      // Upload selfie
      const selfieFormData = new FormData();
      selfieFormData.append('document', selfieFile);
      selfieFormData.append('uniqueId', uniqueId);
      selfieFormData.append('selfie_document', 'true');

      const selfieResponse = await fetch(`${API_BASE_URL}/UpdateRegistration`, {
        method: 'POST',
        body: selfieFormData
      });

      const selfieData = await selfieResponse.json();

      if (selfieData.status && selfieData.code === 200) {
        console.log('Documents uploaded successfully');
        onNext();
      } else {
        alert(selfieData.message || 'Failed to upload selfie');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="logo-section" style={{ cursor: 'pointer' }} onClick={onRegisterNow}>
            <div className="logo-circle">
              <img
                src="/assets/logo.png"
                alt="GRA Logo"
                style={{
                  width: '52px',
                  height: '50px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            <div className="logo-text">
              <div className="gra-text">GRA</div>
              <div className="gra-subtext">GHANA REVENUE AUTHORITY</div>
            </div>
          </div>

          <div className="header-right">
            <button className="header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </button>
            <button className="header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              About Us
            </button>
            <div className="help-info">
              <div className="help-label">Need Help?</div>
              <div className="help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        <button className="nav-item active" onClick={onRegisterNow}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Register Now
        </button>
        <button className="nav-item" onClick={onLoginRedirect}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Taxpayer Login
        </button>
        <button className="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          GRA Login
        </button>
        <button className="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Guidelines
        </button>
        <button className="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          FAQ
        </button>
      </nav>

      {/* Main Content */}
      <main className="identity-main">
        <div className="identity-circles">
          <div className="identity-circle identity-circle-1"></div>
          <div className="identity-circle identity-circle-2"></div>
        </div>

        <div className="identity-container">
          <div className="identity-content-box">
            <h1 className="identity-title">Foreign Individual</h1>
            <p className="identity-subtitle">
              Upload your passport and a selfie for automated verification.
            </p>

            {/* Progress Steps */}
            <StepBar currentStep={currentStep} />

            {/* Upload Sections */}
            <div className="identity-uploads">
              {/* Passport Upload */}
              <div className="identity-upload-section">
                <label className="identity-upload-label">Upload Passport <span className="required">*</span></label>
                <div
                  className="identity-upload-area"
                  onDrop={(e) => handleDrop(e, 'passport')}
                  onDragOver={handleDragOver}
                  onClick={() => passportInputRef.current?.click()}
                >
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                    <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1"/>
                    <polyline points="9 15 12 12 15 15"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                  </svg>
                  <p className="identity-upload-text">Choose a file or drag & drop it here</p>
                  <p className="identity-upload-formats">JPEG, PNG, PDG, and MP4 formats, up to 50MB</p>
                </div>
                <input
                  ref={passportInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  onChange={(e) => handleFileSelect(e, 'passport')}
                  style={{ display: 'none' }}
                />

                {passportFile && (
                  <div className="identity-file-preview">
                    <div className="identity-file-info">
                      <div className="identity-file-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                          <rect x="5" y="2" width="14" height="20" rx="2" fill="#2D3B8F"/>
                          <rect x="8" y="6" width="8" height="2" fill="white"/>
                          <rect x="8" y="10" width="8" height="2" fill="white"/>
                          <rect x="8" y="14" width="5" height="2" fill="white"/>
                        </svg>
                      </div>
                      <div className="identity-file-details">
                        <div className="identity-file-name">{passportFile.name}</div>
                        <div className="identity-file-size">
                          {formatFileSize(passportFile.size)} • {passportProgress < 100 ? 'Uploading...' : 'Completed'}
                        </div>
                      </div>
                      <button
                        className="identity-file-remove"
                        onClick={() => handleRemoveFile('passport')}
                      >
                        {passportProgress < 100 ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="identity-progress-bar">
                      <div
                        className="identity-progress-fill"
                        style={{ width: `${passportProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selfie Upload */}
              <div className="identity-upload-section">
                <label className="identity-upload-label">Upload Selfie <span className="required">*</span></label>
                <div
                  className="identity-upload-area"
                  onDrop={(e) => handleDrop(e, 'selfie')}
                  onDragOver={handleDragOver}
                  onClick={() => selfieInputRef.current?.click()}
                >
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                    <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1"/>
                    <polyline points="9 15 12 12 15 15"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                  </svg>
                  <p className="identity-upload-text">Choose a file or drag & drop it here</p>
                  <p className="identity-upload-formats">JPEG, PNG, PDG, and MP4 formats, up to 50MB</p>
                </div>
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  onChange={(e) => handleFileSelect(e, 'selfie')}
                  style={{ display: 'none' }}
                />

                {selfieFile && (
                  <div className="identity-file-preview">
                    <div className="identity-file-info">
                      <div className="identity-file-icon">
                        {selfieFile.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(selfieFile)}
                            alt="Selfie preview"
                            className="identity-file-image"
                          />
                        ) : (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <rect x="5" y="2" width="14" height="20" rx="2" fill="#2D3B8F"/>
                          </svg>
                        )}
                      </div>
                      <div className="identity-file-details">
                        <div className="identity-file-name">{selfieFile.name}</div>
                        <div className="identity-file-size">
                          {formatFileSize(selfieFile.size)} •
                          {selfieProgress < 100 ? ' Uploading...' : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" style={{ display: 'inline', marginLeft: '4px' }}>
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              <span style={{ color: '#10B981', marginLeft: '4px' }}>Completed</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        className="identity-file-remove"
                        onClick={() => handleRemoveFile('selfie')}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                    <div className="identity-progress-bar">
                      <div
                        className="identity-progress-fill"
                        style={{ width: `${selfieProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="identity-actions">
              <button className="identity-btn-previous" onClick={onPrevious}>
                Previous
              </button>
              <button
                className="identity-btn-next"
                onClick={handleNext}
                disabled={loading || !passportFile || !selfieFile}
              >
                {loading ? 'Uploading...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="identity-footer">
        <div className="identity-footer-content">
          <div className="identity-footer-text">Integrity. Fairness. Service</div>
          <div className="identity-footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="identity-assistant-button">
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

export default Identity;
