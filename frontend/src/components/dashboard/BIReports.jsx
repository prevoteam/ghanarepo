import './DashboardPages.css';

const BIReports = () => {
  const summaryCards = [
    { title: 'Total e-VAT Revenue (YTD)', value: 'GHS 142.5 M', subtitle: '+18.4% vs Previous Year', icon: 'revenue' },
    { title: 'Projected vs Actual (Current Month)', value: '98.2%', subtitle: 'Target: GHS 12.0M | Actual: GHS 11.8M', icon: 'target' },
    { title: 'Compliance Index', value: '72/100', subtitle: '', icon: 'compliance', progress: 72 },
  ];

  const monthlyData = [
    { month: 'Jun', actual: 85, forecast: 90 },
    { month: 'Jul', actual: 92, forecast: 88 },
    { month: 'Aug', actual: 78, forecast: 82 },
    { month: 'Sep', actual: 88, forecast: 85 },
    { month: 'Oct', actual: 95, forecast: 90 },
    { month: 'Nov', actual: 100, forecast: 95 },
  ];

  const regionalData = [
    { region: 'Greater Accra', value: 'GHS 85.4M', percentage: 60 },
    { region: 'Ashanti', value: 'GHS 32.1M', percentage: 45 },
    { region: 'Western', value: 'GHS 15.2M', percentage: 30 },
    { region: 'Central', value: 'GHS 6.8M', percentage: 20 },
    { region: 'Northern', value: 'GHS 3.0M', percentage: 15 },
  ];

  const sectorData = [
    { sector: 'Streaming (45%)', value: 'GHS 64.1M', color: '#2D3B8F' },
    { sector: 'E-Commerce (30%)', value: 'GHS 42.7M', color: '#4052B5' },
    { sector: 'SaaS/Cloud (25%)', value: 'GHS 35.6M', color: '#6B7CB5' },
  ];

  const maxMonthlyValue = 100;

  return (
    <div className="page-content bi-reports">
      {/* Summary Cards */}
      <div className="bi-summary-grid">
        {summaryCards.map((card, index) => (
          <div key={index} className="bi-summary-card">
            <div className="bi-card-header">
              <span className="bi-card-title">{card.title}</span>
            </div>
            <div className="bi-card-value">{card.value}</div>
            {card.subtitle && <div className="bi-card-subtitle">{card.subtitle}</div>}
            {card.progress && (
              <div className="bi-progress-bar">
                <div className="bi-progress-fill" style={{ width: `${card.progress}%` }}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="bi-charts-grid">
        {/* Tax Collection Trends */}
        <div className="bi-chart-card">
          <div className="bi-chart-header">
            <div className="bi-chart-title-section">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                <path d="M18 20V10"/>
                <path d="M12 20V4"/>
                <path d="M6 20v-6"/>
              </svg>
              <h3>Tax Collection Trends (Last 6 Months)</h3>
            </div>
            <div className="bi-chart-legend">
              <span className="legend-item"><span className="legend-dot actual"></span> Actual</span>
              <span className="legend-item"><span className="legend-dot forecast"></span> Forecast</span>
            </div>
          </div>
          <div className="bi-bar-chart">
            {monthlyData.map((data, index) => (
              <div key={index} className="bi-bar-group">
                <div className="bi-bars">
                  <div className="bi-bar actual" style={{ height: `${(data.actual / maxMonthlyValue) * 150}px` }}></div>
                  <div className="bi-bar forecast" style={{ height: `${(data.forecast / maxMonthlyValue) * 150}px` }}></div>
                </div>
                <span className="bi-bar-label">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bi-chart-card">
          <div className="bi-chart-header">
            <div className="bi-chart-title-section">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D3B8F" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <h3>Regional Performance</h3>
            </div>
          </div>
          <div className="regional-list">
            {regionalData.map((region, index) => (
              <div key={index} className="regional-item">
                <div className="regional-header">
                  <span className="regional-name">{region.region}</span>
                  <span className="regional-value">{region.value}</span>
                </div>
                <div className="regional-bar">
                  <div className="regional-fill" style={{ width: `${region.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="download-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Geographic Report (PDF)
          </button>
        </div>
      </div>

      {/* Sector Contribution */}
      <div className="bi-sector-card">
        <div className="bi-chart-header">
          <div className="bi-chart-title-section">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <h3>Sector Contribution</h3>
          </div>
        </div>
        <div className="sector-content">
          <div className="sector-chart">
            <div className="donut-chart">
              <div className="donut-center">
                <span className="donut-label">Top Sector</span>
                <span className="donut-value">Streaming</span>
              </div>
            </div>
          </div>
          <div className="sector-legend">
            {sectorData.map((sector, index) => (
              <div key={index} className="sector-item">
                <span className="sector-dot" style={{ background: sector.color }}></span>
                <div className="sector-info">
                  <span className="sector-name">{sector.sector}</span>
                  <span className="sector-value">{sector.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BIReports;
