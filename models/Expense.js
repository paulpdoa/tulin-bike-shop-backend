const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    }
},{ timestamps: true })

const ExpenseModel = mongoose.model('expense', expenseSchema);
module.exports = ExpenseModel;