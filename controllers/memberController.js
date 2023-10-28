const Member = require("../models/Member");
const{ Snowflake } = require("@theinternetfolks/snowflake")

// Unchecked
const createMember = async (req, res) => {
    const id = Snowflake.generate({ timestamp: Number(process.env.SNOWFLAKE_TIMESTAMP), shard_id: 4 });
    const { community, user, role } = req.body;
    try {
        const memberExists = await Member.findOne({ id });
        if (memberExists) {
            return res.status(400).json({ message: "Member already exists" });
        }
        const newMember = await Member.create({ id, community, user, role });
        if (newMember) {
            res.status(201).json({ message: "Member created successfully" });
        } else {
            res.status(500).json({ message: "Failed to create member" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Unchecked
const deleteMember = async (req, res) => {
    const { id } = req.params;
    try {
        const member = await Member.findOneAndDelete({ id });
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
        res.status(200).json({ message: "Member deleted successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

module.exports = {
    createMember,
    deleteMember
}
