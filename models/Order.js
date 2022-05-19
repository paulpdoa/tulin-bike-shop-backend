const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    uniqueOrder_id: {
        type: String
    },
    customer_id: {type: mongoose.Schema.Types.ObjectId, ref: 'customer'},
    cart_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cart' }],
    order_status: {
        type: String
    },
    payment_method: {
        type: String
    },
    amount_paid: {
        type: Number,
        required:true
    },
    customized_bikeImg: {
        type: String
    }

},{ timestamps: true });

const OrderModel = mongoose.model('order',orderSchema);
module.exports = OrderModel;