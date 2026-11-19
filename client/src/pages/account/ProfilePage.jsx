import React, { useState } from 'react';
import { User, Lock, Phone, Mail, Save, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { notify } = useNotification();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar?.url || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({ name, phone, avatarUrl });
    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notify.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      notify.error('New password must be at least 6 characters');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        notify.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-5 py-3" style={{ maxWidth: '960px' }}>
      <Breadcrumbs items={[{ label: 'My Account' }, { label: 'Profile' }]} />

      <h2 className="fw-extrabold pb-3 border-bottom mb-4" style={{ color: 'var(--text-primary)' }}>
        Account Settings
      </h2>

      <div className="row g-4">
        {/* Left Column: Personal Profile Details */}
        <div className="col-12 col-md-6">
          <div className="card p-4 border h-100" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <User size={20} className="text-primary" />
              <h5 className="fw-bold mb-0">Personal Profile</h5>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="text-center mb-4">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={name}
                  className="rounded-circle shadow-sm mb-2"
                  style={{ width: '90px', height: '90px', objectFit: 'cover', border: '3px solid var(--color-primary)' }}
                />
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Profile Avatar</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  style={{ backgroundColor: 'var(--bg-subtle)', opacity: 0.8 }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              >
                <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security & Password Update */}
        <div className="col-12 col-md-6">
          <div className="card p-4 border h-100" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <Lock size={20} className="text-primary" />
              <h5 className="fw-bold mb-0">Security & Password</h5>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="btn btn-outline-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              >
                <KeyRound size={16} /> {savingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
