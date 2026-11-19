const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: 'products',
      select: 'name slug price discountPrice discountPercent stock images ratings brand',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    res.status(200).json({
      success: true,
      count: wishlist.products.length,
      wishlist: wishlist.products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (Add if not present, Remove if present)
// @route   POST /api/wishlist/toggle/:productId
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [] });
    }

    const index = wishlist.products.findIndex(
      (id) => id.toString() === productId
    );

    let isAdded = false;
    if (index > -1) {
      // Remove
      wishlist.products.splice(index, 1);
      isAdded = false;
    } else {
      // Add
      wishlist.products.push(productId);
      isAdded = true;
    }

    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name slug price discountPrice discountPercent stock images ratings brand',
    });

    res.status(200).json({
      success: true,
      isAdded,
      message: isAdded ? 'Added to your wishlist' : 'Removed from your wishlist',
      count: populated.products.length,
      wishlist: populated.products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );
      await wishlist.save();
    }

    const populated = await Wishlist.findOne({ user: req.user.id }).populate({
      path: 'products',
      select: 'name slug price discountPrice discountPercent stock images ratings brand',
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist',
      count: populated ? populated.products.length : 0,
      wishlist: populated ? populated.products : [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/move-to-cart/:productId
// @access  Private
const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Product is currently out of stock' });
    }

    // 1. Remove from Wishlist
    await Wishlist.updateOne(
      { user: req.user.id },
      { $pull: { products: productId } }
    );

    // 2. Add to Cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    const price = product.discountPrice !== null ? product.discountPrice : product.price;

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1, price });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Product moved to cart successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  moveToCart,
};
