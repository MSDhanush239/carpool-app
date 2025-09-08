const express = require('express');
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/rides
// @desc    Create a new ride
// @access  Private
router.post('/', auth, [
  body('destination').trim().isLength({ min: 1 }).withMessage('Destination is required'),
  body('startLocation').trim().isLength({ min: 1 }).withMessage('Start location is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').trim().isLength({ min: 1 }).withMessage('Time is required'),
  body('totalSeats').isInt({ min: 1, max: 8 }).withMessage('Total seats must be between 1 and 8'),
  body('costPerPerson').isFloat({ min: 0 }).withMessage('Cost per person must be a positive number'),
  body('genderPreference').optional().isIn(['any', 'male', 'female']).withMessage('Invalid gender preference')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      destination,
      startLocation,
      date,
      time,
      totalSeats,
      costPerPerson,
      genderPreference = 'any',
      description,
      vehicleInfo
    } = req.body;

    const ride = new Ride({
      driver: req.user._id,
      destination,
      startLocation,
      date: new Date(date),
      time,
      totalSeats,
      availableSeats: totalSeats,
      costPerPerson,
      genderPreference,
      description,
      vehicleInfo
    });

    await ride.save();
    await ride.populate('driver', 'name email phone rating');

    res.status(201).json(ride);
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ message: 'Server error creating ride' });
  }
});

// @route   GET /api/rides
// @desc    Get all available rides with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      destination,
      date,
      genderPreference,
      maxCost,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { status: 'active' };

    if (destination) {
      filter.destination = { $regex: destination, $options: 'i' };
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    if (genderPreference && genderPreference !== 'any') {
      filter.$or = [
        { genderPreference: 'any' },
        { genderPreference: genderPreference }
      ];
    }

    if (maxCost) {
      filter.costPerPerson = { $lte: parseFloat(maxCost) };
    }

    const rides = await Ride.find(filter)
      .populate('driver', 'name email phone rating')
      .populate('passengers.user', 'name email phone rating')
      .sort({ date: 1, time: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ride.countDocuments(filter);

    res.json({
      rides,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ message: 'Server error fetching rides' });
  }
});

// @route   GET /api/rides/:id
// @desc    Get a specific ride
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name email phone rating')
      .populate('passengers.user', 'name email phone rating');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ message: 'Server error fetching ride' });
  }
});

// @route   POST /api/rides/:id/join
// @desc    Join a ride
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot join your own ride' });
    }

    if (ride.status !== 'active') {
      return res.status(400).json({ message: 'Ride is not active' });
    }

    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'No available seats' });
    }

    // Check if user already joined
    const alreadyJoined = ride.passengers.some(
      passenger => passenger.user.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this ride' });
    }

    // Check gender preference
    if (ride.genderPreference !== 'any' && ride.genderPreference !== req.user.gender) {
      return res.status(400).json({ message: 'Gender preference does not match' });
    }

    // Add passenger
    ride.passengers.push({ user: req.user._id });
    await ride.save();

    // Update user's joined rides
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedRides: ride._id }
    });

    await ride.populate('driver', 'name email phone rating');
    await ride.populate('passengers.user', 'name email phone rating');

    res.json(ride);
  } catch (error) {
    console.error('Join ride error:', error);
    res.status(500).json({ message: 'Server error joining ride' });
  }
});

// @route   DELETE /api/rides/:id/leave
// @desc    Leave a ride
// @access  Private
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Remove passenger
    ride.passengers = ride.passengers.filter(
      passenger => passenger.user.toString() !== req.user._id.toString()
    );
    
    await ride.save();

    // Update user's joined rides
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedRides: ride._id }
    });

    await ride.populate('driver', 'name email phone rating');
    await ride.populate('passengers.user', 'name email phone rating');

    res.json(ride);
  } catch (error) {
    console.error('Leave ride error:', error);
    res.status(500).json({ message: 'Server error leaving ride' });
  }
});

// @route   GET /api/rides/user/created
// @desc    Get rides created by user
// @access  Private
router.get('/user/created', auth, async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .populate('driver', 'name email phone rating')
      .populate('passengers.user', 'name email phone rating')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    console.error('Get user rides error:', error);
    res.status(500).json({ message: 'Server error fetching user rides' });
  }
});

// @route   GET /api/rides/user/joined
// @desc    Get rides joined by user
// @access  Private
router.get('/user/joined', auth, async (req, res) => {
  try {
    const rides = await Ride.find({ 'passengers.user': req.user._id })
      .populate('driver', 'name email phone rating')
      .populate('passengers.user', 'name email phone rating')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    console.error('Get joined rides error:', error);
    res.status(500).json({ message: 'Server error fetching joined rides' });
  }
});

// @route   PUT /api/rides/:id
// @desc    Update a ride (only by driver)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    const updates = req.body;
    delete updates.driver; // Prevent changing driver
    delete updates.passengers; // Prevent direct passenger manipulation

    Object.assign(ride, updates);
    await ride.save();

    await ride.populate('driver', 'name email phone rating');
    await ride.populate('passengers.user', 'name email phone rating');

    res.json(ride);
  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({ message: 'Server error updating ride' });
  }
});

// @route   DELETE /api/rides/:id
// @desc    Delete a ride (only by driver)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this ride' });
    }

    await Ride.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({ message: 'Server error deleting ride' });
  }
});

module.exports = router;

