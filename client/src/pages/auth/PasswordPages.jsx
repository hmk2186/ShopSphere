import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        notify.success('Password reset instructions generated.');
        if (res.devResetToken) {
          setDevToken(res.devResetToken);
        }
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
      <div className="card p-4 p-md-5 border shadow-sm w-100" style={{ maxWidth: '440px', backgroundColor: 'var(--bg-card)' }}>
        <h3 className="fw-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
          Recover Password
        </h3>
        <p className="text-muted mb-4" style={{ fontSize: '0.88rem' }}>
          Enter your registered email address and we will provide your security reset token.
        </p>

        {devToken && (
          <div className="alert alert-info p-3 mb-3" style={{ fontSize: '0.82rem' }}>
            <strong>Dev Mode Token:</strong>
            <div className="font-monospace text-break mt-1">{devToken}</div>
            <Link
              to={`/reset-password?token=${devToken}`}
              className="btn btn-sm btn-primary w-100 mt-2"
            >
              Proceed to Reset Password
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-100 py-2 fw-bold">
            {loading ? 'Sending Request...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-decoration-none text-muted d-inline-flex align-items-center gap-1" style={{ fontSize: '0.85rem' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [token, setToken] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({ token, newPassword });
      if (res.success) {
        notify.success('Password has been reset! Please sign in with your new credentials.');
        navigate('/login');
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
      <div className="card p-4 p-md-5 border shadow-sm w-100" style={{ maxWidth: '440px', backgroundColor: 'var(--bg-card)' }}>
        <h3 className="fw-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
          Set New Password
        </h3>
        <p className="text-muted mb-4" style={{ fontSize: '0.88rem' }}>
          Please choose a strong password with at least 6 characters.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Security Reset Token</label>
            <input
              type="text"
              className="form-control font-monospace"
              placeholder="Paste token here"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
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
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-100 py-2 fw-bold">
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
