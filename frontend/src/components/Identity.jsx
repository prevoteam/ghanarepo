import { useState, useRef } from 'react';
import './Identity.css';
import StepBar from './StepBar';
import { getUniqueId } from '../utils/sessionManager';
import { API_BASE_URL } from '../utils/api';
import { Header, Footer } from './shared';

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
      <Header
        onLogoClick={onRegisterNow}
        activeNav="register"
        onRegisterClick={onRegisterNow}
        onLoginClick={onLoginRedirect}
        showPSPNav={false}
      />

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

      <Footer />
    </div>
  );
};

export default Identity;
