const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Address = require('../models/Address');
const { calculateCartTotals } = require('./cartController');

// @desc    Create new order from user's cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod, shippingAddressDirect } = req.body;

    if (!paymentMethod || !['cod', 'razorpay'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method (cod or razorpay) is required',
      });
    }

    // 1. Resolve Shipping Address
    let shippingAddress = null;
    if (addressId) {
      const addr = await Address.findOne({ _id: addressId, user: req.user.id });
      if (!addr) {
        return res.status(404).json({ success: false, message: 'Selected address not found' });
      }
      shippingAddress = {
        fullName: addr.fullName,
        phone: addr.phone,
        street: addr.street,
        landmark: addr.landmark,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
      };
    } else if (shippingAddressDirect) {
      shippingAddress = shippingAddressDirect;
    } else {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }

    // 2. Fetch and Validate Cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // 3. Verify Stock and Create Immutable Snapshots
    const itemsSnapshot = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product '${item.product.name}' is no longer available.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, in cart: ${item.quantity}.`,
        });
      }

      const activePrice =
        product.discountPrice !== null && product.discountPrice !== undefined
          ? product.discountPrice
          : product.price;

      const primaryImg =
        product.images && product.images.length > 0
          ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
          : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';

      itemsSnapshot.push({
        product: product._id,
        name: product.name,
        sku: product.sku || '',
        image: primaryImg,
        price: activePrice,
        quantity: item.quantity,
        subtotal: activePrice * item.quantity,
      });
    }

    // 4. Calculate Financials Server-Side
    const totals = await calculateCartTotals(cart);

    // 5. Decrement Product Stock Atomically
    for (const item of itemsSnapshot) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 6. Update Coupon Usage if used
    if (totals.appliedCoupon) {
      await Coupon.findByIdAndUpdate(totals.appliedCoupon._id, {
        $inc: { usedCount: 1 },
      });
    }

    // 7. Initial Status Timeline
    const initialStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';
    const initialNote =
      paymentMethod === 'cod'
        ? 'Order placed successfully with Cash on Delivery.'
        : 'Order created, awaiting Razorpay payment confirmation.';

    const timeline = [
      {
        status: initialStatus,
        timestamp: new Date(),
        note: initialNote,
      },
    ];

    // 8. Create Order Document
    const order = await Order.create({
      user: req.user.id,
      items: itemsSnapshot,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: initialStatus,
      pricing: {
        itemsTotal: totals.subtotal,
        shippingFee: totals.shippingFee,
        tax: totals.tax,
        discount: totals.discount,
        totalAmount: totals.grandTotal,
      },
      couponApplied: totals.appliedCoupon
        ? {
            code: totals.appliedCoupon.code,
            discountAmount: totals.appliedCoupon.discountAmount,
          }
        : undefined,
      statusTimeline: timeline,
    });

    // 9. Clear Cart upon order initiation
    cart.items = [];
    cart.coupon = null;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user.id };

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership or admin role
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer eligible prior to shipping)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this order' });
    }

    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.orderStatus}' status. Orders already processed or shipped cannot be cancelled.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.statusTimeline.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: reason ? `Cancelled: ${reason}` : 'Order cancelled by customer.',
    });

    // Re-increment stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get printable invoice data
// @route   GET /api/orders/:id/invoice
// @access  Private
const getOrderInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const invoice = {
      invoiceNumber: `INV-${order.orderNumber.replace('ORD-', '')}`,
      invoiceDate: order.createdAt,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod.toUpperCase(),
      paymentStatus: order.paymentStatus.toUpperCase(),
      customer: {
        name: order.shippingAddress.fullName || order.user.name,
        email: order.user.email,
        phone: order.shippingAddress.phone,
      },
      shippingAddress: order.shippingAddress,
      items: order.items,
      pricing: order.pricing,
      couponApplied: order.couponApplied,
      company: {
        name: 'ShopSphere Inc.',
        address: '100 Commerce Boulevard, Suite 500, Tech City, CA 94103',
        supportEmail: 'support@shopsphere.com',
        phone: '+1 (800) 555-SPHERE',
        website: 'https://shopsphere.com',
      },
    };

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderInvoice,
};
