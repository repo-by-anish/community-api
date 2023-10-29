const Member = require("../models/Member");
const { Snowflake } = require("@theinternetfolks/snowflake");
const Role = require("../models/Role");
const { isAdmin, isModerator } = require("../config/isCommAdmin");
const Community = require("../models/Community");

// checked
const createMember = async (req, res) => {
    const id = Snowflake.generate({ timestamp: Number(process.env.SNOWFLAKE_TIMESTAMP), shard_id: 4 });
    const userId = req.user.id;
    const { community, user, role } = req.body;
    if (!community || !user || !role) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const admin = await isAdmin(userId);
    if (!admin) {
        return res.status(401).json({ message: "NOT_ALLOWED_ACCESS" });
    }
    try {
        const memberExists = await Member.findOne({ id });
        if (memberExists) {
            return res.status(400).json({ message: "Member already exists" });
        }
        const newMember = await Member.create({ id, community, user, role });
        if (newMember) {
            const formattedData = {
                status: true,
                content: {
                    data: {
                        id: newMember.id,
                        community: newMember.community,
                        user: newMember.user,
                        role: newMember.role,
                        created_at: newMember.createdAt
                    }
                }
            }
            res.status(201).json(formattedData);
        } else {
            res.status(500).json({ message: "Failed to create member" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// checked
const deleteMember = async (req, res) => {
    const { id } = req.params;
    const admin = await isAdmin(req.user.id);
    const moderator = await isModerator(req.user.id);
    if (!admin && !moderator) {
        return res.status(401).json({ message: "NOT_ALLOWED_ACCESS" });
    }

    try {
        const member = await Member.findOne({ id });
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
        const resp = await member.deleteOne();
        if (resp) {
            return res.status(200).json({
                status: true
            });
        }

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

module.exports = {
    createMember,
    deleteMember
}
