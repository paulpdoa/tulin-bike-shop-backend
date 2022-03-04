const express = require('express');
const route = express.Router();
const { requireAdminAuth, requireCustomerReservationAuth } = require('../middleware/authMiddleware');

// Admin
route.get('/dashboard',requireAdminAuth);

// Customer
route.get('/reservation',requireCustomerReservationAuth);

module.exports = route;