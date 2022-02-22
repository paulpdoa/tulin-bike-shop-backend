const express = require('express');
const route = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const { requireCustomerAuth } = require('../middleware/authMiddleware');

const { 
    admin_get,admin_logout_get,admin_signup_post,admin_login_post,
    customer_get,customer_logout_get,customer_get_username_fp,customer_detail_get,
    customer_resend_code_to_verify,customer_signup_post,customer_login_post,
    customer_deleteAccount_put,customer_verify_put,customer_reset_password,
    inventory_get,paymentmethod_get, inventory_post, inventory_accessory_get, 
    inventory_bike_get,inventory_part_get,inventory_detail_get,cart_post, 
    cart_get,
    customer_cart_get} 
    = require('../controllers/mainController');

// Admin Requests
route.get('/admin', admin_get);
route.get('/adminlogout', admin_logout_get);
route.post('/admin', admin_signup_post);
route.post('/adminlogin', admin_login_post);

// Protect Routes

// Customer Requests
route.get('/customer', customer_get);
route.get('/customerlogout',customer_logout_get);
route.get('/customerforgetpassword/:account', customer_get_username_fp);
route.get('/customer/:id',customer_detail_get);
route.get('/sendcodetoverify/:id', customer_resend_code_to_verify);
route.post('/customer', customer_signup_post);
route.post('/customerlogin', customer_login_post);
route.put('/customerdelete/:id', customer_deleteAccount_put);
route.put('/customerverify/:id', customer_verify_put);
route.put('/customerresetpassword/:id', customer_reset_password);

// Inventory Requests
route.get('/inventory', inventory_get);
route.get('/inventory/accessory',inventory_accessory_get);
route.get('/inventory/bike', inventory_bike_get);
route.get('/inventory/part', inventory_part_get);
route.get('/inventory/:id',inventory_detail_get);
route.post('/inventory', upload.single('product_image'), inventory_post);

//Cart Requests
route.get('/cart',cart_get);
route.get('/cart/:id',customer_cart_get);
route.post('/cart',cart_post);
// Payment Method Requests
route.get('/paymentmethod', paymentmethod_get);

module.exports = route;