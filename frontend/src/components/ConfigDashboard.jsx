import { useState, useEffect } from 'react';
import './ConfigDashboard.css';
import { ADMIN_API_BASE_URL } from '../utils/api';

const ConfigDashboard = ({ onLogout, userRole = 'maker' }) => {
  const [activeMenu, setActiveMenu] = useState('evat-rules');

  const menuItems = [
    { id: 'evat-rules', label: 'E-VAT Applicability Rules', icon: 'clipboard' },
    { id: 'vat-rate', label: 'VAT Rate Table', icon: 'percent' },
    { id: 'risk-engine', label: 'Risk Engine Parameters', icon: 'alert' },
    { id: 'sector-rules', label: 'Sector Classification Rules', icon: 'grid' },
    { id: 'user-roles', label: 'User Roles & Permissions', icon: 'users' },
    { id: 'notifications', label: 'Notifications and templates', icon: 'bell' },
  ];

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'clipboard':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        );
      case 'percent':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6"/>
            <circle cx="9" cy="9" r="1"/>
            <circle cx="15" cy="15" r="1"/>
          </svg>
        );
      case 'alert':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'grid':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        );
      case 'users':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        );
      case 'bell':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'evat-rules':
        return <EVATApplicabilityRules />;
      case 'vat-rate':
        return <VATRateTable userRole={userRole} />;
      case 'risk-engine':
        return <RiskEngineParameters />;
      case 'sector-rules':
        return <SectorClassificationRules />;
      case 'user-roles':
        return <UserRolesPermissions />;
      case 'notifications':
        return <NotificationsTemplates />;
      default:
        return <EVATApplicabilityRules />;
    }
  };

  const getPageTitle = () => {
    const item = menuItems.find(m => m.id === activeMenu);
    return item ? item.label : 'E-VAT Applicability Rules';
  };

  return (
    <div className="config-dashboard-wrapper">
      <div className="config-dashboard">
        {/* Sidebar */}
        <aside className="config-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="#F59E0B"/>
                <path d="M16 8l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4l2-4z" fill="#2D3B8F"/>
              </svg>
            </div>
            <div className="sidebar-title">
              <span className="sidebar-title-main">Config Module</span>
              <span className="sidebar-title-sub">System Administration</span>
            </div>
          </div>

          {/* User Role Badge */}
          <div className="sidebar-user-role">
            <div className={`role-badge ${userRole}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{userRole === 'maker' ? 'Maker' : 'Checker'}</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                {renderIcon(item.icon)}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Decorative circles at bottom */}
          <div className="sidebar-decoration">
            <div className="sidebar-circle sidebar-circle-1"></div>
            <div className="sidebar-circle sidebar-circle-2"></div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="config-main">
          {/* Top Bar */}
          <header className="config-topbar">
            <h1 className="topbar-title">{getPageTitle()}</h1>
            <div className="topbar-actions">
              <div className="system-status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>All Systems Nominal</span>
              </div>
              <button className="logout-btn" onClick={onLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </header>

          {/* Content Area */}
          <div className="config-content">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// E-VAT Applicability Rules Component
const EVATApplicabilityRules = () => {
  const rules = [
    { id: '01', name: 'B2C Digital Service Threshold', criteria: 'Annual Sales > GHS 200,000', status: 'Active' },
    { id: '02', name: 'Non-Resident Definition', criteria: 'No physical presence + Digital Supply', status: 'Active' },
    { id: '03', name: 'Marketplace Liability', criteria: 'Platform facilitates payment', status: 'Draft' },
  ];

  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">Applicability Rules</h2>
        <button className="add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add Rule
        </button>
      </div>

      <div className="data-table">
        <div className="table-header">
          <div className="table-cell cell-sr">Sr No.</div>
          <div className="table-cell cell-name">Rule Name</div>
          <div className="table-cell cell-criteria">Criteria / Logic</div>
          <div className="table-cell cell-status">Status</div>
          <div className="table-cell cell-actions">Actions</div>
        </div>
        {rules.map((rule) => (
          <div key={rule.id} className="table-row">
            <div className="table-cell cell-sr">{rule.id}</div>
            <div className="table-cell cell-name">{rule.name}</div>
            <div className="table-cell cell-criteria">{rule.criteria}</div>
            <div className="table-cell cell-status">
              <span className={`status-badge ${rule.status.toLowerCase()}`}>{rule.status}</span>
            </div>
            <div className="table-cell cell-actions">
              <button className="action-btn edit-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button className="action-btn delete-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// VAT Rate Table Component
const VATRateTable = ({ userRole = 'maker' }) => {
  const [rates, setRates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reusable fetch function
  const fetchRates = async () => {
    try {
      setError(null);
      const response = await fetch(`${ADMIN_API_BASE_URL}/vat-rates`);
      const data = await response.json();
      if (data.status && data.results?.rates) {
        // Map API response to component format
        const mappedRates = data.results.rates.map((r) => ({
          id: r.id.toString(),
          type: r.levy_type,
          rate: r.rate?.toString() || '0',
          effectiveDate: r.effective_date?.split('T')[0] || '2023-01-01',
          order: r.calculation_order || '1 (Base)',
          status: r.status || 'active',
          pendingRate: r.pending_rate?.toString() || null
        }));
        setRates(mappedRates);
      } else {
        setError('Failed to load VAT rates from server');
      }
    } catch (err) {
      console.error('Error fetching VAT rates:', err);
      setError('Failed to connect to server. Using default rates.');
      // Fallback to default rates if API fails
      setRates([
        { id: '1', type: 'GETFund Levy', rate: '2.5', effectiveDate: '2023-01-01', order: '1 (Base)', status: 'active', pendingRate: null },
        { id: '2', type: 'NHIL', rate: '2.5', effectiveDate: '2023-01-01', order: '1 (Base)', status: 'active', pendingRate: null },
        { id: '3', type: 'COVID-19 Health Recovery Levy', rate: '1', effectiveDate: '2023-01-01', order: '1 (Base)', status: 'active', pendingRate: null },
        { id: '4', type: 'Standard VAT', rate: '15', effectiveDate: '2023-01-01', order: '2 (Calculated on Gross + Levies)', status: 'active', pendingRate: null },
      ]);
    }
  };

  // Fetch VAT rates from API on mount
  useEffect(() => {
    fetchRates();
  }, []);

  const handleEditClick = (rate) => {
    setEditingId(rate.id);
    setEditValue(rate.rate);
  };

  const handleSaveEdit = async (rateId) => {
    setIsLoading(true);
    setError(null);
    try {
      // API call to submit rate change for approval
      const response = await fetch(`${ADMIN_API_BASE_URL}/vat-rate-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate_id: parseInt(rateId, 10),
          new_rate: parseFloat(editValue),
          submitted_by: sessionStorage.getItem('gra_unique_id') || 'maker'
        })
      });

      const data = await response.json();
      if (data.status) {
        // Refresh rates from server to get updated data
        await fetchRates();
      } else {
        setError(data.message || 'Failed to submit rate change');
      }
    } catch (err) {
      console.error('Error submitting rate change:', err);
      setError('Failed to submit rate change');
    } finally {
      setIsLoading(false);
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleApprove = async (rateId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/vat-rate-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate_id: parseInt(rateId, 10),
          action: 'approve',
          approved_by: sessionStorage.getItem('gra_unique_id') || 'checker'
        })
      });

      const data = await response.json();
      if (data.status) {
        // Refresh rates from server to get updated data
        await fetchRates();
      } else {
        setError(data.message || 'Failed to approve rate change');
      }
    } catch (err) {
      console.error('Error approving rate:', err);
      setError('Failed to approve rate change');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (rateId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/vat-rate-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate_id: parseInt(rateId, 10),
          action: 'reject',
          approved_by: sessionStorage.getItem('gra_unique_id') || 'checker'
        })
      });

      const data = await response.json();
      if (data.status) {
        // Refresh rates from server to get updated data
        await fetchRates();
      } else {
        setError(data.message || 'Failed to reject rate change');
      }
    } catch (err) {
      console.error('Error rejecting rate:', err);
      setError('Failed to reject rate change');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">Tax Rates & Levies</h2>
        {userRole === 'maker' && (
          <button className="save-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Save Changes
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="data-table">
        <div className="table-header">
          <div className="table-cell cell-sr">Sr No.</div>
          <div className="table-cell cell-type">Levy / Tax Type</div>
          <div className="table-cell cell-rate">Rate (%)</div>
          <div className="table-cell cell-date">Effective Date</div>
          <div className="table-cell cell-order">Calculation Order</div>
          <div className="table-cell cell-vat-status">Status</div>
          <div className="table-cell cell-actions">Action</div>
        </div>
        {rates.map((rate, index) => (
          <div key={rate.id} className={`table-row ${rate.status === 'pending' ? 'row-pending' : ''}`}>
            <div className="table-cell cell-sr">{String(index + 1).padStart(2, '0')}</div>
            <div className="table-cell cell-type">{rate.type}</div>
            <div className="table-cell cell-rate">
              {editingId === rate.id ? (
                <div className="edit-rate-container">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="rate-edit-input"
                    autoFocus
                  />
                  <span className="rate-percent">%</span>
                </div>
              ) : (
                <div className="rate-display">
                  <span className="rate-badge">{rate.rate} %</span>
                  {rate.pendingRate && (
                    <span className="pending-rate">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      {rate.pendingRate} %
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="table-cell cell-date">{rate.effectiveDate}</div>
            <div className="table-cell cell-order">{rate.order}</div>
            <div className="table-cell cell-vat-status">
              <span className={`vat-status-badge ${rate.pendingRate || rate.status === 'pending' ? 'pending' : 'approved'}`}>
                {rate.pendingRate || rate.status === 'pending' ? 'Pending' : 'Approved'}
              </span>
            </div>
            <div className="table-cell cell-actions">
              {userRole === 'maker' && (
                <>
                  {editingId === rate.id ? (
                    <div className="edit-actions">
                      <button
                        className="action-btn save-edit-btn"
                        onClick={() => handleSaveEdit(rate.id)}
                        disabled={isLoading}
                        title="Save"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                      <button
                        className="action-btn cancel-edit-btn"
                        onClick={handleCancelEdit}
                        title="Cancel"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditClick(rate)}
                      title="Edit Rate"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                </>
              )}
              {userRole === 'checker' && (
                <div className="checker-actions">
                  <button
                    className="action-icon-btn approve-icon-btn"
                    onClick={() => handleApprove(rate.id)}
                    disabled={isLoading || !rate.pendingRate}
                    title="Approve"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#10B981"/>
                      <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2" fill="none"/>
                    </svg>
                  </button>
                  <button
                    className="action-icon-btn reject-icon-btn"
                    onClick={() => handleReject(rate.id)}
                    disabled={isLoading || !rate.pendingRate}
                    title="Reject"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#EF4444"/>
                      <line x1="8" y1="8" x2="16" y2="16" stroke="white" strokeWidth="2"/>
                      <line x1="16" y1="8" x2="8" y2="16" stroke="white" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Risk Engine Parameters Component
const RiskEngineParameters = () => {
  const [riskParams, setRiskParams] = useState([
    { id: 1, title: 'Transaction Volume Velocity', description: 'Rapid increase in processed volume', enabled: false, weight: 'Medium ( 0.4 - 0.6 )' },
    { id: 2, title: 'Unknown PSP Origin', description: 'Merchant using unverified payment gateways', enabled: false, weight: 'Medium ( 0.4 - 0.6 )' },
    { id: 3, title: 'Sector Risk Category', description: 'Gambling, Crypto, Adult content', enabled: false, weight: 'Medium ( 0.4 - 0.6 )' },
    { id: 4, title: 'Non-Resident Indicator', description: 'IP address vs Declared location mismatch', enabled: true, weight: 'Medium ( 0.4 - 0.6 )' },
    { id: 5, title: 'Frequent Refunds', description: 'High chargeback or refund ratio', enabled: true, weight: 'Medium ( 0.4 - 0.6 )' },
  ]);

  const toggleParam = (id) => {
    setRiskParams(params =>
      params.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  };

  return (
    <div className="content-section">
      <div className="section-header-risk">
        <div className="warning-banner">
          <span className="warning-label">Warning:</span> Modifying risk weights affects the automated scoring logic for all incoming PSP merchant data.
        </div>
        <button className="update-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Update Risk Engine
        </button>
      </div>

      <div className="risk-params-grid">
        {riskParams.map((param, index) => (
          <div key={param.id} className={`risk-param-card ${index === 4 ? 'risk-param-card-last' : ''}`}>
            <div className="risk-param-header">
              <div>
                <h3 className="risk-param-title">{param.title}</h3>
                <p className="risk-param-desc">{param.description}</p>
              </div>
              <button
                className={`toggle-switch ${param.enabled ? 'toggle-on' : ''}`}
                onClick={() => toggleParam(param.id)}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>
            <div className="risk-param-weight">
              <label className="weight-label">Weight :</label>
              <div className="weight-select-wrapper">
                <select className="weight-select" defaultValue={param.weight}>
                  <option value="Low ( 0.1 - 0.3 )">Low ( 0.1 - 0.3 )</option>
                  <option value="Medium ( 0.4 - 0.6 )">Medium ( 0.4 - 0.6 )</option>
                  <option value="High ( 0.7 - 0.9 )">High ( 0.7 - 0.9 )</option>
                </select>
                <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sector Classification Rules Component
const SectorClassificationRules = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sectors = [
    { id: '01', code: 'DIG-001', description: 'Streaming Services', keywords: 'video, music, subscription, vod', category: 'Digital Services' },
    { id: '02', code: 'DIG-002', description: 'E-Learning / EdTech', keywords: 'course, academy, tutorial, learning', category: 'Exempt (Conditional)' },
    { id: '03', code: 'DIG-003', description: 'SaaS / Software', keywords: 'cloud, hosting, api, license', category: 'Digital Services' },
    { id: '04', code: 'DIG-004', description: 'Online Gaming', keywords: 'bet, casino, game, credits', category: 'High Risk / Betting Tax' },
  ];

  return (
    <div className="content-section">
      <div className="section-header-sector">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search sector mappings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <button className="filter-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filter
        </button>
      </div>

      <div className="data-table">
        <div className="table-header">
          <div className="table-cell cell-sr">Sr No.</div>
          <div className="table-cell cell-code">Sector Code</div>
          <div className="table-cell cell-desc">Description</div>
          <div className="table-cell cell-keywords">Keywords (AI Matching)</div>
          <div className="table-cell cell-category">Tax Category</div>
        </div>
        {sectors.map((sector) => (
          <div key={sector.id} className="table-row">
            <div className="table-cell cell-sr">{sector.id}</div>
            <div className="table-cell cell-code">{sector.code}</div>
            <div className="table-cell cell-desc">{sector.description}</div>
            <div className="table-cell cell-keywords keywords-text">{sector.keywords}</div>
            <div className="table-cell cell-category">{sector.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// User Roles & Permissions Component
const UserRolesPermissions = () => {
  const roles = [
    { id: 1, name: 'System Administrator', permissions: 'Full Access', users: 3 },
    { id: 2, name: 'GRA Maker', permissions: 'Config Edit, Report View', users: 12 },
    { id: 3, name: 'GRA Checker', permissions: 'Config Approve, Report View', users: 5 },
    { id: 4, name: 'Compliance Officer', permissions: 'Merchant View, Action Initiate', users: 24 },
    { id: 5, name: 'Auditor', permissions: 'Read Only', users: 4 },
  ];

  return (
    <div className="content-section">
      <div className="roles-grid">
        {roles.map((role) => (
          <div key={role.id} className="role-card">
            <div className="role-card-header">
              <div>
                <h3 className="role-name">{role.name}</h3>
                <p className="role-permissions">{role.permissions}</p>
              </div>
              <button className="role-settings-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
            <div className="role-users-badge">{role.users} Active Users</div>
          </div>
        ))}
        <div className="role-card role-card-add">
          <div className="add-role-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>Create New Role</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications and Templates Component
const NotificationsTemplates = () => {
  const [activeTab, setActiveTab] = useState('email');

  const templates = [
    { id: 1, name: 'VAT Liability Intimation', subject: 'Urgent: Outstanding VAT Liability Notice', trigger: 'Risk Engine Action' },
    { id: 2, name: 'Registration Welcome', subject: 'Welcome to GRA e-VAT Portal - Registration Confirmed', trigger: 'Successful Registration' },
    { id: 3, name: 'TIN Generation Notice', subject: 'Your Administrative TIN has been generated', trigger: 'Automated Compliance' },
    { id: 4, name: 'Payment Receipt', subject: 'Receipt for Payment #{{payment_id}}', trigger: 'Payment Gateway Callback' },
  ];

  return (
    <div className="content-section">
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'email' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          Email Templates
        </button>
        <button
          className={`tab-btn ${activeTab === 'sms' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('sms')}
        >
          SMS Templates
        </button>
        <button
          className={`tab-btn ${activeTab === 'alerts' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          System Alerts
        </button>
      </div>

      <div className="templates-list">
        {templates.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div className="template-info">
              <h3 className="template-name">{template.name}</h3>
              <p className="template-subject">Subject: {template.subject}</p>
              <p className="template-trigger">Trigger: {template.trigger}</p>
            </div>
            <button className="edit-template-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigDashboard;
