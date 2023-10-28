const mongoose = require("mongoose")

const roleSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 64,
        unique: true
    },
    scopes: {
        type: [String],
        required: true
    },
},
{
    timestamps: true
}
)

module.exports = mongoose.model('Role', roleSchema)