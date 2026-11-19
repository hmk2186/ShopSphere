import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home, Printer } from 'lucide-react';
import { orderService } from '../../services/api';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      orderService.getById(orderId).then((res) => {
        if (res.success) setOrder(res.order);
      });
    }
  }, [orderId]);

  return (
    <div className="container py-5 text-center" style={{ maxWidth: '640px' }}>
      <div
        className="card p-4 p-md-5 border shadow-sm"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div
          className="mx-auto mb-4 p-3 rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
          }}
        >
          <CheckCircle2 size={48} />
        </div>

        <h2 className="fw-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
          Order Confirmed!
        </h2>
        <p className="text-secondary mb-4" style={{ fontSize: '0.96rem' }}>
          Thank you for choosing ShopSphere. Your order has been placed successfully and our fulfillment team is preparing your package.
        </p>

        {order && (
          <div
            className="p-3 rounded-3 mb-4 text-start border"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)', fontSize: '0.88rem' }}
          >
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Order Number:</span>
              <strong className="text-primary">{order.orderNumber}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Payment Method:</span>
              <span className="text-uppercase fw-semibold">{order.paymentMethod}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Total Paid:</span>
              <strong className="text-primary">${order.pricing?.totalAmount.toFixed(2)}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Recipient:</span>
              <span>{order.shippingAddress?.fullName}</span>
            </div>
          </div>
        )}

        <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
          {orderId && (
            <Link to={`/account/orders/${orderId}`} className="btn btn-primary px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2">
              <Package size={18} /> Track Your Order
            </Link>
          )}
          <Link to="/" className="btn btn-outline-secondary px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2">
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
