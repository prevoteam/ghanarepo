import { useState, useCallback } from 'react';
import { ApiError } from './api';

/**
 * Custom hook for managing API calls with loading and error states
 * @returns {object} API state and handlers
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setLoading(false);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'An unexpected error occurred';

      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage, details: err };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
};

export default useApi;
