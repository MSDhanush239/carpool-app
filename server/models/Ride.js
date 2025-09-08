const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  startLocation: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  costPerPerson: {
    type: Number,
    required: true,
    min: 0
  },
  genderPreference: {
    type: String,
    enum: ['any', 'male', 'female'],
    default: 'any'
  },
  passengers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  description: {
    type: String,
    trim: true
  },
  vehicleInfo: {
    make: String,
    model: String,
    color: String,
    licensePlate: String
  }
}, {
  timestamps: true
});

// Virtual for joined members count
rideSchema.virtual('joinedMembers').get(function() {
  return this.passengers.length;
});

// Ensure virtual fields are serialized
rideSchema.set('toJSON', { virtuals: true });

// Update available seats when passengers are added/removed
rideSchema.pre('save', function(next) {
  this.availableSeats = this.totalSeats - this.passengers.length;
  next();
});

module.exports = mongoose.model('Ride', rideSchema);

