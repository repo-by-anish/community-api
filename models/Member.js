const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    community: {
        type: String,
        required: true,
        ref: 'Community'
    },
    user: {
        type: String,
        required: true,
        ref: 'User'
    },
    role: {
        type: String,
        required: true,
        ref: 'Role'
    }
})

module.exports = mongoose.model('Member', memberSchema)