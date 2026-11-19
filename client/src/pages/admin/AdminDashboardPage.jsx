import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Clock,
  Boxes,
  Plus,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { adminService } from '../../services/api';
import StatCard from '../../components/admin/StatCard';
import RevenueChart from '../../components/admin/RevenueChart';
import OrdersChart from '../../components/admin/OrdersChart';
import CategoryPieChart from '../../components/admin/CategoryPieChart';
import Badge from '../../components/common/Badge';

const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setDashboardData(res);
        }
      } catch (err) {
        console.warn('[Admin Dashboard] Failed to load statistics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const {
    stats = {},
    revenueTrends = [],
    categorySales = [],
    recentOrders = [],
    lowStockProducts = [],
    topProducts = [],
    recentCustomers = [],
  } = dashboardData;

  return (
    <div>
      {/* 1. Header with Overview & Quick Actions */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-3 border-bottom mb-4 gap-3">
        <div>
          <h3 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            Analytics & Operations Dashboard
          </h3>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Real-time performance metrics, inventory health, and live customer transactions
          </span>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <Link to="/admin/products" className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1">
            <Plus size={15} /> Add Product
          </Link>
          <Link to="/admin/orders" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
            <ShoppingBag size={15} /> Orders
          </Link>
          <Link to="/admin/inventory" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
            <Boxes size={15} /> Inventory
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Total Revenue"
            value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
            icon={<DollarSign size={20} />}
            change="Realized sales"
            isPositive={true}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Total Orders"
            value={(stats.totalOrders || 0).toLocaleString()}
            icon={<ShoppingBag size={20} />}
            change="All-time volume"
            isPositive={true}
            color="secondary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Active Catalog"
            value={(stats.totalProducts || 0).toLocaleString()}
            icon={<Package size={20} />}
            change="Live products"
            isPositive={true}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Customers"
            value={(stats.totalCustomers || 0).toLocaleString()}
            icon={<Users size={20} />}
            change="Registered buyers"
            isPositive={true}
            color="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Pending Orders"
            value={(stats.pendingOrders || 0).toLocaleString()}
            icon={<Clock size={20} />}
            change={stats.pendingOrders > 0 ? 'Fulfillment queued' : 'Cleared'}
            isPositive={stats.pendingOrders === 0}
            color={stats.pendingOrders > 0 ? 'warning' : 'success'}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Low Stock"
            value={(stats.lowStockCount || 0).toLocaleString()}
            icon={<AlertTriangle size={20} />}
            change={stats.lowStockCount > 0 ? 'Restock required' : 'Stock healthy'}
            isPositive={stats.lowStockCount === 0}
            color={stats.lowStockCount > 0 ? 'warning' : 'success'}
          />
        </div>
      </div>

      {/* 3. Recharts Analytics Visualizations */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <RevenueChart data={revenueTrends || []} />
        </div>
        <div className="col-12 col-lg-4">
          <CategoryPieChart data={categorySales || []} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <OrdersChart data={revenueTrends || []} />
        </div>

        {/* Low Stock Watchlist */}
        <div className="col-12 col-lg-6">
          <div
            className="card p-4 border shadow-sm h-100"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                  Inventory Health Alerts
                </h6>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Items with 5 or fewer units remaining
                </span>
              </div>
              <Link to="/admin/inventory" className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.78rem' }}>
                Manage Stock
              </Link>
            </div>

            {lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {lowStockProducts.map((prod) => (
                  <div
                    key={prod._id}
                    className="d-flex align-items-center justify-content-between p-2 rounded"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <img
                        src={
                          prod.images?.[0]?.url ||
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'
                        }
                        alt={prod.name}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div className="text-truncate">
                        <div className="fw-bold text-truncate" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {prod.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          SKU: {prod.sku || 'N/A'} • ${prod.price}
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-warning text-nowrap">
                      {prod.stock} units left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                All inventory quantities are above safety threshold.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Top Selling Products & Recent Registered Customers */}
      <div className="row g-4 mb-4">
        {/* Top Selling Products */}
        <div className="col-12 col-lg-6">
          <div
            className="card p-4 border shadow-sm h-100"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                  Top Selling Products
                </h6>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Best performers by total units ordered
                </span>
              </div>
              <Link to="/admin/products" className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.78rem' }}>
                All Products
              </Link>
            </div>

            {topProducts && topProducts.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {topProducts.map((p, idx) => (
                  <div
                    key={p._id || idx}
                    className="d-flex align-items-center justify-content-between p-2 rounded"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <span className="fw-extrabold text-muted px-1" style={{ fontSize: '0.85rem' }}>
                        #{idx + 1}
                      </span>
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                      )}
                      <div className="text-truncate">
                        <div className="fw-bold text-truncate" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {p.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          ${(p.price || 0).toFixed(2)} / unit
                        </div>
                      </div>
                    </div>

                    <div className="text-end text-nowrap">
                      <div className="fw-bold" style={{ fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                        {p.unitsSold} sold
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        ${(p.totalRevenue || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                No product sales records registered yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Registered Customers */}
        <div className="col-12 col-lg-6">
          <div
            className="card p-4 border shadow-sm h-100"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                  Recent Registered Customers
                </h6>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Newly registered customer accounts
                </span>
              </div>
              <Link to="/admin/customers" className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.78rem' }}>
                All Customers
              </Link>
            </div>

            {recentCustomers && recentCustomers.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {recentCustomers.map((cust) => (
                  <div
                    key={cust._id}
                    className="d-flex align-items-center justify-content-between p-2 rounded"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <img
                        src={
                          cust.avatar?.url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                        }
                        alt={cust.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div className="text-truncate">
                        <div className="fw-bold text-truncate" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {cust.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {cust.email}
                        </div>
                      </div>
                    </div>

                    <span className={`badge ${cust.isActive ? 'badge-success' : 'badge-danger'} text-nowrap`}>
                      {cust.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                No customer signups yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Recent Orders Table */}
      <div
        className="card p-4 border shadow-sm"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
              Recent Customer Transactions
            </h5>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              Latest orders placed across all categories
            </span>
          </div>
          <Link to="/admin/orders" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <strong className="text-primary">{ord.orderNumber}</strong>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium" style={{ color: 'var(--text-primary)' }}>
                        {ord.shippingAddress?.fullName || ord.user?.name}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {ord.user?.email}
                      </div>
                    </td>
                    <td>
                      <span className="text-uppercase fw-semibold" style={{ fontSize: '0.78rem' }}>
                        {ord.paymentMethod} •{' '}
                        <span className={ord.paymentStatus === 'completed' ? 'text-success' : 'text-warning'}>
                          {ord.paymentStatus}
                        </span>
                      </span>
                    </td>
                    <td>
                      <Badge
                        variant={
                          ord.orderStatus === 'Delivered'
                            ? 'success'
                            : ord.orderStatus === 'Cancelled'
                            ? 'danger'
                            : 'primary'
                        }
                      >
                        {ord.orderStatus}
                      </Badge>
                    </td>
                    <td className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                      ${(ord.pricing?.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/admin/orders`}
                        className="btn btn-sm btn-outline-secondary py-1 px-2"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Fulfill
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-3 text-muted">
                    No orders registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
