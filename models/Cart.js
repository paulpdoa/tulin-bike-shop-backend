const mongoose = require('mongoose');

const requiredString = {
    type: String,
    required: true
}

const cartSchema = new mongoose.Schema({
    inventory_id: [{ type: mongoose.Schema.Types.ObjectId, ref:'inventory' }],
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref:'customer' },
    order_quantity: {
        type: Number
    },
    order_status: requiredString
});

const CartModel = mongoose.model('cart',cartSchema);
module.exports = CartModel;