const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    img:String,
    name:String,
    price:Number,
    description:String
});

module.exports = mongoose.model('MenuItem',menuItemSchema);