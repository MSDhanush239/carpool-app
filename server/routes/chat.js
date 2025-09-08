const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Ride = require('../models/Ride');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat/:rideId
// @desc    Get messages for a specific ride
// @access  Private
router.get('/:rideId', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is part of this ride (driver or passenger)
    const isDriver = ride.driver.toString() === req.user._id.toString();
    const isPassenger = ride.passengers.some(
      passenger => passenger.user.toString() === req.user._id.toString()
    );

    if (!isDriver && !isPassenger) {
      return res.status(403).json({ message: 'Not authorized to view messages for this ride' });
    }

    const messages = await Message.find({ ride: req.params.rideId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// @route   POST /api/chat/:rideId
// @desc    Send a message to a ride chat
// @access  Private
router.post('/:rideId', auth, [
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is part of this ride (driver or passenger)
    const isDriver = ride.driver.toString() === req.user._id.toString();
    const isPassenger = ride.passengers.some(
      passenger => passenger.user.toString() === req.user._id.toString()
    );

    if (!isDriver && !isPassenger) {
      return res.status(403).json({ message: 'Not authorized to send messages to this ride' });
    }

    const message = new Message({
      ride: req.params.rideId,
      sender: req.user._id,
      message: req.body.message
    });

    await message.save();
    await message.populate('sender', 'name email');

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

module.exports = router;

