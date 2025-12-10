import { useState, useEffect } from 'react';
import './PSPDashboard.css';
import { BASE_URL } from '../../utils/api';

const PSPDashboard = ({ onViewTransactions }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/admin/monitoring/psp-dashboard-stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && data.code === 200) {
        setStats(data.results);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching PSP dashboard stats:', err);
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

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
    return `${currency} ${amount?.toLocaleString() || '0'}`;
  };

  if (loading) {
    return (
      <div className="psp-dashboard">
        <div className="dashboard-loading">
          <div className="loader-spinner"></div>
          <p>Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="psp-dashboard">
        <div className="dashboard-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Error loading dashboard: {error}</p>
          <button onClick={fetchDashboardStats} className="retry-btn">Retry</button>
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
            <span className="stat-subtitle">Today / This Month</span>
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
            <span className="stat-label">Records Ingested</span>
            <span className="stat-value">{formatNumber(stats?.recordsIngested || 0)}</span>
            <span className="stat-subtitle">+12% vs last week</span>
            <div className="stat-progress">
              <div className="stat-progress-bar purple" style={{ width: '70%' }}></div>
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
              <div className="stat-progress-bar green" style={{ width: '85%' }}></div>
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
            <span className="stat-subtitle">(${formatNumber(stats?.crossBorderValue?.usd || 0)} USD Equiv)</span>
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
            <span className="stat-subtitle">Identified in data streams</span>
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
              <div className="stat-progress-bar red" style={{ width: '30%' }}></div>
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
            {onViewTransactions && (
              <button className="view-report-btn" onClick={onViewTransactions}>View Transactions</button>
            )}
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
                        height: `${(item.count / maxTrendValue) * 100}%`,
                        backgroundColor: index >= 5 ? '#2D3B8F' : '#6B7BE8'
                      }}
                    >
                      <span className="bar-value">{formatNumber(item.count)}</span>
                    </div>
                    <span className="bar-label">{item.day}</span>
                  </div>
                ))
              ) : (
                <div className="no-data">No trend data available</div>
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
              <div className="no-data">No PSP source data available</div>
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
