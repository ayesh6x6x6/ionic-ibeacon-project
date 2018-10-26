const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    customer:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    bill:Number,
    items:[{type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem'}]
});

module.exports = mongoose.model('Order',orderSchema);