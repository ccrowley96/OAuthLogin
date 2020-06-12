const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    googleObj: {
        type: Object,
        required: true
    }
});
module.exports = mongoose.model('User', userSchema)