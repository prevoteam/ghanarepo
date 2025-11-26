// API Configuration and Utility Functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1/home';

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
  register: async (contact, method) => {
    return apiRequest('/Register', {
      method: 'POST',
      body: JSON.stringify({ contact, method }),
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
  // Send login OTP
  sendOTP: async (credential) => {
    return apiRequest('/send-otp', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  // Verify login OTP
  verifyOTP: async (credential, otp) => {
    return apiRequest('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ credential, otp }),
    });
  },

  // Non-Resident Merchant Login (TIN + Password + OTP)
  nonResidentLogin: async (tin, password, otp) => {
    return apiRequest('/non-resident-login', {
      method: 'POST',
      body: JSON.stringify({ tin, password, otp }),
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
export { ApiError, API_BASE_URL };
export default {
  registrationApi,
  loginApi,
  dashboardApi,
  pspApi,
};
