import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
} from 'lucide-react';
import { adminService, categoryService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import StatCard from '../../components/admin/StatCard';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const AdminInventoryPage = () => {
  const { notify } = useNotification();
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit stock buffer
  const [stockEdits, setStockEdits] = useState({});

  // Summary Metrics
  const [metrics, setMetrics] = useState({
    totalStockUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inStockCount: 0,
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        page: currentPage,
        limit: 10,
      };

      const res = await adminService.getInventory(params);
      if (res.success) {
        const productList = res.products || res.inventory || [];
        setInventory(productList);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount || res.total || 0);

        setMetrics({
          totalStockUnits: res.totalUnits !== undefined ? res.totalUnits : (res.stockSummary?.totalUnits || 0),
          lowStockCount: res.lowStockCount !== undefined ? res.lowStockCount : (res.stockSummary?.lowStock || 0),
          outOfStockCount: res.outOfStockCount !== undefined ? res.outOfStockCount : (res.stockSummary?.outOfStock || 0),
          inStockCount: res.inStockCount !== undefined ? res.inStockCount : (res.stockSummary?.inStock || 0),
        });

        // Initialize local edit values
        const initialEdits = {};
        productList.forEach((item) => {
          initialEdits[item._id] = item.stock;
        });
        setStockEdits(initialEdits);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to load inventory');
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
    fetchInventory();
  }, [currentPage, search, statusFilter, categoryFilter]);

  const handleStockInputChange = (id, value) => {
    const num = parseInt(value, 10);
    setStockEdits((prev) => ({
      ...prev,
      [id]: isNaN(num) ? '' : Math.max(0, num),
    }));
  };

  const handleQuickAdjust = (id, delta) => {
    setStockEdits((prev) => {
      const current = prev[id] !== undefined ? Number(prev[id]) : 0;
      return {
        ...prev,
        [id]: Math.max(0, current + delta),
      };
    });
  };

  const handleSaveStock = async (product) => {
    const newStock = stockEdits[product._id];
    if (newStock === '' || newStock === undefined || newStock === null) {
      notify.error('Stock quantity cannot be empty');
      return;
    }

    try {
      setUpdatingId(product._id);
      const res = await adminService.updateStock(product._id, Number(newStock));
      if (res.success) {
        notify.success(`Stock updated for ${product.name}`);
        setInventory((prev) =>
          prev.map((item) => (item._id === product._id ? { ...item, stock: Number(newStock) } : item))
        );
      }
    } catch (err) {
      notify.error(err.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom mb-4">
        <div>
          <h3 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            Inventory Management
          </h3>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Monitor real-time warehouse stock levels, adjust units, and handle low stock alerts
          </span>
        </div>

        <button
          onClick={fetchInventory}
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Stock Units"
            value={metrics.totalStockUnits.toLocaleString()}
            icon={<Boxes size={20} />}
            change="Across all SKUs"
            isPositive={true}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Low Stock Items"
            value={metrics.lowStockCount.toLocaleString()}
            icon={<AlertTriangle size={20} />}
            change={metrics.lowStockCount > 0 ? 'Requires restock' : 'Optimal'}
            isPositive={metrics.lowStockCount === 0}
            color={metrics.lowStockCount > 0 ? 'warning' : 'success'}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Out of Stock"
            value={metrics.outOfStockCount.toLocaleString()}
            icon={<XCircle size={20} />}
            change={metrics.outOfStockCount > 0 ? 'Action needed' : 'Zero items'}
            isPositive={metrics.outOfStockCount === 0}
            color={metrics.outOfStockCount > 0 ? 'danger' : 'success'}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="In Stock"
            value={metrics.inStockCount.toLocaleString()}
            icon={<CheckCircle size={20} />}
            change="Healthy quantities"
            isPositive={true}
            color="success"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 mb-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-sm ps-4"
                placeholder="Search by title, SKU, or brand..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Search
                size={14}
                className="position-absolute start-0 top-50 translate-middle-y ms-2 text-muted"
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Stock Statuses</option>
              <option value="inStock">In Stock (&gt; 5 units)</option>
              <option value="lowStock">Low Stock (1 - 5 units)</option>
              <option value="outOfStock">Out of Stock (0 units)</option>
            </select>
          </div>

          <div className="col-6 col-md-4">
            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card border shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th style={{ minWidth: '220px' }}>Quick Adjust & Update</th>
                <th className="text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status" />
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No inventory records match the current filters.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const currentEdit = stockEdits[item._id] ?? item.stock;
                  const isModified = currentEdit !== item.stock;
                  const isLow = item.stock > 0 && item.stock <= 5;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={
                              item.images?.[0]?.url ||
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={item.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                            }}
                          />
                          <div>
                            <div
                              className="fw-bold text-truncate"
                              style={{ maxWidth: '260px', color: 'var(--text-primary)' }}
                            >
                              {item.name}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              SKU: {item.sku || 'N/A'} • {item.brand || 'ShopSphere'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{item.category?.name || 'Uncategorized'}</td>
                      <td>
                        <div className="fw-bold">${(item.price || 0).toFixed(2)}</div>
                      </td>
                      <td>
                        <span className="fw-bold fs-6" style={{ color: 'var(--text-primary)' }}>
                          {item.stock}
                        </span>{' '}
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          units
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2 py-1"
                            onClick={() => handleQuickAdjust(item._id, -5)}
                            title="-5 Units"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2 py-1"
                            onClick={() => handleQuickAdjust(item._id, -1)}
                            title="-1 Unit"
                          >
                            -1
                          </button>
                          <input
                            type="number"
                            min="0"
                            className="form-control form-control-sm text-center"
                            style={{ width: '70px' }}
                            value={currentEdit}
                            onChange={(e) => handleStockInputChange(item._id, e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2 py-1"
                            onClick={() => handleQuickAdjust(item._id, 1)}
                            title="+1 Unit"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2 py-1"
                            onClick={() => handleQuickAdjust(item._id, 5)}
                            title="+5 Units"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            disabled={!isModified || updatingId === item._id}
                            className={`btn btn-sm ${isModified ? 'btn-primary' : 'btn-outline-secondary'} ms-1 px-2 py-1`}
                            onClick={() => handleSaveStock(item)}
                            title="Save stock change"
                          >
                            {updatingId === item._id ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <Save size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="text-end">
                        {isOut ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : isLow ? (
                          <Badge variant="warning">Low Stock ({item.stock})</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-top">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryPage;
