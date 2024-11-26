// backend/models/Transport.js
const mongoose = require('mongoose');

const TransportSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true
  },
  routeNumber: {
    type: String,
    required: true
  },
  startLocation: {
    type: String,
    required: true
  },
  endLocation: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  stops: [{
    location: String,
    time: String
  }],
  driver: {
    name: String,
    contact: String
  },
  capacity: {
    type: Number,
    required: true
  },
  currentPassengers: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Transport', TransportSchema);