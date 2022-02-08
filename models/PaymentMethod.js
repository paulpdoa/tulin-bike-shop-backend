const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    paymentmethod: {
        type: String
    }
})

const PaymentMethodModel = mongoose.model('payment_methods',paymentMethodSchema);
module.exports = PaymentMethodModel;