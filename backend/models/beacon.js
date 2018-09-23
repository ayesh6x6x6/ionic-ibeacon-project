const mongoose = require('mongoose');

const beaconSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    id: String,
    uuid: String,
    major: Number,
    minor: Number
    
});

module.exports = mongoose.model('Beacon',beaconSchema);