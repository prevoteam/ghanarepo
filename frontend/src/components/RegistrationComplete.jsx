import { useState, useEffect, useRef } from 'react';
import './RegistrationComplete.css';
import StepBar from './StepBar';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Header, Footer } from './shared';

const RegistrationComplete = ({ uniqueId, onLogin, onRegisterNow, onLoginRedirect, currentStep, steps }) => {
  const [credentialData, setCredentialData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { loading, error, execute } = useApi();
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    completeRegistration();
  }, []);

  useEffect(() => {
    if (credentialData) {
      generateQRCode();
    }
  }, [credentialData]);

  const completeRegistration = async () => {
    const result = await execute(
      registrationApi.completeRegistration,
      uniqueId
    );

    if (result.success) {
      setCredentialData(result.data.results || result.data.data);
    }
  };

  const generateQRCode = async () => {
    try {
      if (credentialData) {
        const qrData = JSON.stringify({
          tin: credentialData.tin || 'GHA21984335',
          credential_id: credentialData.credential_id || 'e8v3ued-cf660caf-8b4a-4864-8f89-892142a0bc91',
          subject_name: credentialData.subject_name || 'Student',
          issue_date: credentialData.issue_date || new Date().toISOString()
        });

        const url = await QRCode.toDataURL(qrData, {
          width: 140,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrCodeUrl(url);
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add header background
      doc.setFillColor(45, 59, 143); // Navy blue #2D3B8F
      doc.rect(0, 0, 210, 40, 'F');

      // Add gold accent
      doc.setFillColor(245, 158, 11); // Gold #F59E0B
      doc.rect(180, 0, 30, 40, 'F');

      // Add GRA title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Ghana Revenue Authority', 15, 20);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Official E-Commerce TIN Credential', 15, 30);

      // Reset text color for body
      doc.setTextColor(0, 0, 0);

      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // Green
      doc.text('Registration Complete!', 105, 60, { align: 'center' });

      // Add credential information
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128); // Gray
      doc.setFont('helvetica', 'normal');

      const leftMargin = 20;
      let yPosition = 80;

      // Subject Name
      doc.text('Subject Name', leftMargin, yPosition);
      doc.setFontSize(14);
      doc.setTextColor(26, 32, 44);
      doc.setFont('helvetica', 'bold');
      doc.text(credentialData?.subject_name || 'Student', leftMargin, yPosition + 7);

      // TIN
      yPosition += 25;
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text('Tax Identification Number (TIN)', leftMargin, yPosition);
      doc.setFontSize(18);
      doc.setTextColor(245, 158, 11); // Gold
      doc.setFont('courier', 'bold');
      doc.text(credentialData?.tin || 'GHA21984335', leftMargin, yPosition + 10);

      // Date of Issue
      yPosition += 25;
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text('Date of Issue', leftMargin, yPosition);
      doc.setFontSize(14);
      doc.setTextColor(26, 32, 44);
      doc.setFont('helvetica', 'bold');
      doc.text(credentialData?.issue_date ? formatDate(credentialData.issue_date) : '20 November 2025', leftMargin, yPosition + 7);

      // Credential ID
      yPosition += 20;
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text('Credential ID', leftMargin, yPosition);
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      const credId = credentialData?.credential_id || 'e8v3ued-cf660caf-8b4a-4864-8f89-892142a0bc91';
      doc.text(credId, leftMargin, yPosition + 7, { maxWidth: 170 });

      // Add QR Code
      if (qrCodeUrl) {
        doc.addImage(qrCodeUrl, 'PNG', 155, 80, 40, 40);
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text('Scan to verify', 175, 125, { align: 'center' });
      }

      // Add footer
      doc.setFillColor(45, 59, 143);
      doc.rect(0, 270, 210, 27, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Integrity. Fairness. Service', 105, 282, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('© 2025 Ghana Revenue Authority. All rights reserved.', 105, 290, { align: 'center' });

      // Save the PDF
      const fileName = `GRA_TIN_Credential_${credentialData?.tin || 'GHA21984335'}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF. Please try again.');
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
      <main className="complete-main">
        <div className="complete-circles">
          <div className="complete-circle complete-circle-1"></div>
          <div className="complete-circle complete-circle-2"></div>
        </div>

        <div className="complete-container">
          <div className="complete-content-box">
            <h1 className="complete-title">Registration Complete</h1>
            <p className="complete-subtitle">
              Your e-VAT registration has been successfully completed. Download your TIN credentials below.
            </p>

            {/* Progress Steps */}
            <StepBar currentStep={currentStep} />

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {loading && !credentialData ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Generating your TIN credentials...</p>
            </div>
          ) : credentialData ? (
            <>
              {/* Success Icon */}
              <div className="success-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              {/* Success Title */}
              <h2 className="success-title">Registration Complete !</h2>

              {/* Credential Card */}
              <div className="credential-card">
                <div className="card-header">
                  <div className="header-content">
                    <div className="gra-text">
                      <h3>Ghana Revenue Authority</h3>
                      <p>Official E-Commerce TIN Credential</p>
                    </div>
                  </div>
                  <div className="gold-accent"></div>
                </div>

                <div className="card-body">
                  <div className="credential-left">
                    <div className="field-group">
                      <label>Subject Name</label>
                      <div className="field-value">{credentialData.subject_name || 'Student'}</div>
                    </div>

                    <div className="field-group tin-field">
                      <label>Tax identification number (TIN)</label>
                      <div className="tin-value">{credentialData.tin || 'GHA21984335'}</div>
                    </div>

                    <div className="field-group">
                      <label>Date of Issue</label>
                      <div className="field-value">
                        {credentialData.issue_date ? formatDate(credentialData.issue_date) : '20 November 2025'}
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Credential ID:</label>
                      <div className="credential-id">
                        {credentialData.credential_id || 'e8v3ued-cf660caf-8b4a-4864-8f89-892142a0bc91'}
                      </div>
                    </div>
                  </div>

                  <div className="credential-right">
                    <div className="qr-code">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" width="140" height="140" />
                      ) : (
                        <div className="qr-loading">Generating QR...</div>
                      )}
                    </div>
                    <p className="qr-label">Scan to download</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="btn-download" onClick={handleDownloadPDF}>
                  Download PDF
                </button>
                <button className="btn-proceed" onClick={onLogin}>
                  Proceed to Login
                </button>
              </div>
            </>
          ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegistrationComplete;
