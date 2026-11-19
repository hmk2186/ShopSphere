const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Helper to compute cart totals securely on server
const calculateCartTotals = async (cart) => {
  let subtotal = 0;
  const validatedItems = [];

  for (const item of cart.items) {
    if (!item.product) continue;

    const currentPrice =
      item.product.discountPrice !== null && item.product.discountPrice !== undefined
        ? item.product.discountPrice
        : item.product.price;

    const itemSubtotal = currentPrice * item.quantity;
    subtotal += itemSubtotal;

    validatedItems.push({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      price: currentPrice,
      subtotal: itemSubtotal,
      inStock: item.product.stock >= item.quantity,
      availableStock: item.product.stock,
    });
  }

  // Calculate coupon discount
  let discount = 0;
  let appliedCoupon = null;

  if (cart.coupon) {
    const couponDoc = await Coupon.findById(cart.coupon);
    if (couponDoc) {
      const validation = couponDoc.isValid(subtotal);
      if (validation.valid) {
        discount = couponDoc.calculateDiscount(subtotal);
        appliedCoupon = {
          _id: couponDoc._id,
          code: couponDoc.code,
          discountType: couponDoc.discountType,
          discountValue: couponDoc.discountValue,
          discountAmount: discount,
        };
      } else {
        // Automatically detach invalid coupon
        cart.coupon = null;
        await cart.save();
      }
    }
  }

  // Shipping calculation: Free over $100, else $10 flat
  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 10;
  
  // Tax calculation: 8% estimated sales tax
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  
  const grandTotal = Math.max(0, Math.round((subtotal - discount + shippingFee + tax) * 100) / 100);

  return {
    items: validatedItems,
    itemsCount: validatedItems.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
    discount,
    appliedCoupon,
    shippingFee,
    tax,
    grandTotal,
  };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercent stock images brand',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const totals = await calculateCartTotals(cart);

    res.status(200).json({
      success: true,
      cart: totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    const price = product.discountPrice !== null ? product.discountPrice : product.price;

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Maximum available stock is ${product.stock}.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = price;
    } else {
      if (Number(quantity) > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock}).`,
        });
      }
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        price,
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercent stock images brand',
    });

    const totals = await calculateCartTotals(populatedCart);

    res.status(200).json({
      success: true,
      message: 'Item added to your cart!',
      cart: totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
const updateCartQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(404).json({ success: false, message: 'Product no longer exists. Removed from cart.' });
    }

    const newQty = Number(quantity);

    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot set quantity to ${newQty}. Available stock is ${product.stock}.`,
        });
      }
      cart.items[itemIndex].quantity = newQty;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercent stock images brand',
    });

    const totals = await calculateCartTotals(populatedCart);

    res.status(200).json({
      success: true,
      cart: totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercent stock images brand',
    });

    const totals = await calculateCartTotals(populatedCart);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      cart.coupon = null;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        items: [],
        itemsCount: 0,
        subtotal: 0,
        discount: 0,
        appliedCoupon: null,
        shippingFee: 0,
        tax: 0,
        grandTotal: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    }

    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    let subtotal = 0;
    cart.items.forEach((item) => {
      const price = item.product.discountPrice !== null ? item.product.discountPrice : item.product.price;
      subtotal += price * item.quantity;
    });

    const validation = coupon.isValid(subtotal);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    cart.coupon = coupon._id;
    await cart.save();

    const totals = await calculateCartTotals(cart);

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      cart: totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
const removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (cart) {
      cart.coupon = null;
      await cart.save();
    }

    const totals = await calculateCartTotals(cart);

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      cart: totals,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  calculateCartTotals,
};
