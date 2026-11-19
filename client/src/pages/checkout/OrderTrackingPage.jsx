import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  Check,
  AlertTriangle,
  Printer,
  XCircle,
} from 'lucide-react';
import { orderService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Badge from '../../components/common/Badge';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const { notify } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getById(id);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        notify.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, notify]);

  const handleCancelOrder = async () => {
    const reason = prompt('Please share the reason for cancelling this order:');
    if (reason === null) return; // user clicked cancel prompt

    try {
      setCancelling(true);
      const res = await orderService.cancel(id, reason);
      if (res.success && res.order) {
        setOrder(res.order);
        notify.success('Order has been cancelled.');
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  // 6-stage order tracking pipeline
  const stages = [
    { key: 'Pending', label: 'Order Placed', icon: <Clock size={16} /> },
    { key: 'Confirmed', label: 'Confirmed', icon: <CheckCircle size={16} /> },
    { key: 'Processing', label: 'Processing', icon: <Package size={16} /> },
    { key: 'Shipped', label: 'Shipped', icon: <Truck size={16} /> },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: <MapPin size={16} /> },
    { key: 'Delivered', label: 'Delivered', icon: <Check size={16} /> },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';
  const canCancel = ['Pending', 'Confirmed'].includes(order.orderStatus);

  return (
    <div className="container-fluid px-3 px-lg-5 py-3">
      <Breadcrumbs
        items={[
          { label: 'My Account', link: '/account/profile' },
          { label: 'Orders', link: '/account/orders' },
          { label: order.orderNumber },
        ]}
      />

      {/* Header Row */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-extrabold mb-0" style={{ color: 'var(--text-primary)' }}>
              Order {order.orderNumber}
            </h3>
            <Badge
              variant={
                isCancelled
                  ? 'danger'
                  : order.orderStatus === 'Delivered'
                  ? 'success'
                  : 'primary'
              }
            >
              {order.orderStatus}
            </Badge>
          </div>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
            >
              <XCircle size={15} /> Cancel Order
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
          >
            <Printer size={15} /> Print Receipt
          </button>
        </div>
      </div>

      {/* Visual Tracking Progress Timeline */}
      <div className="card p-4 mb-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h5 className="fw-bold mb-4">Fulfillment Pipeline</h5>

        {isCancelled ? (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-0">
            <AlertTriangle size={20} />
            <div>
              <strong>This order was cancelled.</strong>
              {order.cancellationReason && <div style={{ fontSize: '0.85rem' }}>Reason: {order.cancellationReason}</div>}
            </div>
          </div>
        ) : (
          <div className="position-relative py-2">
            <div className="row g-2 text-center">
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} className="col-4 col-md-2 position-relative">
                    <div
                      className={`mx-auto rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                        isCompleted
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted border'
                      }`}
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: isCompleted ? 'var(--color-primary)' : 'var(--bg-subtle)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      {stage.icon}
                    </div>
                    <div
                      className="fw-semibold"
                      style={{
                        fontSize: '0.78rem',
                        color: isCurrent
                          ? 'var(--color-primary)'
                          : isCompleted
                          ? 'var(--text-primary)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {stage.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Timeline Events */}
        {order.statusTimeline && order.statusTimeline.length > 0 && (
          <div className="mt-4 pt-3 border-top">
            <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem' }}>Activity History</h6>
            <div className="d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
              {order.statusTimeline.map((item, idx) => (
                <div key={idx} className="d-flex align-items-start gap-2">
                  <div className="text-muted" style={{ minWidth: '140px' }}>
                    {new Date(item.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>
                    <strong className="text-primary">{item.status}:</strong>{' '}
                    <span className="text-secondary">{item.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Item Snapshots & Shipping Details */}
      <div className="row g-4">
        {/* Order Items Snapshot Table */}
        <div className="col-12 col-lg-8">
          <div className="card p-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h5 className="fw-bold mb-3">Items in this Order</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                              {item.name}
                            </div>
                            {item.sku && (
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                SKU: {item.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td className="text-end fw-bold text-primary">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial & Address Sidebar */}
        <div className="col-12 col-lg-4">
          {/* Shipping Address Snapshot */}
          <div className="card p-4 border mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h6 className="fw-bold mb-2">Delivery Address</h6>
            <div className="text-secondary" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
              <strong>{order.shippingAddress?.fullName}</strong>
              <br />
              {order.shippingAddress?.street}
              {order.shippingAddress?.landmark && `, ${order.shippingAddress?.landmark}`}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              <br />
              {order.shippingAddress?.country}
              <div className="text-muted mt-2">Phone: {order.shippingAddress?.phone}</div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="card p-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h6 className="fw-bold mb-3">Order Cost Summary</h6>
            <div className="d-flex flex-column gap-2" style={{ fontSize: '0.88rem' }}>
              <div className="d-flex justify-content-between text-secondary">
                <span>Items Subtotal</span>
                <span>${order.pricing?.itemsTotal.toFixed(2)}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Coupon Discount ({order.couponApplied?.code})</span>
                  <span>-${order.pricing.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between text-secondary">
                <span>Shipping Fee</span>
                <span>{order.pricing?.shippingFee === 0 ? 'FREE' : `$${order.pricing?.shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Estimated Taxes</span>
                <span>${order.pricing?.tax.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top fw-bold fs-5 text-primary">
                <span>Total Paid</span>
                <span>${order.pricing?.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
