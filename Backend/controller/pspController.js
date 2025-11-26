const pspService = require('../services/pspService');

module.exports = ({ config }) => {
  const router = config.express.Router();

  // Register PSP
  router.post('/register', (req, res, next) => {
    return pspService.RegisterPSP(req, res, next);
  });

  // Get PSP Credentials
  router.get('/credentials', (req, res, next) => {
    return pspService.GetPSPCredentials(req, res, next);
  });

  // Test API Endpoint
  router.post('/test-endpoint', (req, res, next) => {
    return pspService.TestEndpoint(req, res, next);
  });

  return router;
};
