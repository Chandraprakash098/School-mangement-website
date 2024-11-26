// backend/controllers/transportController.js
const Transport = require('../models/Transport');

// Create Bus Route
exports.createBusRoute = async (req, res) => {
  try {
    const { 
      busNumber, 
      routeNumber, 
      startLocation, 
      endLocation, 
      departureTime, 
      arrivalTime, 
      stops,
      driver,
      capacity
    } = req.body;

    // Check if bus number already exists
    const existingRoute = await Transport.findOne({ busNumber });
    if (existingRoute) {
      return res.status(400).json({ message: 'Bus route already exists' });
    }

    const busRoute = new Transport({
      busNumber,
      routeNumber,
      startLocation,
      endLocation,
      departureTime,
      arrivalTime,
      stops,
      driver,
      capacity,
      currentPassengers: 0
    });

    await busRoute.save();
    res.status(201).json(busRoute);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update Bus Route
exports.updateBusRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const updateData = req.body;

    const busRoute = await Transport.findByIdAndUpdate(
      routeId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!busRoute) {
      return res.status(404).json({ message: 'Bus route not found' });
    }

    res.json(busRoute);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get All Bus Routes
exports.getAllBusRoutes = async (req, res) => {
  try {
    const busRoutes = await Transport.find();
    res.json(busRoutes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Specific Bus Route
exports.getBusRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const busRoute = await Transport.findById(routeId);

    if (!busRoute) {
      return res.status(404).json({ message: 'Bus route not found' });
    }

    res.json(busRoute);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Delete Bus Route
exports.deleteBusRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const busRoute = await Transport.findByIdAndDelete(routeId);

    if (!busRoute) {
      return res.status(404).json({ message: 'Bus route not found' });
    }

    res.json({ message: 'Bus route deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};