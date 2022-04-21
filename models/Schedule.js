const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    customer_id: {type: mongoose.Schema.Types.ObjectId, ref: 'customer'},
    reserved_date: {
        type: String,
        required: true
    },
    reserved_time: {
        type:String,
        required:true
    },
    concern_image: {
        type: String
    },
    customer_concern: {
        type: String
    },
    schedule_status: {
        type: String
    }
},{ timestamps: true })

const ScheduleModel = mongoose.model('schedule',scheduleSchema);
module.exports = ScheduleModel;