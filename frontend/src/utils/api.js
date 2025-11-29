// API Configuration and Utility Functions
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1';
const API_BASE_URL = `${BASE_URL}/home`;
const ADMIN_API_BASE_URL = `${BASE_URL}/admin/monitoring`;
const ADMIN_USERS_API_BASE_URL = `${BASE_URL}/admin`;
const QR_CODE_API_URL = import.meta.env.VITE_QR_CODE_API_URL || 'https://api.qrserver.com/v1/create-qr-code';
const PAYMENT_PORTAL_URL = import.meta.env.VITE_PAYMENT_PORTAL_URL || 'https://pay.gra.gov.gh';
const GHANA_SITES_API_URL = import.meta.env.VITE_GHANA_SITES_API_URL || 'http://127.0.0.1:8000/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Makes an API request with error handling
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data
      );
    }

    // Check if backend returned an error status
    if (data.status === false) {
      throw new ApiError(
        data.message || 'Request failed',
        data.code || data.resCode || response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error.message || 'Network error occurred',
      0,
      null
    );
  }
}

// Registration APIs
export const registrationApi = {
  // Step 1: Register and send OTP
  register: async (contact, method, password = null) => {
    const payload = { contact, method };
    if (password) {
      payload.password = password;
    }
    return apiRequest('/Register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Verify OTP
  verifyOTP: async (unique_id, otp) => {
    return apiRequest('/VerifyOTP', {
      method: 'POST',
      body: JSON.stringify({ unique_id, otp }),
    });
  },

  // Resend OTP
  resendOTP: async (contact) => {
    return apiRequest('/ResendOTP', {
      method: 'POST',
      body: JSON.stringify({ contact }),
    });
  },

  // Step 2: Set Entity Type
  setEntity: async (unique_id, entity_type) => {
    return apiRequest('/SetEntity', {
      method: 'POST',
      body: JSON.stringify({ unique_id, entity_type }),
    });
  },

  // Step 3-4: Update Agent Details
  updateAgentDetails: async (data) => {
    return apiRequest('/UpdateAgentDetails', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Step 5: Market Declaration
  updateMarketDeclaration: async (unique_id, sells_digital_services, annual_sales_volume) => {
    return apiRequest('/UpdateMarketDeclaration', {
      method: 'POST',
      body: JSON.stringify({
        unique_id,
        sells_digital_services,
        annual_sales_volume,
      }),
    });
  },

  // Step 6: Payment Gateway
  updatePaymentGateway: async (unique_id, payment_provider, merchant_id = null) => {
    return apiRequest('/UpdatePaymentGateway', {
      method: 'POST',
      body: JSON.stringify({
        unique_id,
        payment_provider,
        ...(merchant_id && { merchant_id }),
      }),
    });
  },

  disconnectPaymentGateway: async (unique_id) => {
    return apiRequest('/DisconnectPaymentGateway', {
      method: 'POST',
      body: JSON.stringify({ unique_id }),
    });
  },

  // Step 7: VAT Obligations
  calculateVATObligation: async (unique_id) => {
    return apiRequest('/CalculateVATObligation', {
      method: 'POST',
      body: JSON.stringify({ unique_id }),
    });
  },

  // Step 8: Complete Registration
  completeRegistration: async (unique_id) => {
    return apiRequest('/CompleteRegistration', {
      method: 'POST',
      body: JSON.stringify({ unique_id }),
    });
  },
};

// Login APIs
export const loginApi = {
  // Send login OTP (legacy - TIN/Ghana Card)
  sendOTP: async (credential) => {
    return apiRequest('/send-otp', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  // Verify login OTP (legacy - TIN/Ghana Card)
  verifyOTP: async (credential, otp) => {
    return apiRequest('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ credential, otp }),
    });
  },

  // Resident Login with Username/Password (Step 1: sends OTP)
  residentLogin: async (username, password) => {
    return apiRequest('/resident-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Resident Verify OTP (Step 2: complete login)
  residentVerifyOTP: async (session_id, otp) => {
    return apiRequest('/resident-verify-otp', {
      method: 'POST',
      body: JSON.stringify({ session_id, otp }),
    });
  },

  // Resident Resend OTP
  residentResendOTP: async (session_id) => {
    return apiRequest('/resident-resend-otp', {
      method: 'POST',
      body: JSON.stringify({ session_id }),
    });
  },

  // Non-Resident Login with Username/Password (Step 1: sends OTP)
  nonResidentLogin: async (username, password) => {
    return apiRequest('/nonresident-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Non-Resident Verify OTP (Step 2: complete login)
  nonResidentVerifyOTP: async (session_id, otp) => {
    return apiRequest('/nonresident-verify-otp', {
      method: 'POST',
      body: JSON.stringify({ session_id, otp }),
    });
  },

  // Non-Resident Resend OTP
  nonResidentResendOTP: async (session_id) => {
    return apiRequest('/nonresident-resend-otp', {
      method: 'POST',
      body: JSON.stringify({ session_id }),
    });
  },
};

// Dashboard APIs
export const dashboardApi = {
  // Get dashboard data
  getDashboard: async (unique_id) => {
    return apiRequest(`/GetDashboard?unique_id=${unique_id}`, {
      method: 'GET',
    });
  },

  // Update sales data
  updateSalesData: async (unique_id, total_sales) => {
    return apiRequest('/UpdateSalesData', {
      method: 'POST',
      body: JSON.stringify({ unique_id, total_sales }),
    });
  },
};

// PSP On-boarding APIs
export const pspApi = {
  // Register PSP
  registerPSP: async (data) => {
    return apiRequest('/psp/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get PSP credentials
  getPSPCredentials: async (psp_id) => {
    return apiRequest(`/psp/credentials?psp_id=${psp_id}`, {
      method: 'GET',
    });
  },

  // Test API endpoint
  testEndpoint: async (endpoint, method, apiKey, body) => {
    return apiRequest('/psp/test-endpoint', {
      method: 'POST',
      body: JSON.stringify({ endpoint, method, apiKey, body }),
    });
  },
};

// Export all
export {
  ApiError,
  BASE_URL,
  API_BASE_URL,
  ADMIN_API_BASE_URL,
  ADMIN_USERS_API_BASE_URL,
  QR_CODE_API_URL,
  PAYMENT_PORTAL_URL,
  GHANA_SITES_API_URL
};
export default {
  registrationApi,
  loginApi,
  dashboardApi,
  pspApi,
};
