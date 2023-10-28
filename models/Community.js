const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        maxlength: 128
    },
    slug: {
        type: String,
        required: true,
        maxlength: 255,
        unique: true
    },
    owner: {
        type: String,
        required: true,
        ref: "User"
    }
},
{
    timestamps: true
}
)

module.exports = mongoose.model('Community', communitySchema)