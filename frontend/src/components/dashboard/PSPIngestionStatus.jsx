import './DashboardPages.css';
import one from "../../assets/img-1-2.png";
// import two from "../assets/img-1-2.png";
// import three from "../assets/img-1-3.png";

const PSPIngestionStatus = () => {
  const statsCards = [
    { title: 'Total PSPs Reporting', value: '12/40', subtitle: 'Today / This Month', color: 'blue', progress: 30 },
    { title: 'Records Ingested', value: '1,250,430', subtitle: '+12% vs last week', color: 'green', progress: 65 },
    { title: 'Transactions Reported', value: '890,120', subtitle: 'Processed successfully', color: 'orange', progress: 80 },
    { title: 'Cross-Border Value', value: 'GHS 450.2M', subtitle: '($38.5M USD Equiv)', color: 'teal', progress: 55 },
  ];

  const metricsCards = [
    { title: 'Unique Foreign Merchants', value: '5234', subtitle: 'Identified in data streams', color: 'red', progress: 70 },
    { title: 'Potential Non-Resident Sellers', value: '3,100', subtitle: 'Eligible for registration', color: 'yellow', progress: 50 },
    { title: 'High-Risk Merchants', value: '124', subtitle: 'Flagged for review', color: 'red-light', progress: 20 },
    { title: 'Ghanaian Buyers', value: '245000', subtitle: 'Unique consumer IDs', color: 'green', progress: 85 },
  ];

  const chartData = [
    { day: 'Mon', value: 45000 },
    { day: 'Tue', value: 62000 },
    { day: 'Wed', value: 48000 },
    { day: 'Thu', value: 51000 },
    { day: 'Fri', value: 78000 },
    { day: 'Sat', value: 92000 },
    { day: 'Sun', value: 85000 },
  ];

  const pspSources = [
    { name: 'Stripe', percentage: 45, color: '#2D3B8F' },
    { name: 'PayPal', percentage: 30, color: '#2D3B8F' },
    { name: 'Paystack', percentage: 15, color: '#10B981' },
    { name: 'Other', percentage: 10, color: '#9CA3AF' },
  ];

  const maxChartValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="page-content">
      {/* Stats Row */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon stat-icon-${stat.color}`}>
                {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg> */}
                <img src={one} alt="database" width={20} height={20} />
              </div>
              <span className="stat-title">{stat.title}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-subtitle">{stat.subtitle}</div>
            <div className="stat-progress">
              <div className={`stat-progress-bar bg-${stat.color}`} style={{ width: `${stat.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        {metricsCards.map((metric, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon stat-icon-${metric.color}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <span className="stat-title">{metric.title}</span>
            </div>
            <div className="stat-value">{metric.value}</div>
            <div className="stat-subtitle">{metric.subtitle}</div>
            <div className="stat-progress">
              <div className={`stat-progress-bar bg-${metric.color}`} style={{ width: `${metric.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Ingestion Volume Trend (Last 7 Days)</h3>
            <button className="view-report-btn">View Report</button>
          </div>
          <div className="bar-chart">
            <div className="chart-y-axis">
              <span>90,000</span>
              <span>80,000</span>
              <span>70,000</span>
              <span>60,000</span>
              <span>50,000</span>
              <span>40,000</span>
              <span>30,000</span>
              <span>20,000</span>
              <span>10,000</span>
              <span>0</span>
            </div>
            <div className="chart-bars">
              {chartData.map((data, index) => (
                <div key={index} className="bar-container">
                  <div
                    className="bar"
                    style={{ height: `${(data.value / maxChartValue) * 100}%` }}
                  ></div>
                  <span className="bar-label">{data.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PSP Sources */}
        <div className="chart-card">
          <h3 className="chart-title">Top PSP Sources</h3>
          <div className="psp-sources">
            {pspSources.map((psp, index) => (
              <div key={index} className="psp-source-item">
                <div className="psp-source-header">
                  <span className="psp-name">{psp.name}</span>
                  <span className="psp-percentage">{psp.percentage}%</span>
                </div>
                <div className="psp-progress">
                  <div
                    className="psp-progress-bar"
                    style={{ width: `${psp.percentage}%`, background: psp.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PSPIngestionStatus;
