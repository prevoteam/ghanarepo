import { useState, useEffect, useRef } from 'react';
import './RegistrationComplete.css';
import StepBar from './StepBar';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

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
        console.log('Generating QR code for:', credentialData);

        // Just encode the TIN number - simple and easy to scan
        const tin = credentialData.tin || 'GHA21984335';

        console.log('QR code data (TIN):', tin);

        const url = await QRCode.toDataURL(tin, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H' // High error correction for better scanning
        });

        console.log('QR code generated successfully');
        setQrCodeUrl(url);
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) {
      alert('QR code is not ready yet. Please wait.');
      return;
    }

    const link = document.createElement('a');
    link.download = `GRA_QR_${credentialData?.tin || 'credential'}.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    if (!credentialData?.tin) {
      alert('TIN is not available. Please wait for registration to complete.');
      return;
    }

    try {
      console.log('Starting PDF generation...');
      console.log('Credential data:', credentialData);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add header
      doc.setFillColor(26, 115, 232);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Ghana Revenue Authority', 105, 18, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('e-Commerce Registration Certificate', 105, 30, { align: 'center' });

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Add certificate content
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Registration Certificate', 105, 60, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('This is to certify that', 105, 75, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const fullName = credentialData?.subject_name || 'Registered User';
      doc.text(fullName, 105, 90, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('has been successfully registered on the e-Commerce Portal.', 105, 105, { align: 'center' });

      // Add details box
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(30, 120, 150, 70, 3, 3, 'FD');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Registration Details:', 40, 135);

      doc.setFont('helvetica', 'normal');
      doc.text(`TIN: ${credentialData?.tin}`, 40, 150);
      doc.text(`Email: ${credentialData?.email || 'N/A'}`, 40, 162);
      doc.text(`VAT ID: ${credentialData?.vat_id || 'N/A'}`, 40, 174);
      doc.text(`Registration Date: ${credentialData?.issue_date ? formatDate(credentialData.issue_date) : new Date().toLocaleDateString()}`, 40, 186);

      // Generate and add QR Code
      if (qrCodeUrl) {
        doc.addImage(qrCodeUrl, 'PNG', 80, 200, 50, 50);
        doc.setFontSize(10);
        doc.text('Scan to verify', 105, 255, { align: 'center' });
      }

      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('This is an electronically generated certificate.', 105, 275, { align: 'center' });
      doc.text('Ghana Revenue Authority - e-Commerce Portal', 105, 282, { align: 'center' });

      // Save the PDF
      const fileName = `TIN_Certificate_${credentialData?.tin}.pdf`;
      doc.save(fileName);
      console.log('PDF saved successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF: ' + err.message);
    }
  };

  return (
    <div className="registration-form-content">
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
                      <p>Official e-Commerce TIN Credential</p>
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
                    <div className="qr-code" onClick={handleDownloadQR} style={{ cursor: qrCodeUrl ? 'pointer' : 'default' }}>
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" width="140" height="140" />
                      ) : (
                        <div className="qr-loading">Generating QR...</div>
                      )}
                    </div>
                    <p className="qr-label">Scan to see TIN</p>
                    {qrCodeUrl && (
                      <button
                        className="btn-download-qr"
                        onClick={handleDownloadQR}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Download QR
                      </button>
                    )}
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
    </div>
  );
};

export default RegistrationComplete;
