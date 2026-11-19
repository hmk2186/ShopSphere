const Category = require('../models/Category');
const Product = require('../models/Product');
const { processImageUpload } = require('../middleware/uploadMiddleware');

// @desc    Get all categories with product counts
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });

    // Aggregate product counts per category
    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    productCounts.forEach((pc) => {
      countMap[pc._id.toString()] = pc.count;
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[cat._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: enrichedCategories.length,
      categories: enrichedCategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const subcategories = await Category.find({ parentCategory: category._id });

    res.status(200).json({
      success: true,
      category,
      subcategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parentCategory, isFeatured, displayOrder, imageUrl } = req.body;

    let image = {
      url: imageUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
      publicId: null,
    };

    if (req.file) {
      const uploaded = await processImageUpload(req.file, 'shopsphere/categories');
      if (uploaded) image = uploaded;
    }

    const category = await Category.create({
      name,
      description: description || '',
      parentCategory: parentCategory || null,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      isActive: req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : true,
      image,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, description, parentCategory, isFeatured, displayOrder, imageUrl } = req.body;

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
    if (isFeatured !== undefined) category.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive === 'true' || req.body.isActive === true;

    if (req.file) {
      const uploaded = await processImageUpload(req.file, 'shopsphere/categories');
      if (uploaded) category.image = uploaded;
    } else if (imageUrl) {
      category.image.url = imageUrl;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if products exist in category
    const hasProducts = await Product.countDocuments({ category: category._id });
    if (hasProducts > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. There are ${hasProducts} products assigned to it.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
