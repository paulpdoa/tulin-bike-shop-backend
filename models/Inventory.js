const mongoose = require('mongoose');
const { Schema } = mongoose;

const requiredString = {
    type: String,
    require: true
}

const inventorySchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    product_image: requiredString,
    product_type: requiredString,
    brand_name: {
        type: String,
        required:[true, 'Please enter the brand of the product']
    },
    product_name: {
        type: String,
        required:[true, 'Please enter the name of the product']
    },
    product_size: {
        type: String,
        required: [true, 'Please enter the size of the product']
    },
    product_color: {
        type: String
    },
    product_quantity: {
        type: Number,
        required: [true, 'Please enter the quantity of the product']
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

inventorySchema.statics.accessory = async function(type) {
const product = this.find({ "product_type": type });
    if(product) {
        return product;
    }
    throw Error('Nothing to display');
}

inventorySchema.statics.bike = async function(type) {
const product = this.find({ "product_type": type });
    if(product) {
        return product;
    }
    throw Error('Nothing to display');
}

inventorySchema.statics.part = async function(type) {
    const product = this.find({ "product_type": type });
        if(product) {
            return product;
        }
        throw Error('Nothing to display');
    }


const InventoryModel = mongoose.model('inventories', inventorySchema);
module.exports = InventoryModel;