const express = require('express');
const router = express.Router();
const Booking = require('../modals/Booking');

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { userId, serviceId, serviceName, date, time, hours, totalPrice, location } = req.body;

    const newBooking = new Booking({
      userId,
      serviceId,
      serviceName,
      date,
      time,
      hours,
      totalPrice,
      location,
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

module.exports = router;
