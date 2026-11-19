import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);
    if (res.success) {
      if (res.user?.role === 'admin' && from === '/') {
        navigate('/admin/dashboard');
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  const autofillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div
      className="container py-5 d-flex align-items-center justify-content-center"
      style={{ minHeight: '80vh' }}
    >
      <div className="card p-4 p-md-5 border shadow-sm w-100" style={{ maxWidth: '460px', backgroundColor: 'var(--bg-card)' }}>
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
            Welcome to ShopSphere
          </h3>
          <p className="text-muted" style={{ fontSize: '0.88rem' }}>
            Enter your credentials to access your account
          </p>
        </div>

        {/* Quick Demo Autofill Pills */}
        <div className="p-3 rounded-3 mb-4 border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
          <span className="text-muted fw-semibold d-block mb-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Instant Demo Logins:
          </span>
          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={() => autofillDemo('admin@shopsphere.com', 'Admin@12345')}
              className="btn btn-sm btn-outline-primary flex-grow-1"
              style={{ fontSize: '0.8rem' }}
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('customer@example.com', 'Customer@12345')}
              className="btn btn-sm btn-outline-secondary flex-grow-1"
              style={{ fontSize: '0.8rem' }}
            >
              Customer Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <div className="position-relative">
              <input
                type="email"
                className="form-control ps-4"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0">Password</label>
              <Link to="/forgot-password" className="text-decoration-none" style={{ fontSize: '0.8rem' }}>
                Forgot Password?
              </Link>
            </div>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control pe-5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn position-absolute end-0 top-50 translate-middle-y me-1 p-1 border-0 text-muted"
                style={{ background: 'transparent' }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 mt-4"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 text-muted" style={{ fontSize: '0.88rem' }}>
          Don't have an account yet?{' '}
          <Link to="/register" className="fw-bold text-decoration-none">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
