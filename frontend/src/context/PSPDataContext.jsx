import { createContext, useContext, useState, useCallback } from 'react';
import { BASE_URL } from '../utils/api';

const PSPDataContext = createContext(null);

export const usePSPData = () => {
  const context = useContext(PSPDataContext);
  if (!context) {
    throw new Error('usePSPData must be used within a PSPDataProvider');
  }
  return context;
};

export const PSPDataProvider = ({ children }) => {
  const [transactionData, setTransactionData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load initial 200 records
  const loadInitialData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setCurrentOffset(0);

    try {
      const response = await fetch(`${BASE_URL}/admin/monitoring/psp-transactions?limit=200&offset=0`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.code === 200) {
        setTransactionData(data.results.transactions || []);
        setTotalRecords(data.results.total || data.results.transactions?.length || 0);
        setCurrentOffset(200);
        setHasMore(data.results.pagination?.hasMore || false);
        setIsDataLoaded(true);
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching PSP transactions:', err);
      setError(err.message || 'Failed to fetch PSP transactions');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Load next 200 records (replaces current data)
  const loadNextBatch = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const response = await fetch(`${BASE_URL}/admin/monitoring/psp-transactions?limit=200&offset=${currentOffset}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.code === 200) {
        // Replace with new 200 records (not append)
        setTransactionData(data.results.transactions || []);
        setCurrentOffset(prev => prev + 200);
        setHasMore(data.results.pagination?.hasMore || false);
      } else {
        throw new Error(data.message || 'Failed to fetch more transactions');
      }
    } catch (err) {
      console.error('Error loading more PSP transactions:', err);
      setError(err.message || 'Failed to load more PSP transactions');
    } finally {
      setLoadingMore(false);
    }
  }, [currentOffset, hasMore, loadingMore]);

  // Refresh - reload from beginning
  const refreshData = useCallback(async () => {
    setLoadingMore(true);
    setCurrentOffset(0);

    try {
      const response = await fetch(`${BASE_URL}/admin/monitoring/psp-transactions?limit=200&offset=0`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.code === 200) {
        setTransactionData(data.results.transactions || []);
        setTotalRecords(data.results.total || data.results.transactions?.length || 0);
        setCurrentOffset(200);
        setHasMore(data.results.pagination?.hasMore || false);
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error refreshing PSP transactions:', err);
      setError(err.message || 'Failed to refresh PSP transactions');
    } finally {
      setLoadingMore(false);
    }
  }, []);

  // Get merchants list from current data
  const getMerchants = useCallback(() => {
    const merchantMap = new Map();

    transactionData.forEach(t => {
      const merchantId = t.sender_account;
      if (merchantId && !merchantMap.has(merchantId)) {
        merchantMap.set(merchantId, {
          id: merchantId,
          name: t.merchant_name || 'Unknown',
          email: t.merchant_email || '-',
          phone: t.merchant_phone || '-',
          country: t.merchant_country || '-',
          tin: t.merchant_tin || '-',
          psp_provider: t.psp_provider || '-',
          transactionCount: 0,
          totalAmount: 0
        });
      }

      if (merchantId && merchantMap.has(merchantId)) {
        const merchant = merchantMap.get(merchantId);
        merchant.transactionCount++;
        merchant.totalAmount += parseFloat(t.amount_ghs) || 0;
      }
    });

    return Array.from(merchantMap.values());
  }, [transactionData]);

  // Get high risk merchants (amount > 10000)
  const getHighRiskMerchants = useCallback(() => {
    const highRiskMap = new Map();

    transactionData.forEach(t => {
      const amount = parseFloat(t.amount_ghs) || 0;
      if (amount > 10000) {
        const merchantId = t.sender_account;
        if (merchantId && !highRiskMap.has(merchantId)) {
          highRiskMap.set(merchantId, {
            id: merchantId,
            name: t.merchant_name || 'Unknown',
            email: t.merchant_email || '-',
            phone: t.merchant_phone || '-',
            country: t.merchant_country || '-',
            tin: t.merchant_tin || '-',
            psp_provider: t.psp_provider || '-',
            highestAmount: amount,
            transactionCount: 0,
            totalAmount: 0,
            riskReason: 'High transaction amount (> GHS 10,000)'
          });
        }

        if (merchantId && highRiskMap.has(merchantId)) {
          const merchant = highRiskMap.get(merchantId);
          merchant.transactionCount++;
          merchant.totalAmount += amount;
          if (amount > merchant.highestAmount) {
            merchant.highestAmount = amount;
          }
        }
      }
    });

    return Array.from(highRiskMap.values()).sort((a, b) => b.highestAmount - a.highestAmount);
  }, [transactionData]);

  // Get foreign merchants (non-GH)
  const getForeignMerchants = useCallback(() => {
    const foreignMap = new Map();

    transactionData.forEach(t => {
      if (t.merchant_country && t.merchant_country !== 'GH') {
        const merchantId = t.sender_account;
        if (merchantId && !foreignMap.has(merchantId)) {
          foreignMap.set(merchantId, {
            id: merchantId,
            name: t.merchant_name || 'Unknown',
            email: t.merchant_email || '-',
            phone: t.merchant_phone || '-',
            country: t.merchant_country || '-',
            tin: t.merchant_tin || '-',
            psp_provider: t.psp_provider || '-',
            transactionCount: 0,
            totalAmount: 0,
            isNonResident: !t.merchant_tin || t.merchant_tin === ''
          });
        }

        if (merchantId && foreignMap.has(merchantId)) {
          const merchant = foreignMap.get(merchantId);
          merchant.transactionCount++;
          merchant.totalAmount += parseFloat(t.amount_ghs) || 0;
        }
      }
    });

    return Array.from(foreignMap.values());
  }, [transactionData]);

  const value = {
    // Data
    transactionData,
    totalRecords,
    currentOffset,
    loading,
    loadingMore,
    error,
    hasMore,
    isDataLoaded,

    // Actions
    loadInitialData,
    loadNextBatch,
    refreshData,

    // Computed data
    getMerchants,
    getHighRiskMerchants,
    getForeignMerchants
  };

  return (
    <PSPDataContext.Provider value={value}>
      {children}
    </PSPDataContext.Provider>
  );
};

export default PSPDataContext;
