// Session Storage Manager for GRA Registration Portal

/**
 * Get unique_id from session storage
 * @returns {string|null} The unique_id or null if not found
 */
export const getUniqueId = () => {
  return sessionStorage.getItem('unique_id');
};

/**
 * Set unique_id in session storage
 * @param {string} uniqueId - The unique_id to store
 */
export const setUniqueId = (uniqueId) => {
  sessionStorage.setItem('unique_id', uniqueId);
};

/**
 * Get contact (email or mobile) from session storage
 * @returns {string|null} The contact or null if not found
 */
export const getContact = () => {
  return sessionStorage.getItem('contact');
};

/**
 * Set contact in session storage
 * @param {string} contact - The contact to store
 */
export const setContact = (contact) => {
  sessionStorage.setItem('contact', contact);
};

/**
 * Get verification status from session storage
 * @returns {boolean} The verification status
 */
export const isVerified = () => {
  return sessionStorage.getItem('is_verified') === 'true';
};

/**
 * Set verification status in session storage
 * @param {boolean} verified - The verification status
 */
export const setVerified = (verified) => {
  sessionStorage.setItem('is_verified', verified);
};

/**
 * Get current step from session storage
 * @returns {number} The current step number (default: 1)
 */
export const getCurrentStep = () => {
  return parseInt(sessionStorage.getItem('current_step') || '1', 10);
};

/**
 * Set current step in session storage
 * @param {number} step - The step number to store
 */
export const setCurrentStep = (step) => {
  sessionStorage.setItem('current_step', step.toString());
};

/**
 * Clear all registration session data
 */
export const clearSession = () => {
  sessionStorage.removeItem('unique_id');
  sessionStorage.removeItem('contact');
  sessionStorage.removeItem('is_verified');
  sessionStorage.removeItem('current_step');
};

/**
 * Get all session data as an object
 * @returns {object} Object containing all session data
 */
export const getSessionData = () => {
  return {
    uniqueId: getUniqueId(),
    contact: getContact(),
    isVerified: isVerified(),
    currentStep: getCurrentStep()
  };
};
