const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    product_image: {
        type: String
    },
    product_type: {
        type: String
    },
    brand_name: {
        type: String,
        required:[true, 'Please enter the brand of the product']
    },
    product_name: {
        type: String,
        required:[true, 'Please enter the name of the product']
    },
    product_price: {
        type: Number,
        required:[true, 'Please enter the price of the product']
    },
    product_description: {
        type: String,
        required:[true, 'Please enter description for the product']
    }

});

const InventoryModel = mongoose.model('inventories', inventorySchema);
module.exports = InventoryModel;