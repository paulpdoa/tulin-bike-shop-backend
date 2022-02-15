require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { upload } = require('../middleware/uploadMiddleware');

const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');
const PaymentMethod = require('../models/PaymentMethod');

// Error handling
const handleErrors = (err) => {
    console.log(err.message,err.code);
    let errors = { email:'',username:'',password:'' };
    // Duplicate error code
    if(err.code === 11000) {
        errors.username= 'this username is already registered';
        errors.email='this email is already registered';
        return errors;
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
    return errors;
}

// Generate Nodemailer 
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'adrain.wolf52@ethereal.email', // generated ethereal user
        pass: 'SPqZvVC5VD34gF7swB', // generated ethereal password
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
        res.cookie('adminJwt', token, { maxAge: maxAge * 1000 });
        res.status(200).json({ admin: admin._id, redirect:'/dashboard',adminName: admin.username });
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
    const { firstname,lastname,username,email,password } = req.body;
    const verified = false;
    const code = Math.floor(Math.random() * 100000);
    const status = 'active';

    const htmlContent = `
    <h1>Hi ${firstname}!</h1>
    
    <h2>${code}</h2>
    <p>It seems like you registered with this account. Please use this code to verify your account</p>

    <p>Thank you for using Tulin Bicycle Shop! Enjoy Shopping!</p>
    `

    try {
        const newCustomer = await Customer.create({ firstname,lastname,username,email,password,verified,status,code });
        const info = await transporter.sendMail({
            from: "'Tulin Bicycle Shop' <adrain.wolf52@ethereal.email>",
            to: `${newCustomer.email}`,
            subject: 'Account verification',
            html: htmlContent
        });
        console.log("Message was sent: " + info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

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
            res.json({ mssg: 'Thank you for verifying your account!', redirect:'/login' });
        }
    })
    
}

module.exports.customer_login_post = async (req,res) => {
    const { username,password } = req.body;

    try {
        const customer = await Customer.login(username,password);
        if(customer.verified) {
            const token = createToken(customer._id);
            res.cookie('customerJwt', token, { maxAge: maxAge * 1000 });
            res.status(201).json({ customerId: customer._id, redirect:'/',mssg: `Welcome ${customer.username}!`,customerFirstname: customer.firstname,customerSurname:customer.lastname });
        } else {
            res.status(201).json({ mssg:'this user is not yet verified, please verify your account',verify_id: customer._id });
        }
    }
    catch(err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
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
                from: "'Tulin Bicycle Shop' <adrain.wolf52@ethereal.email>",
                to: `${result.email}`,
                subject: 'Account verification',
                html: htmlContent
            });
            console.log("Message was sent: " + info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    })

    res.json({mssg:'An email was sent'});

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