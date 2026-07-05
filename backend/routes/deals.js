const express = require('express');
const jwt = require('jsonwebtoken');
const Deal = require('../models/Deal');
const User = require('../models/User');

const router = express.Router();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No authentication token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

router.get('/', async (req, res) => {
  try {
    const { location, foodType, search, isActive = 'true' } = req.query;

    // Pagination params — default page 1, limit 20, max 100
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = { isActive: isActive === 'true' };
    if (location) filter['vendor.location'] = new RegExp(location, 'i');
    if (foodType) filter.foodType = foodType;
    if (search) filter.$or = [
      { itemName: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { 'vendor.restaurantName': new RegExp(search, 'i') }
    ];

    // Run query and count in parallel — single round-trip cost
    const [deals, total] = await Promise.all([
      Deal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Deal.countDocuments(filter)
    ]);

    res.json({
      deals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/vendor/:vendorId', async (req, res) => {
  try {
    console.log('Fetching deals for vendor ID:', req.params.vendorId);
    const deals = await Deal.find({ vendorId: req.params.vendorId }).sort({ createdAt: -1 });
    console.log('Found deals:', deals.length);
    res.json({ deals });
  } catch (error) {
    console.error('Error fetching vendor deals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'Vendor') return res.status(403).json({ message: 'Only vendors can create deals' });
    if (!user.profileCompleted) return res.status(400).json({ message: 'Please complete your profile first' });
    const dealData = {
      ...req.body,
      vendorId: req.userId,
      vendor: {
        restaurantName: user.restaurantName,
        address: user.address,
        location: user.location,
        phoneNumber: user.phoneNumber,
        googleMapsLocation: user.googleMapsLocation,
        rating: user.rating || 0
      }
    };
    const deal = new Deal(dealData);
    await deal.save();
    res.status(201).json(deal);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create deal', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (deal.vendorId.toString() !== req.userId) return res.status(403).json({ message: 'You can only update your own deals' });
    const allowedUpdates = ['itemName', 'description', 'originalPrice', 'newPrice', 'stockAvailable', 'dealStartTime', 'dealEndTime', 'image', 'foodType', 'isActive'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) return res.status(400).json({ message: 'Invalid updates' });
    updates.forEach(update => deal[update] = req.body[update]);
    await deal.save();
    res.json({ deal, message: 'Deal updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update deal', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (deal.vendorId.toString() !== req.userId) return res.status(403).json({ message: 'You can only delete your own deals' });
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete deal', error: error.message });
  }
});

router.post('/:id/claim', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (!deal.isActive) return res.status(400).json({ message: 'Deal is not active' });
    if (deal.claimed >= deal.stockAvailable) return res.status(400).json({ message: 'Deal is sold out' });
    deal.claimed += 1;
    await deal.save();
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to claim deal', error: error.message });
  }
});

module.exports = router;