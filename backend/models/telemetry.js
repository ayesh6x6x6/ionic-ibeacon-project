const mongoose = require('mongoose');

const beaconSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    id: String,
    shortId: String,
    temperature: Number
});

module.exports = mongoose.model('Telemetry',beaconSchema);