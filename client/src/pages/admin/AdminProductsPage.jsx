import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  Sparkles,
  Flame,
} from 'lucide-react';
import { productService, categoryService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const AdminProductsPage = () => {
  const { notify } = useNotification();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: 'ShopSphere',
    category: '',
    price: '',
    discountPrice: '',
    stock: '',
    shortDescription: '',
    description: '',
    imageUrl: '',
    isFeatured: false,
    isTrending: false,
    isNewArrival: true,
    specifications: [{ key: '', value: '' }],
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll({
        search,
        page: currentPage,
        limit: 10,
      });
      if (res.success) {
        setProducts(res.products || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.success) setCategories(res.categories || []);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      brand: 'ShopSphere',
      category: categories[0]?._id || '',
      price: '',
      discountPrice: '',
      stock: '20',
      shortDescription: '',
      description: '',
      imageUrl: '',
      isFeatured: false,
      isTrending: false,
      isNewArrival: true,
      specifications: [{ key: '', value: '' }],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingId(p._id);
    setFormData({
      name: p.name,
      brand: p.brand || 'ShopSphere',
      category: p.category?._id || p.category || '',
      price: p.price,
      discountPrice: p.discountPrice || '',
      stock: p.stock,
      shortDescription: p.shortDescription || '',
      description: p.description,
      imageUrl: p.images?.[0]?.url || '',
      isFeatured: Boolean(p.isFeatured),
      isTrending: Boolean(p.isTrending),
      isNewArrival: Boolean(p.isNewArrival),
      specifications:
        p.specifications && p.specifications.length > 0
          ? p.specifications
          : [{ key: '', value: '' }],
    });
    setIsModalOpen(true);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...formData.specifications];
    updated[index][field] = value;
    setFormData({ ...formData, specifications: updated });
  };

  const addSpecRow = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: '', value: '' }],
    });
  };

  const removeSpecRow = (index) => {
    const updated = formData.specifications.filter((_, i) => i !== index);
    setFormData({ ...formData, specifications: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const cleanSpecs = formData.specifications.filter((s) => s.key.trim() && s.value.trim());

      const payload = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock),
        shortDescription: formData.shortDescription,
        description: formData.description,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNewArrival: formData.isNewArrival,
        specifications: cleanSpecs,
        imageUrls: formData.imageUrl ? [formData.imageUrl] : undefined,
      };

      if (editingId) {
        const res = await productService.update(editingId, payload);
        if (res.success) notify.success('Product updated successfully');
      } else {
        const res = await productService.create(payload);
        if (res.success) notify.success('Product created successfully');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      notify.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await productService.delete(id);
      if (res.success) {
        notify.info('Product deleted');
        fetchProducts();
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
            Products Inventory
          </h3>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Manage product catalog, pricing, discounts, and inventory stocks
          </span>
        </div>

        <button onClick={openAddModal} className="btn btn-primary d-inline-flex align-items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search Header */}
      <div className="card p-3 mb-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="position-relative" style={{ maxWidth: '380px' }}>
          <input
            type="text"
            className="form-control form-control-sm ps-4"
            placeholder="Search products by title or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search size={14} className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" />
        </div>
      </div>

      {/* Products Table */}
      <div className="card border shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Flags</th>
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                          alt={p.name}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold text-truncate" style={{ maxWidth: '280px', color: 'var(--text-primary)' }}>
                            {p.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            SKU: {p.sku} • {p.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category?.name || 'Uncategorized'}</td>
                    <td>
                      <div className="fw-bold">${p.discountPrice ? p.discountPrice.toFixed(2) : p.price.toFixed(2)}</div>
                      {p.discountPrice && (
                        <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
                          ${p.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td>
                      <Badge variant={p.stock <= 5 ? 'warning' : 'success'}>
                        {p.stock} units
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {p.isFeatured && <span className="badge badge-primary">Featured</span>}
                        {p.isTrending && <span className="badge badge-tangerine">Trending</span>}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button onClick={() => openEditModal(p)} className="btn btn-sm p-1 text-primary border-0" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="btn btn-sm p-1 text-danger border-0" title="Delete">
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

        <div className="p-3 border-top">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        title={editingId ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Brand</label>
              <input
                type="text"
                className="form-control"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">Base Price ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">Discount Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                placeholder="Optional"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Inventory Stock *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label">Primary Image URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Short Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Brief one-line summary for cards"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Detailed Description *</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Specifications Builder */}
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="form-label mb-0 fw-bold">Technical Specifications</label>
                <button type="button" onClick={addSpecRow} className="btn btn-sm btn-outline-primary py-0 px-2" style={{ fontSize: '0.78rem' }}>
                  + Add Specification
                </button>
              </div>

              {formData.specifications.map((spec, idx) => (
                <div key={idx} className="d-flex gap-2 mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Key (e.g. Battery Life)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Value (e.g. 40 Hours)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  />
                  {formData.specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecRow(idx)}
                      className="btn btn-sm btn-outline-danger p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Promotional Flags */}
            <div className="col-12 d-flex flex-wrap gap-4 pt-2">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="featCheck"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <label className="form-check-label text-secondary" htmlFor="featCheck">
                  Featured Product
                </label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="trendCheck"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                />
                <label className="form-check-label text-secondary" htmlFor="trendCheck">
                  Trending Spotlight
                </label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="newCheck"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                />
                <label className="form-check-label text-secondary" htmlFor="newCheck">
                  New Arrival
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
