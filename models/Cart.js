const mongoose = require('mongoose');

const requiredString = {
    type: String,
    require: true
}

const cartSchema = new mongoose.Schema({
    inventory_id: [{ type: mongoose.Schema.Types.ObjectId, ref:'inventory' }],
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref:'customer' },
    order_quantity: {
        type: Number
    },
});

const CartModel = mongoose.model('cart',cartSchema);
module.exports = CartModel;