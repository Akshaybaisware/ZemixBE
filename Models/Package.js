const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    packagename: {
        type: String,


    },
    noofFroms: {
        type: String,
    },
    date: {
        type: String
    }



});

module.exports = mongoose.model('Package', packageSchema);