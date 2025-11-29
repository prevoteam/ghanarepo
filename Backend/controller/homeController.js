const db = require('../database/db_helper');
const { QueryTypes } = require('sequelize');
const homeService = require('../services/homeService');
const multer = require("multer");

// storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Upload/");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, Date.now() + "-" + Math.random() + "." + ext);
  }
});

const upload = multer({ storage });

module.exports = ({ config }) => {
  const router = config.express.Router();

  router.post('/Register', (req, res, next) => {
    return homeService.Register(req, res, next);
  });

  router.post('/VerifyOTP', (req, res, next) => {
    return homeService.VerifyOTP(req, res, next);
  });

  router.post('/ResendOTP', (req, res, next) => {
    return homeService.ResendOTP(req, res, next);
  });

  router.post('/SetEntity', (req, res, next) => {
    return homeService.UpdateEntityType(req, res, next);
  });

  // Business Details (Step 3)
  router.post('/UpdateBusinessDetails', (req, res, next) => {
    return homeService.UpdateBusinessDetails(req, res, next);
  });

  router.post('/UpdateAgentDetails', (req, res, next) => {
    return homeService.UpdateAgentDetails(req, res, next);
  });

  // Verify Agent TIN (Step 4)
  router.post('/VerifyAgentTIN', (req, res, next) => {
    return homeService.VerifyAgentTIN(req, res, next);
  });

  // ✅ Correct UpdateRegistration route
  router.post(
    "/UpdateRegistration",
    upload.single("document"),
    (req, res, next) => homeService.UpdateRegistration(req, res, next)
  );

  router.post('/UpdateCredential', (req, res, next) => {
    return homeService.UpdateCredential(req, res, next);
  });

  // Login APIs
  router.post('/send-otp', (req, res, next) => {
    return homeService.SendOtp(req, res, next);
  });

  router.post('/verify-otp', (req, res, next) => {
    return homeService.LoginVerifyOtp(req, res, next);
  });

  // Non-Resident Merchant Login (TIN + Password + OTP)
  router.post('/non-resident-login', (req, res, next) => {
    return homeService.NonResidentMerchantLogin(req, res, next);
  });

  // Send OTP for Non-Resident Login
  router.post('/non-resident-send-otp', (req, res, next) => {
    return homeService.SendNonResidentLoginOTP(req, res, next);
  });

  // Unified Merchant Login (Username + Password) - sends OTP
  router.post('/merchant-login', (req, res, next) => {
    return homeService.MerchantLogin(req, res, next);
  });

  // Merchant Verify OTP
  router.post('/merchant-verify-otp', (req, res, next) => {
    return homeService.MerchantVerifyOTP(req, res, next);
  });

  // Merchant Resend OTP
  router.post('/merchant-resend-otp', (req, res, next) => {
    return homeService.MerchantResendOTP(req, res, next);
  });

  // Market Declaration (Step 5)
  router.post('/UpdateMarketDeclaration', (req, res, next) => {
    return homeService.UpdateMarketDeclaration(req, res, next);
  });

  // Payment Gateway (Step 6)
  router.post('/UpdatePaymentGateway', (req, res, next) => {
    return homeService.UpdatePaymentGateway(req, res, next);
  });

  router.post('/DisconnectPaymentGateway', (req, res, next) => {
    return homeService.DisconnectPaymentGateway(req, res, next);
  });

  // e-VAT Obligations (Step 7)
  router.post('/CalculateVATObligation', (req, res, next) => {
    return homeService.CalculateVATObligation(req, res, next);
  });

  // Complete Registration (Step 8)
  router.post('/CompleteRegistration', (req, res, next) => {
    return homeService.CompleteRegistration(req, res, next);
  });

  // Resident Complete Registration
  router.post('/ResidentCompleteRegistration', (req, res, next) => {
    return homeService.ResidentCompleteRegistration(req, res, next);
  });

  // Dashboard
  router.get('/GetDashboard', (req, res, next) => {
    return homeService.GetDashboard(req, res, next);
  });

  // Update Sales Data
  router.post('/UpdateSalesData', (req, res, next) => {
    return homeService.UpdateSalesData(req, res, next);
  });

  // Get Active VAT Rates (Public endpoint for Dashboard)
  router.get('/GetVATRates', (req, res, next) => {
    return homeService.GetActiveVATRates(req, res, next);
  });

  return router;
};
