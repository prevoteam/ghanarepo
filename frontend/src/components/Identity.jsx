import { useState, useRef } from 'react';
import './Identity.css';
import StepBar from './StepBar';
import { getUniqueId, setPassportData } from '../utils/sessionManager';
import { API_BASE_URL } from '../utils/api';

const Identity = ({ onNext, onPrevious, currentStep, onRegisterNow, onLoginRedirect }) => {
  const [passportFile, setPassportFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [passportProgress, setPassportProgress] = useState(0);
  const [selfieProgress, setSelfieProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

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

  const validateAndSetFile = async (file, type) => {
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
      // Call OCR API to extract passport data
      await extractPassportData(file);
    } else {
      setSelfieFile(file);
      simulateUpload(setSelfieProgress);
    }
  };

  // Extract passport data using OCR API
  const extractPassportData = async (file) => {
    setAnalyzing(true);
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://gra-demo.proteantech.in/ocr/extract', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success && result.data) {
        const passportInfo = {
          country: result.data.country || 'N/A',
          passportNumber: result.data.passport_number || 'N/A',
          fullName: result.data.full_name || 'N/A',
          dateOfBirth: result.data.date_of_birth || 'N/A',
          sex: result.data.sex || 'N/A'
        };
        setExtractedData(passportInfo);
        // Store passport data in localStorage for later steps
        setPassportData(passportInfo);
        setIsVerified(true);
      } else {
        console.error('OCR extraction failed:', result.message);
        setExtractedData(null);
      }
    } catch (error) {
      console.error('Error extracting passport data:', error);
      setExtractedData(null);
    } finally {
      setAnalyzing(false);
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
      setExtractedData(null);
      setIsVerified(false);
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
    <div className="registration-form-content">
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

            {/* Upload Sections - Compact Preview Boxes */}
            <div className="identity-uploads">
              {/* Selfie Upload */}
              <div className="identity-upload-section">
                {!selfieFile ? (
                  <>
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
                      <p className="identity-upload-text">Upload Selfie</p>
                      <p className="identity-upload-formats">JPEG, PNG formats</p>
                    </div>
                  </>
                ) : (
                  <div
                    className="identity-upload-preview-box"
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="identity-preview-filename">{selfieFile.name}</span>
                  </div>
                )}
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileSelect(e, 'selfie')}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Passport Upload */}
              <div className="identity-upload-section">
                {!passportFile ? (
                  <>
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
                      <p className="identity-upload-text">Upload Passport</p>
                      <p className="identity-upload-formats">JPEG, PNG formats</p>
                    </div>
                  </>
                ) : (
                  <div
                    className="identity-upload-preview-box"
                    onClick={() => passportInputRef.current?.click()}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="identity-preview-filename">{passportFile.name}</span>
                  </div>
                )}
                <input
                  ref={passportInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileSelect(e, 'passport')}
                  style={{ display: 'none' }}
                />
              </div>
            </div>


            {/* Extracted Information - Show after passport upload and OCR */}
            {analyzing && (
              <div className="identity-extracted-info">
                <div className="identity-analyzing-loader">
                  <svg className="identity-spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                  <span>Extracting passport details...</span>
                </div>
              </div>
            )}

            {extractedData && isVerified && !analyzing && (
              <div className="identity-extracted-info">
                <div className="identity-extracted-header">
                  <h3 className="identity-extracted-title">Passport Details</h3>
                  <span className="identity-verified-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Verified
                  </span>
                </div>
                <div className="identity-extracted-grid">
                  <div className="identity-extracted-item">
                    <span className="identity-extracted-label">Country</span>
                    <span className="identity-extracted-value">{extractedData.country}</span>
                  </div>
                  <div className="identity-extracted-item">
                    <span className="identity-extracted-label">Passport Number</span>
                    <span className="identity-extracted-value">{extractedData.passportNumber}</span>
                  </div>
                  <div className="identity-extracted-item">
                    <span className="identity-extracted-label">Full Name</span>
                    <span className="identity-extracted-value">{extractedData.fullName}</span>
                  </div>
                  <div className="identity-extracted-item">
                    <span className="identity-extracted-label">Date of Birth</span>
                    <span className="identity-extracted-value">{extractedData.dateOfBirth}</span>
                  </div>
                  <div className="identity-extracted-item">
                    <span className="identity-extracted-label">Sex</span>
                    <span className="identity-extracted-value">{extractedData.sex}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="identity-actions">
              <button className="identity-btn-previous" onClick={onPrevious}>
                Previous
              </button>
              {isVerified ? (
                <button
                  className="identity-btn-verify"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Verify & Continue'}
                </button>
              ) : (
                <button
                  className="identity-btn-next"
                  onClick={handleNext}
                  disabled={loading || !passportFile || !selfieFile || !isVerified}
                >
                  {loading ? 'Uploading...' : 'Next'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Identity;
