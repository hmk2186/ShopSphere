const Address = require('../models/Address');

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new delivery address
// @route   POST /api/addresses
// @access  Private
const createAddress = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      street,
      landmark,
      city,
      state,
      postalCode,
      country,
      isDefault,
      addressType,
    } = req.body;

    const count = await Address.countDocuments({ user: req.user.id });
    const shouldBeDefault = count === 0 || isDefault === true || isDefault === 'true';

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user.id,
      fullName,
      phone,
      street,
      landmark: landmark || '',
      city,
      state,
      postalCode,
      country: country || 'United States',
      isDefault: shouldBeDefault,
      addressType: addressType || 'home',
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const {
      fullName,
      phone,
      street,
      landmark,
      city,
      state,
      postalCode,
      country,
      isDefault,
      addressType,
    } = req.body;

    if (isDefault === true || isDefault === 'true') {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
      address.isDefault = true;
    }

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (street) address.street = street;
    if (landmark !== undefined) address.landmark = landmark;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (addressType) address.addressType = addressType;

    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete delivery address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    await Address.findByIdAndDelete(req.params.id);

    // If default was deleted, assign default to another address if available
    if (wasDefault) {
      const another = await Address.findOne({ user: req.user.id });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await Address.updateMany({ user: req.user.id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
