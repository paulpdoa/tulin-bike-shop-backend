require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');
const Cart = require('../models/Cart');
const Schedule = require('../models/Schedule');
const PaymentMethod = require('../models/PaymentMethod');
const Order = require('../models/Order');
const Chat = require('../models/Chat');

// Error handling
const handleErrors = (err) => {
    console.log(err.message,err.code);
   
    let errors = { email:'',username:'',mobile: '' };

    // for duplicates
    if(err.message.includes('customer validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
            if(properties.path === 'username') {
                errors.username = 'this username is already registered';
            }
            if(properties.path === 'email') {
                errors.email = 'this email is already registered';
            }
        })
    }

    // Incorrect username
    if(err.message === 'This username doesn\'t exist') {
        errors.username = 'this username doesn\'t exist';
    }
    // Incorrect password
    if(err.message === 'Incorrect password') {
        errors.password = 'this password is incorrect';
    }

    // validation errors
    if(err.message.includes('admins validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }

    if(err.message.includes('inventories validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}

// Generate Nodemailer 
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_ACCOUNT, // generated ethereal user
        pass: process.env.MAIL_PASSWORD, // generated ethereal password
    }
});

// Create jwt
const maxAge = 3 * 24 * 24 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: maxAge
    })
}

// Admin
module.exports.admin_get = (req, res) => {
    Admin.find({}, (err,result) => {
        if(err) {
            res.send(err);
        } else {
            res.json(result);
        }
    })
}

module.exports.admin_signup_post = async (req, res) => {
    const { username,password } = req.body;
   
    try { 
        const newAdmin = await Admin.create({ username,password });
        const token = createToken(newAdmin._id);
        res.status(201).json({ adminId: newAdmin._id ,mssg:`${username} has been created, please wait.`,redirect: '/adminlogin' });
    }
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }    
}

module.exports.admin_login_post = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const admin = await Admin.login(username,password);
        const token = createToken(admin._id);
        res.status(200).cookie('adminJwt', token, { maxAge: maxAge * 1000 }).json({ admin: admin._id, redirect:'/dashboard',adminName: admin.username });
    } 
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }

}

module.exports.admin_logout_get = (req,res) => {
    res.cookie('adminJwt','',{ maxAge: 1 });
    res.json({ redirect:'/adminlogin' });
}

// Customer
module.exports.customer_get = (req,res) => {
    Customer.find({},(err,result) => {
        if(err) {
            res.send(err)
        } else {
            // Remove all inactive users
            const removedInactive = result.filter((res) => res.status === 'active');
            res.json(removedInactive);
        }
    })
}

module.exports.customer_signup_post = async (req, res) => {
    const { firstname,lastname,username,email,mobile,address,barangay,city,province,postalCode,password } = req.body;
    const verified = false;
    const code = Math.floor(Math.random() * 100000);
    const status = 'active';

    const htmlContent = `
    <h1>Hi ${firstname}!</h1>
    
    <h2>${code}</h2>
    <p>It seems like you registered with this account. Please use this code to verify your account</p>

    <p>Thank you for using Tulin Bicycle Shop! Enjoy Shopping!</p>
    `;
    console.log(req.body);

    try {
        const newCustomer = await Customer.create({ firstname,lastname,username,email,mobile,address,barangay,city,province,postalCode,password,verified,status,code });
        const info = await transporter.sendMail({
            from: `'Tulin Bicycle Shop' <${process.env.MAIL_ACCOUNT}>`,
            to: `${newCustomer.email}`,
            subject: 'Account verification',
            html: htmlContent
        });
        
        console.log("Message was sent: " + info.response);
        res.status(201).json({ mssg: `${newCustomer.firstname} has been created, please check your email for verification`, customerId: newCustomer._id,redirect:`/verify/${newCustomer._id}` });
    } 
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.customer_verify_put = (req,res) => {
    const id = req.params.id;
    const { verified } = req.body;

    Customer.findByIdAndUpdate(id,{ verified: verified },(err,result) => {
        if(err) {
            console.log(err);
        } else {
            res.status(201).json({ mssg: 'Thank you for verifying your account!', redirect:'/login' });
        }
    })
}

module.exports.update_profile = async (req,res) => {
    const id = req.params.id;
    const { password } = req.body;
    const salt = await bcrypt.genSalt();

    try {
        const updatePassword = await Customer.findByIdAndUpdate(id,{ password: await bcrypt.hash(password,salt) });
        res.status(201).json({mssg:'Password was updated'});
    }
    catch(err) {
        console.log(err.message)
    }
}

module.exports.customer_login_post = async (req,res) => {
    const { username,password } = req.body;

    try {
        const customer = await Customer.login(username,password);
        if(customer.verified) {
            const token = createToken(customer._id);
            res.status(201)
            .cookie('customerJwt', token, { maxAge: maxAge * 1000 })
            .json({ customerId: customer._id, redirect:'/',mssg: `Welcome ${customer.username}!`,customerFirstname: customer.firstname,customerSurname:customer.lastname });
        } else {
            res.status(201).json({ mssg:'this user is not yet verified, please verify your account',verify_id: customer._id });
        }
    }
    catch(err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
    }
}

module.exports.customer_upload_profile_picture = async(req,res) => {
    const id = req.params.id;
    const { filename } = req.file;
    
    try {
        const data = await Customer.findByIdAndUpdate(id, { profilePicture: filename });
        res.status(201).json({ mssg:'Profile picture has been uploaded' })
    }
    catch(err) {
        console.log(err);
    }


}
// If the user tries to login with not verified account, resend the email
module.exports.customer_resend_code_to_verify = async (req, res) => {
    const id = req.params.id;

    Customer.findById(id,async (err,result) => {
        if(err) {
            console.log(err);
        } else {
            const htmlContent = `
                <h1>Hi ${result.firstname} ${result.lastname}!</h1>

                <h2>${result.code}</h2>
                <p>It seems like you want to verify this account. If this is not you, please ignore this email.</p>

                <p>Thank you for using Tulin Bicycle Shop! Enjoy Shopping!</p>
                `
            const info = await transporter.sendMail({
                from: `'Tulin Bicycle Shop' <${process.env.MAIL_ACCOUNT}>`,
                to: `${result.email}`,
                subject: 'Account verification',
                html: htmlContent
            });
            console.log("Message was sent: " + info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    })

    res.status(200).json({mssg:'An email was sent'});

}

module.exports.customer_logout_get = (req,res) => {
    res.cookie('customerJwt','',{ maxAge: 1 });
    res.cookie('customerId','',{ maxAge: 1 });
    res.json({ redirect: '/login' })
}

module.exports.customer_detail_get = (req, res) => {
    const id = req.params.id;
    
    Customer.findById(id, (err,result) => {
        if(err) {
            res.send(err);
        } else {
            if(result.status === 'active') {
                res.status(200).json(result);
            }
        }
    }) 
}

module.exports.customer_deleteAccount_put = (req,res) => {
    const id = req.params.id;
    const { status } = req.body;
    
    Customer.findByIdAndUpdate(id,{ status:status },(err,result) => {
        if(err) {
            console.log(err)
        } else {
            res.cookie('customerJwt','',{ maxAge: 1 });
            res.cookie('customerId','',{ maxAge: 1 });
            res.json({ redirect:'/login', mssg:'Your account has been deleted' });
        }
    })
}

module.exports.customer_send_email = async (req,res) => {
    const { message,name,email,subject } = req.body;
    const htmlContent = `
    <h1>Good day admin!</h1>
    <h2>A message was sent to you by ${email}</h2>

    <p>${message}</p>
    `
    const info = await transporter.sendMail({
        from: `${name} <${email}>`,
        to: `${process.env.MAIL_ACCOUNT}`,
        subject: subject,
        html: htmlContent
    });
    console.log("Message was sent: " + info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.status(201).json({ mssg: 'Your email has been sent to Tulin Bicycle Shop' })
}

// Used for forgot password
module.exports.customer_get_username_fp = (req,res) => {
    const account = req.params.account;

    Customer.findOne({$or: [{email: account}, {username: account}]}, async (err,result) => {
        if(err) {
            console.log(err)
        } else {
            res.json({ redirect: `/resetpassword/${result.id}` });
        }
    })
}
// Reset user password
module.exports.customer_reset_password = async (req,res) => {
    const id = req.params.id;
    const { password } = req.body;
    
    try {
        const newPassword = await Customer.resetPassword(id,password);
        Customer.findByIdAndUpdate(id,{ password: newPassword },(err,result) => {
            if(err) {
                console.log(err)
            } else {
                res.status(200).json({ mssg: 'password has been updated',redirect:'/login' })
            }
        })
    }
    catch(err) {
        const errors = handleErrors(err);
        res.status(500).json(errors);
    }   
}

// Inventory
module.exports.inventory_get = (req,res) => {
    Inventory.find({},(err,result) => {
        if(err) {
            console.log(err) 
        } else {
            res.json(result);
        }
    })
}

module.exports.inventory_post = async (req,res) => {
    const { product_type,brand_name,product_name,product_size,product_price,product_description,product_color,product_quantity } = req.body;
    const {filename} = req.file;
    
    try {
        const product = await Inventory.insertMany({ product_image:filename,product_type,brand_name,product_name,product_size,product_price,product_description,product_color,product_quantity });
        res.status(201).json({ mssg: 'product has been added',redirect:'/dashboard' });
    } 
    catch(err) {
        console.log(err);
    }
}

module.exports.inventory_accessory_get = async (req,res) => {
    const type = 'Accessory';

    try {
        const accessories = await Inventory.accessory(type);
        res.json(accessories);
    }
    catch(err) {
        console.log(err);
    }
}

module.exports.inventory_bike_get = async (req,res) => {
    const type = 'Bicycle';

    try {
        const bikes = await Inventory.bike(type);
        res.json(bikes);
    }
    catch(err) {
        console.log(err);
    }
}

module.exports.inventory_part_get = async (req,res) => {
    const type = 'Part';

    try {
        const parts = await Inventory.part(type);
        res.json(parts);
    }
    catch(err) {
        console.log(err);
    }
}

module.exports.inventory_detail_get = async(req,res) => {
    const id = req.params.id;
    
    try {
        const product = await Inventory.findById(id);
        res.status(200).json(product);
    }
    catch(err) {
        console.log(err);
    }
}

// Carts

module.exports.cart_get = async (req,res) => {

    try {
        const orders = await Cart.find().populate('inventory_id customer_id');
        res.json(orders);
    }
    catch(err) {
        console.log(err)
    }
}

module.exports.cart_post = async (req,res) => {
    const { inventory_id,order_quantity,customer_id } = req.body.productToAdd;
    const order_status = 'pending';

    try {
        const productExist = await Cart.find({$and: [{'inventory_id':inventory_id},{'customer_id': customer_id},{'order_status':order_status}]});
        if(productExist.length < 1) {
            const data = await Cart.create({ inventory_id, customer_id, order_quantity,order_status });
            res.status(201).json({ redirect:`/cart/${customer_id}`, mssg:'item has been added to cart' });
        } else {
            const addQuantity = await Cart.findByIdAndUpdate(productExist[0]._id,{ order_quantity: productExist[0].order_quantity + order_quantity });
            res.status(201).json({ redirect:`/cart/${customer_id}`,mssg: 'item has been added to cart' });
        }
    }
    catch(err) {
        console.log(err);
    }
}

//for pending orders
module.exports.customer_cart_get = async (req,res) => {
    const id = req.params.id;

    try {
        const customerCart = await Cart.find({$and: [{'customer_id': id},{'order_status':'pending'}]}).populate('inventory_id');
        res.status(200).json(customerCart);
    }
    catch(err) {
        console.log(err);
    }
}

// For already in process
module.exports.customer_cart_get_processing = async (req,res) => {
    const id = req.params.id;

    try {
        const customerCart = await Cart.findById(id,{'order_status':'processing'}).populate('inventory_id');
        res.status(200).json(customerCart);
    }
    catch(err) {
        console.log(err);
    }
}

module.exports.cart_delete = async(req,res) => {
    const id = req.params.id;

    try {
        const deletedCartItem = await Cart.findByIdAndDelete(id);
        res.status(200).json({ mssg:'item was deleted' });
    }
    catch(err) {
        console.log(err);
    }
}

module.exports.order_customer_received = async(req,res) => {
    const { id } = req.body;
    
    try {
        const receiveOrder = await Order.findByIdAndUpdate(id, { 'order_status':'ordered' });
        console.log(receiveOrder);
        res.status(201).json({ mssg: 'order has been received by the customer' });
    }
    catch(err) {
        console.log(err);
    }
}

// Payment Method
module.exports.paymentmethod_get = (req,res) => {
    PaymentMethod.find({},(err,result) => {
        if(err) {
            console.log(err)
        } else {
            res.json(result);
        }
    })
}

// Scheduling
module.exports.schedule_get = async (req,res) => {
    
    try {
        const data = await Schedule.find().populate('customer_id');
        res.status(200).json(data);
    }
    catch(err) {
        console.log(err);
    }
}

module.exports.schedule_detail_get = async (req,res) => {
    const id = req.params.id;

    try {
        const schedDetail = await Schedule.findById(id).populate('customer_id');
        res.status(200).json(schedDetail);
    }
    catch(err) {
        console.log(err);
    }
}

module.exports.schedule_post = async (req,res) => {
    const { reserved_date,reserved_time,customer_concern,customer_id } = req.body;
    const { filename } = req.file;
    const status = 'pending';

        // 1. If the customer already had it's schedule in a week, dont allow him, else allow.
        // 2. Send a message to the frontend if the customer is allowed or not.
        // 3. If the schedule was approved, dont allow to make another schedule
        // 4. If there is a customer with that id, then check if the status is pending, if pending, approve, else don't

        // Limit only up to 5pm and should be unique per date
        // 1. if the customer selects a time that is already existing in that date, don't allow, else allow

        try {
            const checkCustomer = await Schedule.find({ 'customer_id': customer_id}); //checks the customer if existing in the db
            const getReservedDate = await Schedule.find({ 'reserved_date': reserved_date });
            if(checkCustomer.length > 0) { //check if there are customer with that id
                if(checkCustomer[0].schedule_status === 'pending') { //check if the status of the found customer is pending
                    // This block should check if the scheduled date is within this week
                    res.status(200).json({ mssg: 'You are not allowed to have a schedule, your schedule is still pending, please wait for approval.' });
                } else {
                    res.status(201).json({ mssg: 'You currently have a schedule, please check your email to see if your schedule is approved.', redirect:'/' })
                }
            } else {
                const schedule = await Schedule.create({ customer_id,reserved_date,reserved_time,customer_concern,concern_image:filename,schedule_status:status });
                res.status(201).json({ mssg: 'Please wait for approval, an email will be sent to you', redirect:'/' })
            }
        }
        catch(err) {
            console.log(err);
        }
}

module.exports.schedule_approve_customer = async (req,res) => {
    const id = req.params.id;
    const { schedule_status } = req.body;

    try {
        const approvedSchedule = await Schedule.findByIdAndUpdate(id,{ 'schedule_status':schedule_status }).populate('customer_id');

        const htmlContent = `
                <h1>Hi ${approvedSchedule.customer_id.firstname}!</h1>

                <p>Hello! Your Schedule was already approved!</p>
                <h2>${approvedSchedule.reserved_date} at ${approvedSchedule.reserved_time}</h2>

                <p>See you at the store!</p>
                `
            const info = await transporter.sendMail({
                from: `'Tulin Bicycle Shop' <${process.env.MAIL_ACCOUNT}>`,
                to: `${approvedSchedule.customer_id.email}`,
                subject: 'Schedule Confirmation',
                html: htmlContent
            });
            console.log("Message was sent: " + info.messageId);
            res.status(201).json({ mssg: 'schedule has been approved, the customer will receive an email' });
    }
    catch(err) {
        console.log(err);
    }
   
}

// Orders

module.exports.order_get = async(req,res) => {

    try {
        const orders = await Order.find().populate({
            path: 'cart_id',
            populate: {
                path:'inventory_id'
            }
        });
        res.status(200).json(orders);
    }
    catch(err) {
        console.log(err);
    }
}

// For all new orders
module.exports.new_order_get = async(req,res) => {
    try {
        const newOrders = await Order.find({ 'order_status':'pending' }).populate({
            path:'cart_id',
            populate: {
                path:'inventory_id',
            }
        });
        res.status(200).json(newOrders);
    } 
    catch(err) {
        console.log(err);
    }
}
// For all ordered items
module.exports.ordered_item_get = async(req,res) => {
    try {
        const orderedItem = await Order.find({ 'order_status': 'ordered' }).populate({
            path:'cart_id',
            populate: {
                path:'inventory_id'
            }
        });
        res.status(200).json(orderedItem);
    }
    catch(err) {
        console.log(err);
    }
}

module.exports.customer_order_get = async(req,res) => {
    const id = req.params.id;

    try {   
        // Deep population to populate inside a populated data
        const customerOrders = await Order.find({ 'customer_id':id }).populate({
            path: 'cart_id',
            populate: {
                path: 'inventory_id',
            }
        });
        res.status(200).json(customerOrders);
    }
    catch(err) {
        console.log(err);
    }
}
//for getting the details of item ordered and the item itself, WILL BE USED FOR CART
module.exports.cart_customer_order_detail = async (req,res) => {
    const id = req.params.id;
   
    try {
        const cartItem = await Cart.findById(id).populate('customer_id inventory_id');
        res.status(200).json(cartItem);
    }
    catch(err) {
        res.send(err);
        console.log(err)
    }
}

// module.exports.test_code = () => {
//     let uniqueString = '';
//     const keys = ['A','0','a','1','B','2','b','3','c','4','C','D','5','d','6','E','7','e','8','F','9','f','G','g','H','h','I','i','J','j','K','k'];
    
//     // This code just generates random string
//     for(let i = 0; i < 16; i++) {
//         uniqueString += keys[Math.floor(Math.random() * keys.length)];
//     }
// }

module.exports.order_post = async(req,res) => {
    // In this code, Whenever there is an order, it deducts the ordered quantity to the inventory
    const status = 'pending';
    // Add unique order id for showing the id to the store when claiming for reference
    let uniqueString = '';
    const keys = ['A','0','a','1','B','2','b','3','c','4','C','D','5','d','6','E','7','e','8','F','9','f','G','g','H','h','I','i','J','j','K','k'];
    
    // This code just generates random string
    for(let i = 0; i < 16; i++) {
        uniqueString += keys[Math.floor(Math.random() * keys.length)];
    }
    // const uniqueOrderId = String Generator
    const { id:customerId,cartItemId,paymentMethod,totalAmount } = req.body;
    
    try {
        const postOrder = await Order.insertMany({ customer_id:customerId,cart_id:cartItemId,order_status:status,payment_method:paymentMethod,uniqueOrder_id:uniqueString,amount_paid: totalAmount });
        for(let i = 0; i < cartItemId.length; i++) {
            const cartId = await Cart.findByIdAndUpdate(cartItemId[i],{ 'order_status': 'processing' }).populate('inventory_id');
            const inventory = await Inventory.findByIdAndUpdate(cartId.inventory_id._id,{ 'product_quantity': cartId.inventory_id.product_quantity - cartId.order_quantity });    
        }
        res.status(201).json({ mssg: 'your order has been placed',redirect: `/profile/orders/${customerId}` });
    }
    catch(err) {
        console.log(err);
    }
}

module.exports.cancel_order = async(req,res) => {
    const { id } = req.body;

    try {
        const cancelOrder = await Order.findByIdAndUpdate(id,{ 'order_status': 'cancelled' });
        res.status(200).json({ mssg: 'Your order was successfully cancelled',redirect: '/' });
    }
    catch(err) {
        console.log(err);
    }
}

// Chat Application
module.exports.chat_get = async(req,res) => {
    
    try {
        const data = await Chat.find().populate('sender receiver');
        res.status(200).json(data);
    }
    catch(err) {
        console.log(err);
    }

}

module.exports.chat_post = async(req,res) => {
    const {room,customer,message,time,day,sender,receiver,user} = req.body;
    
    // The sender is either the customer or admin
    // Use the room variable to get the id of the user,
    // in frontend the id of the user is used as the room id

    try {
        const data = await Chat.create({ room,sender,message,receiver,user,day,time }); 
        console.log(`message was sent by ${customer}-${user}`);
    }
    catch(err) {
        console.log(err);
    }

}

// Sales

module.exports.sales_get = async (req,res) => {
    // HOW TO GET TOTAL SALES FOR THE MONTH?
    // 1. From the first day of the month up to the present, add every income.
    // 2. Filter per month to divide it by month
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    try {
        // From April 1 up to the present day, get total sales.
        const monthlySale = await Order.find({});
        const monthly = monthlySale.map((sale) => sale.createdAt);
        console.log(months[new Date(monthly).getMonth()]);
    }
    catch(err) {
        console.log(err);
    }

}
