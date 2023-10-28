const Role = require("../models/Role");
const { Snowflake } = require("@theinternetfolks/snowflake");

// Checked
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().select("-scopes").lean();
        if (!roles.length) {
            return res.status(404).json({ message: "Roles not found" });
        }

        const formattedData = {
            content: {
                meta: {
                    total: roles.length,
                    pages: 1,
                    page: 1,
                },
                data: roles.map((role) => ({
                    "id": role.id,
                    "name": role.name,
                    "created_at": role.createdAt,
                    "updated_at": role.updatedAt,
                })),
            },
        };

        res.status(200).json(formattedData);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
// Checked
const createRole = async (req, res) => {
    const id = Snowflake.generate({ timestamp: Number(process.env.SNOWFLAKE_TIMESTAMP), shard_id: 4 });
    const { name, scopes } = req.body;
    if (!id || !name || !scopes?.length) {
        return res.status(400).json({ message: "Please fill all fields" });
    }
    try {
        const roleExists = await Role.findOne({ id });
        if (roleExists) {
            return res.status(400).json({ message: "Role already exists" });
        }
        const newRole = new Role({ id, name, scopes });
        await newRole.save();
        res.status(201).json(newRole);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

module.exports = {
    createRole,
    getAllRoles
}