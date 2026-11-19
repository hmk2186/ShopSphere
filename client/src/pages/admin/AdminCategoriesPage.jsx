import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';
import { categoryService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';

const AdminCategoriesPage = () => {
  const { notify } = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isFeatured: false,
    displayOrder: 0,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      isFeatured: false,
      displayOrder: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.image?.url || '',
      isFeatured: Boolean(cat.isFeatured),
      displayOrder: cat.displayOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingId) {
        const res = await categoryService.update(editingId, formData);
        if (res.success) notify.success('Category updated successfully');
      } else {
        const res = await categoryService.create(formData);
        if (res.success) notify.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      notify.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await categoryService.delete(id);
      if (res.success) {
        notify.info('Category deleted');
        fetchCategories();
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
            Category Taxonomy
          </h3>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Structure store navigation, classifications, and visual banners
          </span>
        </div>

        <button onClick={openAddModal} className="btn btn-primary d-inline-flex align-items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="card border shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Products</th>
                <th>Featured</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status" />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No categories registered yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={cat.image?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                          alt={cat.name}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <code className="text-primary">{cat.slug}</code>
                    </td>
                    <td className="text-muted text-truncate" style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                      {cat.description || '—'}
                    </td>
                    <td>
                      <span className="badge badge-primary">{cat.productCount || 0} items</span>
                    </td>
                    <td>
                      {cat.isFeatured ? (
                        <span className="badge badge-success">Featured</span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Standard</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button onClick={() => openEditModal(cat)} className="btn btn-sm p-1 text-primary border-0" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="btn btn-sm p-1 text-danger border-0" title="Delete">
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

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Create New Category'}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Category Visual Image URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Display Order Sequence</label>
            <input
              type="number"
              className="form-control"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
            />
          </div>

          <div className="form-check pt-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="catFeaturedCheck"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            />
            <label className="form-check-label text-secondary" htmlFor="catFeaturedCheck">
              Display on Homepage Featured Categories Carousel
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
