import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { notify } = useNotification();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      notify.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await register({ name, email, phone, password });
    setLoading(false);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '85vh' }}>
      <div className="card p-4 p-md-5 border shadow-sm w-100" style={{ maxWidth: '480px', backgroundColor: 'var(--bg-card)' }}>
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '1.25rem',
              }}
            >
              S
            </div>
          </Link>
          <h3 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            Join ShopSphere
          </h3>
          <p className="text-muted" style={{ fontSize: '0.88rem' }}>
            Create an account to save wishlist items and track shipments
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number (Optional)</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password *</label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control pe-5"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn position-absolute end-0 top-50 translate-middle-y me-1 p-1 border-0 text-muted"
                style={{ background: 'transparent' }}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              <>
                <UserPlus size={18} /> Register Account
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 text-muted" style={{ fontSize: '0.88rem' }}>
          Already have an account?{' '}
          <Link to="/login" className="fw-bold text-decoration-none">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
