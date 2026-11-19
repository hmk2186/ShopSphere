import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Calendar, Percent, DollarSign } from 'lucide-react';
import { couponService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';

const AdminCouponsPage = () => {
  const { notify } = useNotification();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    endDate: '',
    usageLimit: 100,
    perCustomerLimit: 1,
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getAll();
      if (res.success) {
        setCoupons(res.coupons || []);
      }
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    const defaultExp = new Date();
    defaultExp.setDate(defaultExp.getDate() + 30);

    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '15',
      minOrderAmount: '50',
      maxDiscountAmount: '50',
      endDate: defaultExp.toISOString().split('T')[0],
      usageLimit: 100,
      perCustomerLimit: 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingId(c._id);
    setFormData({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '',
      maxDiscountAmount: c.maxDiscountAmount || '',
      endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit || 100,
      perCustomerLimit: c.perCustomerLimit || 1,
      isActive: Boolean(c.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        endDate: formData.endDate,
        usageLimit: Number(formData.usageLimit),
        perCustomerLimit: Number(formData.perCustomerLimit || 1),
        isActive: formData.isActive,
      };

      if (editingId) {
        const res = await couponService.update(editingId, payload);
        if (res.success) notify.success('Coupon updated successfully');
      } else {
        const res = await couponService.create(payload);
        if (res.success) notify.success('Coupon created successfully');
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      notify.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotional coupon?')) return;
    try {
      const res = await couponService.delete(id);
      if (res.success) {
        notify.info('Coupon deleted');
        fetchCoupons();
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom mb-4">
        <div>
          <h3 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            Promotional Coupons
          </h3>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Configure percentage and fixed discount campaigns, limits, and expiration dates
          </span>
        </div>

        <button onClick={openAddModal} className="btn btn-primary d-inline-flex align-items-center gap-2">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="card border shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Min. Spend</th>
                <th>Usage / Limit</th>
                <th>Expires On</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status" />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No active coupons found. Click "Create Coupon" to set up a promotion.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <code className="fw-bold fs-6 text-primary">{c.code}</code>
                    </td>
                    <td>
                      <span className="fw-semibold">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} FLAT`}
                      </span>
                      {c.maxDiscountAmount && (
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          Max: ${c.maxDiscountAmount}
                        </div>
                      )}
                    </td>
                    <td>${c.minOrderAmount || 0}</td>
                    <td>
                      <span className="badge badge-primary">
                        {c.usedCount} / {c.usageLimit}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(c.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <Badge variant={c.isActive ? 'success' : 'danger'}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button onClick={() => openEditModal(c)} className="btn btn-sm p-1 text-primary border-0" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="btn btn-sm p-1 text-danger border-0" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Coupon' : 'Create New Coupon'}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Coupon'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Coupon Code *</label>
              <input
                type="text"
                className="form-control text-uppercase font-monospace"
                placeholder="e.g. SUMMER25"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Discount Type *</label>
              <select
                className="form-select"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Dollar ($)</option>
              </select>
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">Discount Value *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                required
              />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">Min. Order Value ($)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Max. Discount Cap ($)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Optional"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Expiration Date *</label>
              <input
                type="date"
                className="form-control"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Total Usage Limit *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Per-Customer Limit *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.perCustomerLimit}
                onChange={(e) => setFormData({ ...formData, perCustomerLimit: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description / Campaign Purpose</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 25% off sitewide festive celebration"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="col-12 pt-2">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="couponActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label className="form-check-label text-secondary" htmlFor="couponActiveCheck">
                  Active (Allow customers to apply during checkout)
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCouponsPage;
