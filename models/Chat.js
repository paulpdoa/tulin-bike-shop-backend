const mongoose = require('mongoose');

const requiredString = {
    type:String,
    required:true
}

const chatSchema = new mongoose.Schema({
    room: requiredString,
    user: requiredString,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'customer' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'customer' },
    message: requiredString,
    day: requiredString,
    time: requiredString

},{ timestamps: true })

const ChatModel = mongoose.model('chat', chatSchema);
module.exports = ChatModel;