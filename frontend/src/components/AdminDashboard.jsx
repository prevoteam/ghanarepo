import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { ADMIN_USERS_API_BASE_URL } from '../utils/api';


const AdminDashboard = ({ onLogout, onLogoClick }) => {
  const [activeMenu, setActiveMenu] = useState('user-list');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state for Add New User
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    tin: '',
    ghana_id: '',
    user_role: '',
    email: '',
    username: '',
    password: ''
  });

  // Form state for Edit User
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    tin: '',
    ghana_id: '',
    user_role: '',
    email: ''
  });

  const menuItems = [
    { id: 'user-list', label: 'User List', icon: 'list' },
    { id: 'add-user', label: 'Add New User', icon: 'add' },
    { id: 'manage-user', label: 'Manage User', icon: 'manage' }
  ];

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
    fetchUserRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${ADMIN_USERS_API_BASE_URL}/users?limit=100`);
      const data = await response.json();
      if (data.status && data.code === 200) {
        setUsers(data.results.users || []);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const response = await fetch(`${ADMIN_USERS_API_BASE_URL}/users/roles`);
      const data = await response.json();
      if (data.status && data.code === 200) {
        setUserRoles(data.results.roles || []);
      }
    } catch (err) {
      console.error('Fetch roles error:', err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openEditModal = (user) => {
    // Split full_name into first and last name
    const nameParts = (user.full_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setEditFormData({
      first_name: firstName,
      last_name: lastName,
      tin: user.tin || '',
      ghana_id: user.ghana_card_number || '',
      user_role: user.user_role || '',
      email: user.email || ''
    });
    setEditingUser(user);
    setShowEditModal(true);
    setError(null);
    setSuccessMessage('');
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditFormData({
      first_name: '',
      last_name: '',
      tin: '',
      ghana_id: '',
      user_role: '',
      email: ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`${ADMIN_USERS_API_BASE_URL}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      const data = await response.json();

      if (data.status && data.code === 200) {
        setSuccessMessage('User updated successfully!');
        fetchUsers();
        setTimeout(() => {
          closeEditModal();
          setSuccessMessage('');
        }, 1500);
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Update user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`${ADMIN_USERS_API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.status && data.code === 201) {
        setSuccessMessage('User added successfully!');
        setFormData({
          first_name: '',
          last_name: '',
          tin: '',
          ghana_id: '',
          user_role: '',
          email: '',
          username: '',
          password: ''
        });
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to add user');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Add user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updateData) => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`${ADMIN_USERS_API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      const data = await response.json();

      if (data.status && data.code === 200) {
        setSuccessMessage('User updated successfully!');
        setEditingUser(null);
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Update user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`${ADMIN_USERS_API_BASE_URL}/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.status && data.code === 200) {
        setSuccessMessage('User deleted successfully!');
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Delete user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.full_name || '').toLowerCase().includes(searchLower) ||
      (user.tin || '').toLowerCase().includes(searchLower) ||
      (user.ghana_card_number || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower)
    );
  });

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'list':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        );
      case 'add':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        );
      case 'manage':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getRoleLabel = (roleValue) => {
    const role = userRoles.find(r => r.value === roleValue);
    return role ? role.label : roleValue || 'N/A';
  };

  const renderUserList = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <h2 className="section-title">All Users</h2>
        <div className="section-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search sector mappings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <button className="add-user-btn" onClick={() => setActiveMenu('add-user')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}
      {successMessage && <div className="success-alert">{successMessage}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>User Name</th>
              <th>TIN Number</th>
              <th>Ghana ID</th>
              <th>User Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-cell">Loading...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{String(index + 1).padStart(2, '0')}</td>
                  <td>{user.full_name || 'N/A'}</td>
                  <td>{user.tin || 'N/A'}</td>
                  <td>{user.ghana_card_number || 'N/A'}</td>
                  <td>{getRoleLabel(user.user_role)}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(user)}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddUser = () => (
    <div className="admin-content-section">
      <h2 className="section-title">Add New User</h2>

      {error && <div className="error-alert">{error}</div>}
      {successMessage && <div className="success-alert">{successMessage}</div>}

      <form onSubmit={handleAddUser} className="add-user-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              placeholder="Enter First Name"
              value={formData.first_name}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              placeholder="Enter Last Name"
              value={formData.last_name}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>TIN Number</label>
            <input
              type="text"
              name="tin"
              placeholder="TIN Number"
              value={formData.tin}
              onChange={handleFormChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ghana ID</label>
            <input
              type="text"
              name="ghana_id"
              placeholder="Enter Ghana ID"
              value={formData.ghana_id}
              onChange={handleFormChange}
            />
          </div>
          <div className="form-group">
            <label>User Role</label>
            <select
              name="user_role"
              value={formData.user_role}
              onChange={handleFormChange}
              required
            >
              <option value="">Select User Role</option>
              {userRoles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleFormChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              name="username"
              placeholder="Enter User ID"
              value={formData.username}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleFormChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add User'}
        </button>
      </form>
    </div>
  );

  const renderManageUser = () => (
    <div className="admin-content-section">
      <div className="section-header">
        <h2 className="section-title">All Users</h2>
        <div className="section-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search sector mappings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <button className="add-user-btn" onClick={() => setActiveMenu('add-user')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}
      {successMessage && <div className="success-alert">{successMessage}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>User Name</th>
              <th>TIN Number</th>
              <th>Ghana ID</th>
              <th>User Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-cell">Loading...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{String(index + 1).padStart(2, '0')}</td>
                  <td>{user.full_name || 'N/A'}</td>
                  <td>{user.tin || 'N/A'}</td>
                  <td>{user.ghana_card_number || 'N/A'}</td>
                  <td>
                    <div className="role-dropdown-cell">
                      <select
                        value={user.user_role || ''}
                        onChange={(e) => handleUpdateUser(user.id, { user_role: e.target.value })}
                        className="role-select"
                      >
                        {userRoles.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(user)}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'user-list':
        return renderUserList();
      case 'add-user':
        return renderAddUser();
      case 'manage-user':
        return renderManageUser();
      default:
        return renderUserList();
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-layout">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
              <div className="admin-logo">
             <img src={logo} alt="" />
              </div>
              <div className="admin-title">
              <img src={sidebar} alt="" />
              </div>
            </div>

            <nav className="admin-nav">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`admin-nav-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  {getIcon(item.icon)}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="admin-sidebar-decoration">
              <div className="admin-circle admin-circle-1"></div>
              <div className="admin-circle admin-circle-2"></div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="admin-main">
            {/* Top Bar */}
            <header className="admin-topbar">
              <h1 className="admin-topbar-title">User Management</h1>
              <div className="admin-topbar-actions">
                <div className="system-status">
                  <span className="status-dot"></span>
                  <span>All Systems Nominal</span>
                </div>
                <button className="logout-btn" onClick={onLogout} title="Logout">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Page Content */}
            <div className="admin-content">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="edit-modal-overlay" onClick={closeEditModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Edit User</h2>
              <button className="modal-close-btn" onClick={closeEditModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {error && <div className="error-alert">{error}</div>}
            {successMessage && <div className="success-alert">{successMessage}</div>}

            <form onSubmit={handleEditSubmit} className="edit-user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Enter First Name"
                    value={editFormData.first_name}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Enter Last Name"
                    value={editFormData.last_name}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>TIN Number</label>
                  <input
                    type="text"
                    name="tin"
                    placeholder="TIN Number"
                    value={editFormData.tin}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ghana ID</label>
                  <input
                    type="text"
                    name="ghana_id"
                    placeholder="Enter Ghana ID"
                    value={editFormData.ghana_id}
                    onChange={handleEditFormChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>User Role</label>
                  <select
                    name="user_role"
                    value={editFormData.user_role}
                    onChange={handleEditFormChange}
                    required
                  >
                    <option value="">Select User Role</option>
                    {userRoles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
