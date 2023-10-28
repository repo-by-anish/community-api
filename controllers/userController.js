const User = require("../models/User");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").lean()
        if (users.length) {
            res.status(200).json(users)
        }else{
            res.status(404).json({ message: "Users not found" })
        }
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

module.exports = {
    getAllUsers,
}