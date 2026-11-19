import React, { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX, ShoppingBag, Eye } from 'lucide-react';
import { adminService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const AdminCustomersPage = () => {
  const { notify } = useNotification();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Customer Orders Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllCustomers({
        search,
        page: currentPage,
        limit: 10,
      });

      if (res.success) {
        setCustomers(res.customers || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, search]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await adminService.toggleCustomerStatus(id);
      if (res.success) {
        notify.success(res.message);
        fetchCustomers();
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  const handleViewOrders = async (customer) => {
    try {
      setSelectedCustomer(customer);
      setOrdersLoading(true);
      const res = await adminService.getCustomerOrders(customer._id);
      if (res.success) {
        setCustomerOrders(res.orders || []);
      }
    } catch (error) {
      notify.error(error.message || 'Failed to load customer orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom mb-4">
        <div>
          <h3 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            Customer Directory
          </h3>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Registered buyer profiles, lifetime spend, and account access permissions
          </span>
        </div>
      </div>

      {/* Search Header */}
      <div className="card p-3 mb-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="position-relative" style={{ maxWidth: '380px' }}>
          <input
            type="text"
            className="form-control form-control-sm ps-4"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search size={14} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card border shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Orders Placed</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th className="text-end">Access Control</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No matching customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={c.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={c.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                            {c.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            ID: {c._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.88rem' }}>{c.email}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{c.phone || 'No phone'}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <span className="badge badge-primary">{c.orderCount || 0} orders</span>
                    </td>
                    <td className="fw-bold text-primary">${(c.totalSpent || 0).toFixed(2)}</td>
                    <td>
                      <Badge variant={c.isActive ? 'success' : 'danger'}>
                        {c.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          onClick={() => handleViewOrders(c)}
                          className="btn btn-sm btn-outline-primary py-1 px-2 d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.78rem' }}
                          title="View Order History"
                        >
                          <Eye size={13} /> Orders
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c._id, c.isActive)}
                          className={`btn btn-sm ${c.isActive ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2`}
                          style={{ fontSize: '0.78rem' }}
                        >
                          {c.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-top">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Customer Orders History Modal */}
      <Modal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={`Orders by ${selectedCustomer?.name}`}
        size="lg"
        footer={
          <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>
            Close
          </button>
        }
      >
        {ordersLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : customerOrders.length === 0 ? (
          <div className="text-center py-4 text-muted">
            This customer has not placed any orders yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <strong className="text-primary">{ord.orderNumber}</strong>
                    </td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td>{ord.items?.length || 0} items</td>
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
                    <td className="fw-bold">${(ord.pricing?.totalAmount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCustomersPage;
