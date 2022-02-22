const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const requiredString = {
    type: String
}

const customerSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Please enter your first name'],
    },
    lastname: {
        type: String,
        required:[true, 'Please enter your last name']
    },
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase:true
    },
    email: {
        type: String,
        unique: true,
        validate: [isEmail, 'Please enter a valid email'],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [8, 'Minimum password length is 8 characters']
    },
    verified: {
        type: Boolean
    },
    status: requiredString,
    code: requiredString,
}); 

// fire a function before saving to database
customerSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password,salt);
    next();
})

// create static login method for user
customerSchema.statics.login = async function(username,password) {
    const customer = await this.findOne({ username });
    if(customer) {
        const auth = await bcrypt.compare(password,customer.password);
        if(auth) {
            return customer;
        }
        throw Error('Incorrect password');
    }
    throw Error('This username doesn\'t exist');
}

customerSchema.statics.resetPassword = async function(id,password) {
    const customer = await this.findById(id);
    if(customer) {
        const salt = await bcrypt.genSalt();
        const newPassword = await bcrypt.hash(password,salt);
        return newPassword;
    }
}

const CustomerModel = mongoose.model('customers', customerSchema);
module.exports = CustomerModel;