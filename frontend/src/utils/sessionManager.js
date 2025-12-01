// Session Storage Manager for GRA Registration Portal

/**
 * Get unique_id from local storage
 * @returns {string|null} The unique_id or null if not found
 */
export const getUniqueId = () => {
  return localStorage.getItem('unique_id');
};

/**
 * Set unique_id in local storage
 * @param {string} uniqueId - The unique_id to store
 */
export const setUniqueId = (uniqueId) => {
  localStorage.setItem('unique_id', uniqueId);
};

/**
 * Get contact (email or mobile) from local storage
 * @returns {string|null} The contact or null if not found
 */
export const getContact = () => {
  return localStorage.getItem('contact');
};

/**
 * Set contact in local storage
 * @param {string} contact - The contact to store
 */
export const setContact = (contact) => {
  localStorage.setItem('contact', contact);
};

/**
 * Get verification status from local storage
 * @returns {boolean} The verification status
 */
export const isVerified = () => {
  return localStorage.getItem('is_verified') === 'true';
};

/**
 * Set verification status in local storage
 * @param {boolean} verified - The verification status
 */
export const setVerified = (verified) => {
  localStorage.setItem('is_verified', verified);
};

/**
 * Get current step from local storage
 * @returns {number} The current step number (default: 1)
 */
export const getCurrentStep = () => {
  return parseInt(localStorage.getItem('current_step') || '1', 10);
};

/**
 * Set current step in local storage
 * @param {number} step - The step number to store
 */
export const setCurrentStep = (step) => {
  localStorage.setItem('current_step', step.toString());
};

/**
 * Clear all registration session data
 */
export const clearSession = () => {
  localStorage.removeItem('unique_id');
  localStorage.removeItem('contact');
  localStorage.removeItem('is_verified');
  localStorage.removeItem('current_step');
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
