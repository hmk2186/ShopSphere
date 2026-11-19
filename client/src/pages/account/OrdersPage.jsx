import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { orderService } from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders({
          status: statusFilter,
          page: currentPage,
          limit: 8,
        });

        if (res.success) {
          setOrders(res.orders || []);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.warn('[Orders] Fetch failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, currentPage]);

  const filterButtons = ['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="container-fluid px-3 px-lg-5 py-3">
      <Breadcrumbs items={[{ label: 'My Account', link: '/account/profile' }, { label: 'Order History' }]} />

      <h2 className="fw-extrabold pb-3 border-bottom mb-4" style={{ color: 'var(--text-primary)' }}>
        My Orders
      </h2>

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {filterButtons.map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setCurrentPage(1);
            }}
            className={`btn btn-sm text-capitalize ${
              statusFilter === st ? 'btn-primary' : 'btn-outline-secondary'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package size={48} />}
          title="No Orders Found"
          description="You haven't placed any orders matching this criteria yet."
          actionText="Shop Marketplace"
          actionLink="/shop"
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="card p-3 p-md-4 border shadow-sm"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-3 border-bottom gap-2 mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold fs-6 text-primary">{order.orderNumber}</span>
                    <Badge
                      variant={
                        order.orderStatus === 'Delivered'
                          ? 'success'
                          : order.orderStatus === 'Cancelled'
                          ? 'danger'
                          : 'primary'
                      }
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="text-md-end">
                    <div className="fw-extrabold fs-5" style={{ color: 'var(--text-primary)' }}>
                      ${order.pricing?.totalAmount.toFixed(2)}
                    </div>
                    <span className="badge badge-primary text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </div>

                  <Link
                    to={`/account/orders/${order._id}`}
                    className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Item Previews */}
              <div className="d-flex flex-wrap gap-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center gap-2 p-1 pe-2 rounded"
                    style={{ backgroundColor: 'var(--bg-subtle)', fontSize: '0.8rem' }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <span className="text-truncate fw-medium" style={{ maxWidth: '150px' }}>
                      {item.name}
                    </span>
                    <span className="text-muted">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
