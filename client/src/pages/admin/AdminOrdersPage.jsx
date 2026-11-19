import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Eye, CheckCircle, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const AdminOrdersPage = () => {
  const { notify } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllOrders({
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        limit: 10,
      });

      if (res.success) {
        setOrders(res.orders || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, search, statusFilter]);

  const openUpdateModal = (ord) => {
    setSelectedOrder(ord);
    setNewStatus(ord.orderStatus);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const res = await adminService.updateOrderStatus(selectedOrder._id, newStatus, statusNote);
      if (res.success) {
        notify.success(`Order ${selectedOrder.orderNumber} updated to ${newStatus}`);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom mb-4">
        <div>
          <h3 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            Fulfillment & Order Control
          </h3>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Track, update shipping lifecycle, and inspect customer transactions
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 mb-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-sm ps-4"
                placeholder="Search by order number or customer name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Search size={14} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
            </div>
          </div>

          <div className="col-12 col-md-6 d-flex justify-content-md-end gap-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card border shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer & Address</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
                <th className="text-end">Manage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <strong className="text-primary">{ord.orderNumber}</strong>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold">{ord.shippingAddress?.fullName || ord.user?.name}</div>
                      <div className="text-muted text-truncate" style={{ maxWidth: '220px', fontSize: '0.75rem' }}>
                        {ord.shippingAddress?.street}, {ord.shippingAddress?.city}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{ord.items?.length || 0} items</span>
                    </td>
                    <td>
                      <span className="text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
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
                    <td className="fw-bold">${ord.pricing?.totalAmount.toFixed(2)}</td>
                    <td className="text-end">
                      <button
                        onClick={() => openUpdateModal(ord)}
                        className="btn btn-sm btn-primary py-1 px-2"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Update Status
                      </button>
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

      {/* Status Update Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Fulfill Order: ${selectedOrder?.orderNumber}`}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setSelectedOrder(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={updating}>
              {updating ? 'Updating...' : 'Commit Status'}
            </button>
          </>
        }
      >
        {selectedOrder && (
          <form onSubmit={handleUpdateStatus}>
            <div className="mb-3">
              <label className="form-label">Order Fulfillment Stage</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Pending">Pending (Awaiting Confirmation)</option>
                <option value="Confirmed">Confirmed (Payment / COD Approved)</option>
                <option value="Processing">Processing (Packaging in Hub)</option>
                <option value="Shipped">Shipped (Dispatched with Courier)</option>
                <option value="Out for Delivery">Out for Delivery (With Delivery Agent)</option>
                <option value="Delivered">Delivered (Handed to Customer)</option>
                <option value="Cancelled">Cancelled (Restores Inventory)</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Audit / Shipping Note</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Carrier tracking assigned #TRK-98432-FEDEX"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                This note will be displayed in the customer's visual order tracking timeline.
              </span>
            </div>

            {/* Item details summary */}
            <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Order Line Items</h6>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="d-flex justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
                  <span>{it.name} (x{it.quantity})</span>
                  <strong>${it.subtotal.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
