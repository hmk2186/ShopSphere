import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Banknote,
  Plus,
  CheckCircle,
  ShieldCheck,
  Truck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { addressService, orderService, paymentService } from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import OrderSummaryCard from '../../components/cart/OrderSummaryCard';
import Modal from '../../components/common/Modal';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const { notify } = useNotification();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'razorpay'
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
    addressType: 'home',
  });

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoading(true);
        const res = await addressService.getAll();
        if (res.success) {
          setAddresses(res.addresses || []);
          const defaultAddr = res.addresses?.find((a) => a.isDefault) || res.addresses?.[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr._id);
        }
      } catch (err) {
        console.warn('[Checkout] Failed to load addresses:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressService.create(newAddress);
      if (res.success && res.address) {
        setAddresses((prev) => [res.address, ...prev]);
        setSelectedAddressId(res.address._id);
        setIsAddressModalOpen(false);
        notify.success('Address added!');
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      notify.warning('Please select or add a delivery address to continue.');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      notify.warning('Your shopping cart is empty.');
      navigate('/cart');
      return;
    }

    try {
      setPlacingOrder(true);

      // 1. Create Order on Backend
      const orderRes = await orderService.create({
        addressId: selectedAddressId,
        paymentMethod,
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Failed to place order.');
      }

      const createdOrder = orderRes.order;

      // 2. Handle Payment Flow
      if (paymentMethod === 'cod') {
        // Cash on Delivery: Instant confirmation
        await fetchCart();
        notify.success('Order placed successfully with Cash on Delivery!');
        navigate(`/order-success/${createdOrder._id}`);
        return;
      }

      // Razorpay Online Flow
      if (paymentMethod === 'razorpay') {
        const rzpRes = await paymentService.createRazorpayOrder(createdOrder._id);

        if (rzpRes.isSimulated || !window.Razorpay) {
          // Simulated test mode confirmation
          const verifyRes = await paymentService.verifyRazorpayPayment({
            orderId: createdOrder._id,
            isSimulated: true,
          });

          await fetchCart();
          notify.success('Test payment simulated successfully!');
          navigate(`/order-success/${createdOrder._id}`);
          return;
        }

        // Real Razorpay Checkout Popup
        const options = {
          key: rzpRes.key,
          amount: rzpRes.amount,
          currency: rzpRes.currency,
          name: 'ShopSphere Marketplace',
          description: `Order ${createdOrder.orderNumber}`,
          order_id: rzpRes.razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyRes = await paymentService.verifyRazorpayPayment({
                orderId: createdOrder._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                await fetchCart();
                notify.success('Payment verified successfully!');
                navigate(`/order-success/${createdOrder._id}`);
              }
            } catch (err) {
              notify.error(`Payment verification failed: ${err.message}`);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: '#315FEA',
          },
          modal: {
            ondismiss: function () {
              notify.info('Payment window closed. You can retry payment anytime from your order details.');
              navigate(`/account/orders/${createdOrder._id}`);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-5 py-3">
      <Breadcrumbs items={[{ label: 'Cart', link: '/cart' }, { label: 'Checkout' }]} />

      <h2 className="fw-extrabold pb-3 border-bottom mb-4" style={{ color: 'var(--text-primary)' }}>
        Complete Your Order
      </h2>

      <div className="row g-4">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="col-12 col-lg-8">
          {/* Step 1: Delivery Address */}
          <div className="card p-4 mb-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: '28px', height: '28px', backgroundColor: 'var(--color-primary)', fontSize: '0.85rem' }}
                >
                  1
                </div>
                <h5 className="fw-bold mb-0">Delivery Address</h5>
              </div>

              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              >
                <Plus size={15} /> Add New Address
              </button>
            </div>

            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary spinner-border-sm" role="status" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <p className="text-muted mb-2">No saved delivery addresses found.</p>
                <button onClick={() => setIsAddressModalOpen(true)} className="btn btn-sm btn-primary">
                  Add Delivery Address
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div key={addr._id} className="col-12 col-md-6">
                      <div
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`card p-3 h-100 border cursor-pointer ${isSelected ? 'border-primary' : ''}`}
                        style={{
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                            {addr.fullName}
                          </span>
                          <span className="badge badge-primary text-uppercase" style={{ fontSize: '0.65rem' }}>
                            {addr.addressType}
                          </span>
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
                          {addr.street}
                          {addr.landmark && `, ${addr.landmark}`}
                          <br />
                          {addr.city}, {addr.state} {addr.postalCode}
                          <br />
                          {addr.country}
                        </div>
                        <div className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                          Phone: {addr.phone}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="card p-4 mb-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: '28px', height: '28px', backgroundColor: 'var(--color-primary)', fontSize: '0.85rem' }}
              >
                2
              </div>
              <h5 className="fw-bold mb-0">Payment Method</h5>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Option A: Cash on Delivery */}
              <label
                className={`card p-3 border cursor-pointer d-flex flex-row align-items-center justify-content-between ${
                  paymentMethod === 'cod' ? 'border-primary' : ''
                }`}
                style={{
                  backgroundColor: paymentMethod === 'cod' ? 'var(--color-primary-light)' : 'var(--bg-card)',
                  cursor: 'pointer',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="form-check-input"
                  />
                  <div
                    className="p-2 rounded-circle"
                    style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}
                  >
                    <Banknote size={22} />
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                      Cash on Delivery (COD)
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                      Pay safely in cash or UPI when your shipment arrives at your doorstep.
                    </div>
                  </div>
                </div>
              </label>

              {/* Option B: Razorpay Online Payment */}
              <label
                className={`card p-3 border cursor-pointer d-flex flex-row align-items-center justify-content-between ${
                  paymentMethod === 'razorpay' ? 'border-primary' : ''
                }`}
                style={{
                  backgroundColor: paymentMethod === 'razorpay' ? 'var(--color-primary-light)' : 'var(--bg-card)',
                  cursor: 'pointer',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="form-check-input"
                  />
                  <div
                    className="p-2 rounded-circle"
                    style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                  >
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                      Razorpay Secure (Cards, UPI, NetBanking)
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                      Test Mode Gateway — Instant verified checkout with 256-bit encryption.
                    </div>
                  </div>
                </div>
                <span className="badge badge-tangerine d-none d-sm-inline">Test Mode Ready</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="col-12 col-lg-4">
          <OrderSummaryCard
            cart={cart}
            isCheckout
            onCheckout={handlePlaceOrder}
            checkoutButtonText={
              placingOrder
                ? 'Processing Order...'
                : paymentMethod === 'cod'
                ? 'Confirm Order (COD)'
                : 'Proceed to Payment'
            }
          />
        </div>
      </div>

      {/* Add New Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add New Delivery Address"
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setIsAddressModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveAddress}>
              Save Address
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAddress}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Recipient Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Contact Phone *</label>
              <input
                type="tel"
                className="form-control"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-control"
                placeholder="House number, street name"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Landmark / Suite (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Near central park, Apt 4B"
                value={newAddress.landmark}
                onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
              />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-control"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                required
              />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label">State / Province *</label>
              <input
                type="text"
                className="form-control"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Postal / Zip Code *</label>
              <input
                type="text"
                className="form-control"
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
