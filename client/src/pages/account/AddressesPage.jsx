import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { addressService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Modal from '../../components/common/Modal';

const AddressesPage = () => {
  const { notify } = useNotification();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
    addressType: 'home',
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressService.getAll();
      if (res.success) {
        setAddresses(res.addresses || []);
      }
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingAddressId(null);
    setFormData({
      fullName: '',
      phone: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      isDefault: false,
      addressType: 'home',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingAddressId(addr._id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
      addressType: addr.addressType,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        const res = await addressService.update(editingAddressId, formData);
        if (res.success) notify.success('Address updated!');
      } else {
        const res = await addressService.create(formData);
        if (res.success) notify.success('Address added!');
      }
      setIsModalOpen(false);
      fetchAddresses();
    } catch (error) {
      notify.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await addressService.delete(id);
      if (res.success) {
        notify.info('Address removed');
        fetchAddresses();
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await addressService.setDefault(id);
      if (res.success) {
        notify.success('Default address updated');
        fetchAddresses();
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-5 py-3">
      <Breadcrumbs items={[{ label: 'My Account', link: '/account/profile' }, { label: 'Saved Addresses' }]} />

      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
        <div>
          <h2 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            Saved Addresses
          </h2>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Manage delivery locations for quick, effortless checkout
          </span>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary d-inline-flex align-items-center gap-2">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="card p-5 text-center border" style={{ backgroundColor: 'var(--bg-card)' }}>
          <MapPin size={40} className="mx-auto text-primary mb-3" />
          <h5 className="fw-bold">No Delivery Addresses Found</h5>
          <p className="text-muted mb-3">Add your residential or office address to expedite future orders.</p>
          <button onClick={openCreateModal} className="btn btn-primary mx-auto">
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="col-12 col-md-6 col-lg-4">
              <div
                className={`card p-4 h-100 border position-relative ${addr.isDefault ? 'border-primary' : ''}`}
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold fs-6" style={{ color: 'var(--text-primary)' }}>
                    {addr.fullName}
                  </span>
                  <div className="d-flex align-items-center gap-1">
                    <span className="badge badge-primary text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-secondary flex-grow-1 mb-3" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {addr.street}
                  {addr.landmark && `, ${addr.landmark}`}
                  <br />
                  {addr.city}, {addr.state} {addr.postalCode}
                  <br />
                  {addr.country}
                  <div className="text-muted mt-2">Phone: {addr.phone}</div>
                </div>

                <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="btn btn-sm btn-link p-0 text-decoration-none text-muted"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-success fw-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                      <CheckCircle2 size={14} /> Active Default
                    </span>
                  )}

                  <div className="d-flex gap-1">
                    <button onClick={() => openEditModal(addr)} className="btn btn-sm p-1 text-primary border-0" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(addr._id)} className="btn btn-sm p-1 text-danger border-0" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddressId ? 'Edit Address' : 'Add New Address'}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Save Address
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-control"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Landmark (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-control"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">State / Province *</label>
              <input
                type="text"
                className="form-control"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Zip / Postal Code *</label>
              <input
                type="text"
                className="form-control"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Address Tag</label>
              <select
                className="form-select"
                value={formData.addressType}
                onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
              >
                <option value="home">Home</option>
                <option value="work">Work / Office</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-12 col-md-6 d-flex align-items-center pt-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isDefaultCheck"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                <label className="form-check-label text-secondary" htmlFor="isDefaultCheck" style={{ fontSize: '0.88rem' }}>
                  Make this my default address
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddressesPage;
