const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer_id: {type: mongoose.Schema.Types.ObjectId, ref: 'customer'},
    cart_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cart' }],
    order_status: {
        type: String
    },
    payment_method: {
        type: String
    }

});

const OrderModel = mongoose.model('order',orderSchema);
module.exports = OrderModel;