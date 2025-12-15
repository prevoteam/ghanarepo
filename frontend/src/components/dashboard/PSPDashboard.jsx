import { useState, useEffect, useMemo } from 'react';
import './PSPDashboard.css';

const PSPDashboard = ({ transactionData = [], totalRecords = 0, currentOffset = 200, onViewTransactions, onLoadMore, hasMore, loadingMore }) => {

  // Calculate stats from loaded transaction data
  const stats = useMemo(() => {
    if (!transactionData || transactionData.length === 0) {
      return null;
    }

    const data = transactionData;

    // 1. Total PSPs Reporting (unique psp_provider count)
    const uniquePsps = [...new Set(data.map(t => t.psp_provider).filter(Boolean))];
    const activePsps = uniquePsps.length;
    const totalExpectedPsps = 40;

    // 2. Records Ingested (loaded count)
    const recordsIngested = data.length;

    // 3. Transactions Reported (with status SUCCESS)
    const transactionsReported = data.filter(t => t.status === 'SUCCESS').length;

    // 4. Cross-Border Value (sum of amount_ghs for cross-border transactions)
    const crossBorderTransactions = data.filter(t =>
      t.merchant_country !== 'GH' || t.buyer_country !== 'GH'
    );
    const crossBorderValue = crossBorderTransactions.reduce((sum, t) => {
      const amount = parseFloat(t.amount_ghs) || 0;
      return sum + amount;
    }, 0);

    // 5. Unique Foreign Merchants (merchants not from GH)
    const foreignMerchants = [...new Set(
      data.filter(t => t.merchant_country && t.merchant_country !== 'GH')
        .map(t => t.sender_account)
        .filter(Boolean)
    )];
    const uniqueForeignMerchants = foreignMerchants.length;

    // 6. Potential Non-Resident Sellers (foreign merchants without TIN)
    const nonResidentSellers = [...new Set(
      data.filter(t =>
        t.merchant_country &&
        t.merchant_country !== 'GH' &&
        (!t.merchant_tin || t.merchant_tin === '')
      ).map(t => t.sender_account)
        .filter(Boolean)
    )];
    const potentialNonResident = nonResidentSellers.length;

    // 7. High-Risk Entities (No TIN + amount > 50000) - matches HighRiskEntities page logic
    const highRiskMerchants = data.filter(t => {
      const hasTIN = t.merchant_tin && t.merchant_tin.trim() !== '';
      const transactionValue = parseFloat(t.amount_ghs) || 0;
      // High Risk = Not registered (no TIN) AND amount > 50000
      return !hasTIN && transactionValue > 50000;
    }).length;

    // 8. Ghanaian Buyers (unique buyer IDs from GH)
    const ghBuyers = [...new Set(
      data.filter(t => t.buyer_country === 'GH')
        .map(t => t.receiver_account)
        .filter(Boolean)
    )];
    const ghanaianBuyers = ghBuyers.length;

    // 9. Ingestion Volume Trend (Last 7 Days) - group by date
    const trendMap = {};
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    data.forEach(t => {
      if (t.timestamp) {
        const date = new Date(t.timestamp);
        if (date >= sevenDaysAgo) {
          const dateKey = date.toISOString().split('T')[0];
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          if (!trendMap[dateKey]) {
            trendMap[dateKey] = { day: dayName, date: dateKey, count: 0 };
          }
          trendMap[dateKey].count++;
        }
      }
    });

    const ingestionTrend = Object.values(trendMap).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // 10. Top PSP Sources
    const pspCounts = {};
    data.forEach(t => {
      if (t.psp_provider) {
        pspCounts[t.psp_provider] = (pspCounts[t.psp_provider] || 0) + 1;
      }
    });

    const topPspSources = Object.entries(pspCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / data.length) * 1000) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Calculate USD equivalent (assuming 1 USD = 12 GHS)
    const usdEquivalent = crossBorderValue / 12;

    return {
      totalPspsReporting: {
        active: activePsps,
        total: totalExpectedPsps
      },
      recordsIngested: recordsIngested,
      transactionsReported: transactionsReported,
      crossBorderValue: {
        ghs: crossBorderValue,
        usd: usdEquivalent
      },
      uniqueForeignMerchants: uniqueForeignMerchants,
      potentialNonResident: potentialNonResident,
      highRiskMerchants: highRiskMerchants,
      ghanaianBuyers: ghanaianBuyers,
      ingestionTrend: ingestionTrend,
      topPspSources: topPspSources
    };
  }, [transactionData]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return num.toLocaleString();
    }
    return num?.toString() || '0';
  };

  const formatCurrency = (amount, currency = 'GHS') => {
    if (amount >= 1000000) {
      return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    }
    return `${currency} ${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}`;
  };

  // Show empty state if no data
  if (!transactionData || transactionData.length === 0) {
    return (
      <div className="psp-dashboard">
        <div className="dashboard-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
          <h3>No Transaction Data Loaded</h3>
          <p>Load transaction data to view dashboard statistics</p>
          {onViewTransactions && (
            <button className="load-data-btn" onClick={onViewTransactions}>
              Load Transactions
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate max value for chart scaling
  const maxTrendValue = stats?.ingestionTrend?.length > 0
    ? Math.max(...stats.ingestionTrend.map(d => d.count))
    : 100;

  return (
    <div className="psp-dashboard">
      {/* Records Info */}
      <div className="dashboard-records-info">
        <span className="records-count">
          Showing {formatNumber(currentOffset - transactionData.length + 1)}-{formatNumber(currentOffset)} of {formatNumber(transactionData.length)} loaded
        </span>
      </div>

      {/* Top Row Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total PSPs Reporting</span>
            <span className="stat-value">{stats?.totalPspsReporting?.active || 0}/{stats?.totalPspsReporting?.total || 40}</span>
            <span className="stat-subtitle">In current batch</span>
            <div className="stat-progress">
              <div
                className="stat-progress-bar blue"
                style={{ width: `${((stats?.totalPspsReporting?.active || 0) / (stats?.totalPspsReporting?.total || 40)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Current Batch</span>
            <span className="stat-value">{formatNumber(stats?.recordsIngested || 0)}</span>
            <span className="stat-subtitle">Records {formatNumber(currentOffset - transactionData.length + 1)}-{formatNumber(currentOffset)}</span>
            <div className="stat-progress">
              <div className="stat-progress-bar purple" style={{ width: `${totalRecords > 0 ? (currentOffset / totalRecords) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Transactions Reported</span>
            <span className="stat-value">{formatNumber(stats?.transactionsReported || 0)}</span>
            <span className="stat-subtitle">Processed successfully</span>
            <div className="stat-progress">
              <div className="stat-progress-bar green" style={{ width: `${stats?.recordsIngested > 0 ? (stats?.transactionsReported / stats?.recordsIngested) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Cross-Border Value</span>
            <span className="stat-value">{formatCurrency(stats?.crossBorderValue?.ghs || 0)}</span>
            <span className="stat-subtitle">(${formatNumber(Math.round(stats?.crossBorderValue?.usd || 0))} USD Equiv)</span>
            <div className="stat-progress">
              <div className="stat-progress-bar orange" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-small blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Unique Foreign Merchants</span>
            <span className="stat-value">{formatNumber(stats?.uniqueForeignMerchants || 0)}</span>
            <span className="stat-subtitle">In current batch</span>
            <div className="stat-progress">
              <div className="stat-progress-bar purple" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-small purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Potential Non-Resident Sellers</span>
            <span className="stat-value">{formatNumber(stats?.potentialNonResident || 0)}</span>
            <span className="stat-subtitle">Eligible for registration</span>
            <div className="stat-progress">
              <div className="stat-progress-bar blue" style={{ width: '55%' }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-small red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">High-Risk Merchants</span>
            <span className="stat-value">{formatNumber(stats?.highRiskMerchants || 0)}</span>
            <span className="stat-subtitle">Flagged for review</span>
            <div className="stat-progress">
              <div className="stat-progress-bar red" style={{ width: `${stats?.recordsIngested > 0 ? Math.min((stats?.highRiskMerchants / stats?.recordsIngested) * 100 * 10, 100) : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-small green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Ghanaian Buyers</span>
            <span className="stat-value">{formatNumber(stats?.ghanaianBuyers || 0)}</span>
            <span className="stat-subtitle">Unique consumer IDs</span>
            <div className="stat-progress">
              <div className="stat-progress-bar green" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom">
        {/* Ingestion Volume Trend Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Ingestion Volume Trend (Last 7 Days)</h3>
            <span className="chart-subtitle">Based on records {formatNumber(currentOffset - transactionData.length + 1)}-{formatNumber(currentOffset)}</span>
          </div>
          <div className="chart-container">
            <div className="chart-y-axis">
              {[...Array(6)].map((_, i) => (
                <span key={i}>{formatNumber(Math.round(maxTrendValue * (5 - i) / 5))}</span>
              ))}
            </div>
            <div className="bar-chart">
              {stats?.ingestionTrend?.length > 0 ? (
                stats.ingestionTrend.map((item, index) => (
                  <div className="bar-wrapper" key={index}>
                    <div
                      className="bar"
                      style={{
                        height: `${maxTrendValue > 0 ? (item.count / maxTrendValue) * 100 : 0}%`,
                        backgroundColor: index >= 5 ? '#2D3B8F' : '#6B7BE8'
                      }}
                    >
                      <span className="bar-value">{formatNumber(item.count)}</span>
                    </div>
                    <span className="bar-label">{item.day}</span>
                  </div>
                ))
              ) : (
                <div className="no-data">No trend data in current batch</div>
              )}
            </div>
          </div>
        </div>

        {/* Top PSP Sources */}
        <div className="psp-sources-card">
          <h3>Top PSP Sources</h3>
          <div className="psp-sources-list">
            {stats?.topPspSources?.length > 0 ? (
              stats.topPspSources.map((source, index) => (
                <div className="psp-source-item" key={index}>
                  <div className="psp-source-header">
                    <span className="psp-source-name">{source.name}</span>
                    <span className="psp-source-percentage">{source.percentage}%</span>
                  </div>
                  <div className="psp-source-bar">
                    <div
                      className={`psp-source-progress ${getProgressColor(index)}`}
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No PSP source data in current batch</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get progress bar color
const getProgressColor = (index) => {
  const colors = ['blue', 'dark-blue', 'green', 'gray'];
  return colors[index] || 'gray';
};

export default PSPDashboard;
