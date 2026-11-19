import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Moon,
  Sun,
  Store,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Mail,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/api';

const AdminSettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { notify } = useNotification();

  // Profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Store settings (presentation / operational settings)
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'ShopSphere Marketplace',
    supportEmail: 'support@shopsphere.com',
    currency: 'USD ($)',
    lowStockThreshold: 5,
    enableReviews: true,
    enableGuestCheckout: false,
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      notify.error('Admin name cannot be empty');
      return;
    }

    try {
      setUpdatingProfile(true);
      const res = await authService.updateProfile({ name: profileName.trim() });
      if (res.success) {
        if (updateProfile) updateProfile(res.user);
        notify.success('Profile updated successfully');
      }
    } catch (err) {
      notify.error(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      notify.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      notify.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify.error('New passwords do not match');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        notify.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      notify.error(err.message || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSaveStorePreferences = (e) => {
    e.preventDefault();
    notify.success('Store operational preferences saved');
  };

  return (
    <div>
      {/* Header */}
      <div className="pb-3 border-bottom mb-4">
        <h3 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
          System & Account Settings
        </h3>
        <span className="text-muted" style={{ fontSize: '0.88rem' }}>
          Configure admin credentials, system appearance, security protocols, and marketplace preferences
        </span>
      </div>

      <div className="row g-4">
        {/* Left Column: Admin Profile & Theme */}
        <div className="col-12 col-lg-6">
          {/* Admin Profile Overview */}
          <div
            className="card p-4 border shadow-sm mb-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <img
                src={
                  user?.avatar?.url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={user?.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-primary)',
                }}
              />
              <div>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {user?.name || 'Administrator'}
                </h5>
                <div className="text-muted d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                  <Mail size={14} /> {user?.email}
                </div>
                <div className="mt-1">
                  <span className="badge badge-primary px-2 py-1" style={{ fontSize: '0.7rem' }}>
                    Super Admin Console
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <User size={16} className="text-primary" /> Edit Administrator Profile
              </h6>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter administrator name"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  style={{ opacity: 0.7 }}
                />
                <div className="form-text" style={{ fontSize: '0.75rem' }}>
                  Email address is linked to system authentication and cannot be changed here.
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary d-inline-flex align-items-center gap-2"
                disabled={updatingProfile}
              >
                {updatingProfile ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <Save size={16} />
                )}
                Update Profile
              </button>
            </form>
          </div>

          {/* Theme & Display Preferences */}
          <div
            className="card p-4 border shadow-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Sliders size={16} className="text-primary" /> Theme & Interface Appearance
            </h6>
            <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
              Switch between Light Mode and Dark Mode for the entire ShopSphere console and storefront.
            </p>

            <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="p-2 rounded-circle"
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 138, 53, 0.15)' : 'rgba(49, 95, 234, 0.15)',
                    color: isDark ? 'var(--color-secondary)' : 'var(--color-primary)',
                  }}
                >
                  {isDark ? <Moon size={22} /> : <Sun size={22} />}
                </div>
                <div>
                  <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                    Current Mode: {isDark ? 'Dark Mode' : 'Light Mode'}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                    {isDark ? 'Deep Obsidian theme (#151C32)' : 'Clean Cobalt theme (#FFFFFF)'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-sm btn-outline-primary fw-medium"
              >
                Switch to {isDark ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Password & Store Information */}
        <div className="col-12 col-lg-6">
          {/* Security & Password */}
          <div
            className="card p-4 border shadow-sm mb-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Shield size={16} className="text-primary" /> Security & Password Management
            </h6>

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  Current Password *
                </label>
                <div className="position-relative">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  New Password *
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 6 characters with mixed characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-danger d-inline-flex align-items-center gap-2"
                disabled={updatingPassword}
              >
                {updatingPassword ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <Key size={16} />
                )}
                Change Password
              </button>
            </form>
          </div>

          {/* Store Information & Platform Metadata */}
          <div
            className="card p-4 border shadow-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Store size={16} className="text-primary" /> Store Information & Platform Details
            </h6>

            <div className="d-flex flex-column gap-2 mb-4">
              <div className="d-flex justify-content-between p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Marketplace Name</span>
                <span className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  ShopSphere Premium
                </span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Brand Theme</span>
                <span className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                  Cobalt (#315FEA) & Tangerine (#FF8A35)
                </span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Default Currency</span>
                <span className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  USD ($)
                </span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Low Stock Safety Threshold</span>
                <span className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  5 Units
                </span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Architecture</span>
                <span className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  MERN Stack (Vite + React + Express + MongoDB)
                </span>
              </div>
              <div className="d-flex justify-content-between p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Container Policy</span>
                <span className="badge badge-success" style={{ alignSelf: 'center' }}>
                  Docker-Free Direct Node.js Runtime
                </span>
              </div>
            </div>

            <div className="p-3 rounded border border-success-subtle bg-success-subtle text-success d-flex align-items-center gap-2" style={{ fontSize: '0.82rem' }}>
              <CheckCircle2 size={16} /> All system services, security guards, and database connections are operational.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
