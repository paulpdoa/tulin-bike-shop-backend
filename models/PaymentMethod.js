const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    paymentmethod: {
        type: String
    }
})

const PaymentMethodModel = mongoose.model('payment_method',paymentMethodSchema);
module.exports = PaymentMethodModel;