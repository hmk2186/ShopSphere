const Product = require('../models/Product');
const Category = require('../models/Category');
const { processImageUpload } = require('../middleware/uploadMiddleware');

// @desc    Get all products with advanced filtering, searching, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      stockStatus,
      brand,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // 1. Text Search (Name, Brand, Description)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
      ];
    }

    // 2. Category Filter (By ID or By Slug)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({ slug: category });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    // 3. Price Range Filter (matches on discountPrice if available, else price)
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.$and = query.$and || [];
      const priceFilter = {};

      if (minPrice !== undefined && minPrice !== '') {
        const minVal = Number(minPrice);
        query.$and.push({
          $or: [
            { discountPrice: { $gte: minVal } },
            { $and: [{ discountPrice: null }, { price: { $gte: minVal } }] },
          ],
        });
      }

      if (maxPrice !== undefined && maxPrice !== '') {
        const maxVal = Number(maxPrice);
        query.$and.push({
          $or: [
            { discountPrice: { $lte: maxVal } },
            { $and: [{ discountPrice: null }, { price: { $lte: maxVal } }] },
          ],
        });
      }
    }

    // 4. Rating Filter
    if (minRating) {
      query['ratings.average'] = { $gte: Number(minRating) };
    }

    // 5. In Stock & Stock Status Filter
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }
    if (stockStatus === 'inStock') {
      query.stock = { $gt: 10 };
    } else if (stockStatus === 'lowStock') {
      query.stock = { $gt: 0, $lte: 10 };
    } else if (stockStatus === 'outOfStock') {
      query.stock = 0;
    }

    // 6. Brand Filter
    if (brand) {
      const brands = brand.split(',').map((b) => new RegExp(b.trim(), 'i'));
      query.brand = { $in: brands };
    }

    // 7. Sorting Logic
    let sortOptions = { createdAt: -1 }; // Default: Newest
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'popular') {
      sortOptions = { 'ratings.count': -1, 'ratings.average': -1 };
    } else if (sort === 'rating') {
      sortOptions = { 'ratings.average': -1 };
    } else if (sort === 'discount') {
      sortOptions = { discountPercent: -1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug or ID
// @route   GET /api/products/:identifier
// @access  Public
const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let product;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug: identifier }).populate('category', 'name slug');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/curated/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending products
// @route   GET /api/products/curated/trending
// @access  Public
const getTrendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isTrending: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ 'ratings.count': -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/curated/new-arrivals
// @access  Public
const getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products by category
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .populate('category', 'name slug')
      .limit(4);

    res.status(200).json({ success: true, count: related.length, products: related });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      brand,
      price,
      discountPrice,
      stock,
      isFeatured,
      isTrending,
      isNewArrival,
      specifications,
      imageUrls,
    } = req.body;

    // Handle images
    let images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const uploaded = await processImageUpload(req.files[i], 'shopsphere/products');
        if (uploaded) {
          images.push({
            url: uploaded.url,
            publicId: uploaded.publicId,
            isPrimary: i === 0,
          });
        }
      }
    } else if (imageUrls) {
      const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      images = urls.map((url, idx) => ({
        url,
        publicId: null,
        isPrimary: idx === 0,
      }));
    }

    if (images.length === 0) {
      images.push({
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        publicId: null,
        isPrimary: true,
      });
    }

    // Parse specifications if stringified
    let parsedSpecs = [];
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        parsedSpecs = [];
      }
    }

    const product = await Product.create({
      name,
      description,
      shortDescription: shortDescription || '',
      category,
      brand: brand || 'ShopSphere',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock) || 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isTrending: isTrending === 'true' || isTrending === true,
      isNewArrival: isNewArrival === 'true' || isNewArrival === true,
      isActive: req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : true,
      images,
      specifications: parsedSpecs,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      description,
      shortDescription,
      category,
      brand,
      price,
      discountPrice,
      stock,
      isFeatured,
      isTrending,
      isNewArrival,
      specifications,
      imageUrls,
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (stock !== undefined) product.stock = Number(stock);
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isTrending !== undefined) product.isTrending = isTrending === 'true' || isTrending === true;
    if (isNewArrival !== undefined) product.isNewArrival = isNewArrival === 'true' || isNewArrival === true;
    if (req.body.isActive !== undefined) product.isActive = req.body.isActive === 'true' || req.body.isActive === true;

    if (specifications) {
      try {
        product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        // keep existing
      }
    }

    // New images upload
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (let i = 0; i < req.files.length; i++) {
        const uploaded = await processImageUpload(req.files[i], 'shopsphere/products');
        if (uploaded) {
          newImages.push({
            url: uploaded.url,
            publicId: uploaded.publicId,
            isPrimary: i === 0,
          });
        }
      }
      product.images = newImages;
    } else if (imageUrls) {
      const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      product.images = urls.map((url, idx) => ({
        url,
        publicId: null,
        isPrimary: idx === 0,
      }));
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlugOrId,
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
