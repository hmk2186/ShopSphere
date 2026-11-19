import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  ChevronRight,
  Shield,
  Bell,
  Search,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Route title mapper
  const getSectionTitle = (path) => {
    if (path.includes('/products')) return 'Product Inventory';
    if (path.includes('/categories')) return 'Category Taxonomy';
    if (path.includes('/orders')) return 'Order Fulfillment';
    if (path.includes('/customers')) return 'Customer Directory';
    if (path.includes('/coupons')) return 'Promotional Coupons';
    if (path.includes('/reviews')) return 'Review Moderation';
    if (path.includes('/inventory')) return 'Inventory Stock Levels';
    if (path.includes('/settings')) return 'System Settings';
    return 'Analytics & Overview';
  };

  const currentTitle = getSectionTitle(location.pathname);

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Dynamic CSS styles for the admin layout and sidebar */}
      <style>{`
        /* Sidebar desktop docking & transitions */
        .admin-sidebar {
          transform: translateX(-100%);
        }

        @media (min-width: 992px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          .admin-main-container {
            margin-left: ${isCollapsed ? '76px' : '260px'} !important;
          }
        }

        .admin-sidebar.mobile-open {
          transform: translateX(0) !important;
        }

        /* Active Nav Link Styling with Cobalt & Tangerine Touch */
        .admin-nav-link.active {
          background: linear-gradient(135deg, var(--color-primary), #254BC5) !important;
          color: #FFFFFF !important;
          box-shadow: 0 4px 12px rgba(49, 95, 234, 0.28);
        }

        .admin-nav-link.active .admin-nav-icon,
        .admin-nav-link.active svg {
          color: #FFFFFF !important;
        }

        .admin-nav-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .admin-nav-scroll::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 4px;
        }
      `}</style>

      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
      />

      {/* Main Admin Content Container */}
      <div
        className="admin-main-container flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: 0,
          transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          minWidth: 0,
        }}
      >
        {/* Top Header Bar */}
        <header
          className="d-flex align-items-center justify-content-between px-3 px-lg-4 py-2 border-bottom"
          style={{
            height: '65px',
            backgroundColor: 'var(--bg-header)',
            backdropFilter: 'blur(8px)',
            borderColor: 'var(--border-color)',
            position: 'sticky',
            top: 0,
            zIndex: 1020,
          }}
        >
          {/* Left Controls & Current Title */}
          <div className="d-flex align-items-center gap-3">
            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn btn-sm p-1 border-0 text-muted d-lg-none"
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            {/* Desktop Collapse / Expand Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="btn btn-sm p-1 border-0 text-muted d-none d-lg-inline-flex align-items-center"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>

            {/* Breadcrumb Section Indicator */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted d-none d-md-inline" style={{ fontSize: '0.82rem' }}>
                Admin
              </span>
              <ChevronRight size={14} className="text-muted d-none d-md-inline" />
              <h5
                className="mb-0 fw-bold"
                style={{ fontSize: '1rem', color: 'var(--text-primary)' }}
              >
                {currentTitle}
              </h5>
            </div>
          </div>

          {/* Right Controls */}
          <div className="d-flex align-items-center gap-2 gap-sm-3">
            {/* View Storefront Pill Button */}
            <Link
              to="/"
              className="btn btn-sm btn-outline-primary d-none d-sm-inline-flex align-items-center gap-1 py-1 px-3 rounded-pill"
              style={{ fontSize: '0.8rem' }}
            >
              <ExternalLink size={13} /> Storefront
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Admin User Status Pill */}
            <div
              className="d-flex align-items-center gap-2 py-1 px-2 rounded-pill border"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
            >
              <img
                src={
                  user?.avatar?.url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                }
                alt={user?.name || 'Admin'}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span
                className="fw-bold d-none d-md-inline text-truncate"
                style={{ fontSize: '0.82rem', maxWidth: '120px', color: 'var(--text-primary)' }}
              >
                {user?.name?.split(' ')[0] || 'Admin'}
              </span>
              <span
                className="badge rounded-pill bg-success-subtle text-success d-none d-md-inline"
                style={{ fontSize: '0.62rem' }}
              >
                LIVE
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Routed Page Content */}
        <main className="p-3 p-lg-4 flex-grow-1" style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
