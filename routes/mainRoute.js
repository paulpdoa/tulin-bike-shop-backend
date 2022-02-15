const express = require('express');
const route = express.Router();

const mainController = require('../controllers/mainController');

// Admin Requests
route.get('/admin', mainController.admin_get);
route.get('/adminlogout', mainController.admin_logout_get);
route.post('/admin', mainController.admin_signup_post);
route.post('/adminlogin', mainController.admin_login_post);

// Customer Requests
route.get('/customer', mainController.customer_get);
route.get('/customerlogout',mainController.customer_logout_get);
route.get('/customerforgetpassword/:account', mainController.customer_get_username_fp);
route.get('/customer/:id',mainController.customer_detail_get);
route.get('/sendcodetoverify/:id', mainController.customer_resend_code_to_verify);
route.post('/customer', mainController.customer_signup_post);
route.post('/customerlogin', mainController.customer_login_post);
route.put('/customerdelete/:id', mainController.customer_deleteAccount_put);
route.put('/customerverify/:id', mainController.customer_verify_put);
route.put('/customerresetpassword/:id', mainController.customer_reset_password);

// Inventory Requests
route.get('/inventory', mainController.inventory_get);

// Payment Method Requests
route.get('/paymentmethod', mainController.paymentmethod_get);

module.exports = route;