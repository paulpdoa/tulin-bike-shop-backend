const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter your username'],
        unique:true,
        lowercase:true,
    },
    password: {
        type: String,
        required: [true,'Please enter a password'],
        minlength: [8, 'Minimum password length is 8 characters']
    },
    role: {
        type: String
    }
})

//fire a function before saving to db
adminSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password,salt);
    next();
})
//static method to login admin
adminSchema.statics.login = async function(username,password) {
    const admin = await this.findOne({ username });
    if(admin) {
        const auth = await bcrypt.compare(password, admin.password);
        if(auth) {
            return admin;
        }
        throw Error('Incorrect password');
    }
    throw Error('This username doesn\'t exist')
}


const AdminModel = mongoose.model('admin', adminSchema);
module.exports = AdminModel;