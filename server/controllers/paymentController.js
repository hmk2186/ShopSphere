const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { razorpay, isRazorpayConfigured } = require('../config/razorpay');

// @desc    Create Razorpay Order for an existing pending order
// @route   POST /api/payments/razorpay/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'This order has already been paid.' });
    }

    // Convert amount to cents/paise (integer)
    const amountInSubunits = Math.round(order.pricing.totalAmount * 100);

    // If Razorpay credentials are fully configured
    if (isRazorpayConfigured && razorpay) {
      const options = {
        amount: amountInSubunits,
        currency: 'USD',
        receipt: `receipt_${order.orderNumber}`,
        notes: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          userId: req.user.id,
        },
      };

      const rzpOrder = await razorpay.orders.create(options);

      order.paymentDetails.razorpayOrderId = rzpOrder.id;
      await order.save();

      return res.status(200).json({
        success: true,
        isSimulated: false,
        key: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        orderNumber: order.orderNumber,
      });
    }

    // Graceful Developer Fallback: Simulated Test Payment Flow
    const mockRzpOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    order.paymentDetails.razorpayOrderId = mockRzpOrderId;
    await order.save();

    return res.status(200).json({
      success: true,
      isSimulated: true,
      key: 'rzp_test_simulated_key',
      razorpayOrderId: mockRzpOrderId,
      amount: amountInSubunits,
      currency: 'USD',
      orderNumber: order.orderNumber,
      note: 'Simulated Razorpay Mode: Real keys not found in .env. Test checkout can be completed directly.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & confirm order
// @route   POST /api/payments/razorpay/verify
// @access  Private
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, isSimulated } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let isValid = false;

    if (isSimulated || !isRazorpayConfigured) {
      // Allow simulated test confirmation
      isValid = true;
    } else {
      // Verify Cryptographic HMAC SHA256 Signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isValid = expectedSignature === razorpaySignature;
    }

    if (!isValid) {
      order.paymentStatus = 'failed';
      order.statusTimeline.push({
        status: 'Pending',
        timestamp: new Date(),
        note: 'Razorpay payment verification failed: Invalid signature.',
      });
      await order.save();

      await Payment.create({
        order: order._id,
        user: req.user.id,
        paymentMethod: 'razorpay',
        amount: order.pricing.totalAmount,
        currency: 'USD',
        status: 'failed',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        failureReason: 'Cryptographic signature mismatch',
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Success
    order.paymentStatus = 'completed';
    order.orderStatus = 'Confirmed';
    order.paymentDetails = {
      razorpayOrderId: razorpayOrderId || order.paymentDetails.razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `pay_sim_${Date.now()}`,
      razorpaySignature: razorpaySignature || 'simulated_sig',
    };

    order.statusTimeline.push({
      status: 'Confirmed',
      timestamp: new Date(),
      note: `Payment completed successfully via Razorpay (Txn ID: ${order.paymentDetails.razorpayPaymentId}).`,
    });

    await order.save();

    await Payment.create({
      order: order._id,
      user: req.user.id,
      paymentMethod: 'razorpay',
      amount: order.pricing.totalAmount,
      currency: 'USD',
      status: 'captured',
      razorpayOrderId: order.paymentDetails.razorpayOrderId,
      razorpayPaymentId: order.paymentDetails.razorpayPaymentId,
      razorpaySignature: order.paymentDetails.razorpaySignature,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
