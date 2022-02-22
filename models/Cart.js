const mongoose = require('mongoose');

const requiredString = {
    type: String,
    require: true
}

const cartSchema = new mongoose.Schema({
    inventory_id: [{ type: mongoose.Schema.Types.ObjectId, ref:'inventories'}],
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref:'customers' },
    order_quantity: {
        type: Number
    },
});

const CartModel = mongoose.model('carts',cartSchema);
module.exports = CartModel;