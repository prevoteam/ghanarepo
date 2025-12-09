const monitoringService = require('../services/monitoringService');

module.exports = ({ config }) => {
    const router = config.express.Router();

    // POST /v1/admin/monitoring/login - Login with TIN/Ghana Card and password
    router.post('/login', (req, res, next) => {
        return monitoringService.MonitoringLogin(req, res, next);
    });

    // POST /v1/admin/monitoring/verify-otp - Verify OTP and complete login
    router.post('/verify-otp', (req, res, next) => {
        return monitoringService.MonitoringVerifyOTP(req, res, next);
    });

    // POST /v1/admin/monitoring/resend-otp - Resend OTP
    router.post('/resend-otp', (req, res, next) => {
        return monitoringService.MonitoringResendOTP(req, res, next);
    });

    // POST /v1/admin/monitoring/logout - Logout user
    router.post('/logout', (req, res, next) => {
        return monitoringService.MonitoringLogout(req, res, next);
    });

    // POST /v1/admin/monitoring/set-password - Set user password
    router.post('/set-password', (req, res, next) => {
        return monitoringService.SetPassword(req, res, next);
    });

    // GET /v1/admin/monitoring/merchant-discovery - Get merchant discovery list
    router.get('/merchant-discovery', (req, res, next) => {
        return monitoringService.GetMerchantDiscovery(req, res, next);
    });

    // GET /v1/admin/monitoring/merchant-discovery/stats - Get merchant discovery stats
    router.get('/merchant-discovery/stats', (req, res, next) => {
        return monitoringService.GetMerchantDiscoveryStats(req, res, next);
    });

    // GET /v1/admin/monitoring/merchant-statistics - Get merchant statistics
    router.get('/merchant-statistics', (req, res, next) => {
        return monitoringService.GetMerchantStatistics(req, res, next);
    });

    // POST /v1/admin/monitoring/config-login - Configuration Login (TIN/Ghana Card)
    router.post('/config-login', (req, res, next) => {
        return monitoringService.ConfigurationLogin(req, res, next);
    });

    // POST /v1/admin/monitoring/config-verify-otp - Configuration Verify OTP
    router.post('/config-verify-otp', (req, res, next) => {
        return monitoringService.ConfigurationVerifyOTP(req, res, next);
    });

    // POST /v1/admin/monitoring/config-resend-otp - Configuration Resend OTP
    router.post('/config-resend-otp', (req, res, next) => {
        return monitoringService.ConfigurationResendOTP(req, res, next);
    });

    // POST /v1/admin/monitoring/gra-admin-login - Unified GRA Admin Login
    router.post('/gra-admin-login', (req, res, next) => {
        return monitoringService.GRAAdminLogin(req, res, next);
    });

    // POST /v1/admin/monitoring/gra-admin-verify-otp - GRA Admin Verify OTP
    router.post('/gra-admin-verify-otp', (req, res, next) => {
        return monitoringService.GRAAdminVerifyOTP(req, res, next);
    });

    // POST /v1/admin/monitoring/gra-admin-resend-otp - GRA Admin Resend OTP
    router.post('/gra-admin-resend-otp', (req, res, next) => {
        return monitoringService.GRAAdminResendOTP(req, res, next);
    });

    // GET /v1/admin/monitoring/vat-rates - Get all VAT rates
    router.get('/vat-rates', (req, res, next) => {
        return monitoringService.GetVATRates(req, res, next);
    });

    // POST /v1/admin/monitoring/vat-rate-change - Submit VAT rate change (Maker)
    router.post('/vat-rate-change', (req, res, next) => {
        return monitoringService.SubmitVATRateChange(req, res, next);
    });

    // POST /v1/admin/monitoring/vat-rate-approve - Approve/Reject VAT rate change (Checker)
    router.post('/vat-rate-approve', (req, res, next) => {
        return monitoringService.ApproveRejectVATRate(req, res, next);
    });

    // GET /v1/admin/monitoring/vat-eligibility - Get VAT eligibility list
    router.get('/vat-eligibility', (req, res, next) => {
        return monitoringService.GetVATEligibilityList(req, res, next);
    });

    // POST /v1/admin/monitoring/compliance-action - Process compliance action
    router.post('/compliance-action', (req, res, next) => {
        return monitoringService.ProcessComplianceAction(req, res, next);
    });

    // GET /v1/admin/monitoring/download-notice/:tin - Download Notice of Liability PDF
    router.get('/download-notice/:tin', (req, res, next) => {
        return monitoringService.DownloadNoticePDF(req, res, next);
    });

    // GET /v1/admin/monitoring/notifications - Get notifications for user
    router.get('/notifications', (req, res, next) => {
        return monitoringService.GetNotifications(req, res, next);
    });

    // PUT /v1/admin/monitoring/notifications/:notification_id/read - Mark notification as read
    router.put('/notifications/:notification_id/read', (req, res, next) => {
        return monitoringService.MarkNotificationRead(req, res, next);
    });

    // POST /v1/admin/monitoring/notifications/mark-all-read - Mark all notifications as read
    router.post('/notifications/mark-all-read', (req, res, next) => {
        return monitoringService.MarkAllNotificationsRead(req, res, next);
    });

    // GET /v1/admin/monitoring/psp-transactions - Get PSP transactions for PSP Ingestion Status page
    router.get('/psp-transactions', (req, res, next) => {
        return monitoringService.GetPSPTransactions(req, res, next);
    });

    return router;
};
