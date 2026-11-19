import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Boxes,
  Settings,
  ExternalLink,
  LogOut,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

const AdminSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navSections = [
    {
      title: 'Analytics',
      items: [
        { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/admin/dashboard' },
      ],
    },
    {
      title: 'Catalog & Stock',
      items: [
        { label: 'Products', icon: <Package size={18} />, to: '/admin/products' },
        { label: 'Categories', icon: <Layers size={18} />, to: '/admin/categories' },
        { label: 'Inventory', icon: <Boxes size={18} />, to: '/admin/inventory' },
      ],
    },
    {
      title: 'Sales & Buyers',
      items: [
        { label: 'Orders', icon: <ShoppingBag size={18} />, to: '/admin/orders' },
        { label: 'Customers', icon: <Users size={18} />, to: '/admin/customers' },
        { label: 'Coupons', icon: <Tag size={18} />, to: '/admin/coupons' },
        { label: 'Reviews', icon: <Star size={18} />, to: '/admin/reviews' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Settings', icon: <Settings size={18} />, to: '/admin/settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop d-lg-none"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1040,
          }}
          onClick={onClose}
        />
      )}

      <aside
        className={`admin-sidebar ${isOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          width: isCollapsed ? '76px' : '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1045,
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s ease',
        }}
      >
        {/* Brand Header */}
        <div
          className="p-3 border-bottom d-flex align-items-center justify-content-between"
          style={{ height: '65px', borderColor: 'var(--border-color)' }}
        >
          <Link
            to="/admin/dashboard"
            className="d-flex align-items-center gap-2 text-decoration-none text-truncate"
            title="ShopSphere Admin Hub"
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(49, 95, 234, 0.25)',
              }}
            >
              S
            </div>
            {!isCollapsed && (
              <div className="text-truncate">
                <div className="fw-extrabold brand-font lh-1" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                  ShopSphere
                </div>
                <div className="d-flex align-items-center gap-1 mt-1">
                  <span
                    className="badge badge-primary px-1 py-0 fw-bold"
                    style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}
                  >
                    ADMIN CONSOLE
                  </span>
                </div>
              </div>
            )}
          </Link>

          <button
            onClick={onClose}
            className="btn btn-sm p-1 border-0 text-muted d-lg-none"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="p-2 flex-grow-1 overflow-auto admin-nav-scroll">
          {navSections.map((sec, idx) => (
            <div key={idx} className="mb-3">
              {!isCollapsed && (
                <div
                  className="text-uppercase text-muted fw-bold px-3 py-1 mb-1"
                  style={{ fontSize: '0.66rem', letterSpacing: '0.08em' }}
                >
                  {sec.title}
                </div>
              )}
              {isCollapsed && <div className="border-top my-2 mx-2" style={{ borderColor: 'var(--border-subtle)' }} />}

              <nav className="d-flex flex-column gap-1">
                {sec.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium admin-nav-link ${
                        isActive ? 'active' : 'text-secondary hover-bg-subtle'
                      } ${isCollapsed ? 'justify-content-center px-0' : ''}`
                    }
                    style={{
                      fontSize: '0.88rem',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="admin-nav-icon d-flex align-items-center">{item.icon}</span>
                    {!isCollapsed && <span className="text-truncate flex-grow-1">{item.label}</span>}
                    {!isCollapsed && location.pathname === item.to && (
                      <ChevronRight size={14} className="opacity-75" />
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}

          {/* Quick Storefront Shortcut */}
          <div className="mt-2 pt-2 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
            {!isCollapsed && (
              <div
                className="text-uppercase text-muted fw-bold px-3 py-1 mb-1"
                style={{ fontSize: '0.66rem', letterSpacing: '0.08em' }}
              >
                External
              </div>
            )}
            <Link
              to="/"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none text-muted hover-bg-subtle ${
                isCollapsed ? 'justify-content-center px-0' : ''
              }`}
              style={{ fontSize: '0.88rem' }}
              title="Customer Storefront"
            >
              <ExternalLink size={18} />
              {!isCollapsed && <span>View Storefront</span>}
            </Link>
          </div>
        </div>

        {/* User Footer Profile */}
        <div
          className="p-3 border-top mt-auto"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-color)',
            minHeight: '68px',
          }}
        >
          <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center' : 'justify-content-between'}`}>
            <div className="d-flex align-items-center gap-2 text-truncate">
              <img
                src={
                  user?.avatar?.url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                }
                alt={user?.name || 'Admin'}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-primary)',
                  flexShrink: 0,
                }}
              />
              {!isCollapsed && (
                <div className="text-truncate">
                  <div
                    className="fw-bold text-truncate"
                    style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}
                  >
                    {user?.name || 'Administrator'}
                  </div>
                  <div
                    className="text-muted d-flex align-items-center gap-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Shield size={11} className="text-primary" /> Super Admin
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn btn-sm p-1 text-danger border-0 rounded"
                title="Logout from Admin Hub"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
