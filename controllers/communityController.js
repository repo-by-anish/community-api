const Community = require("../models/Community");
const Member = require("../models/Member");
const Role = require("../models/Role");
const { Snowflake } = require("@theinternetfolks/snowflake");
const User = require("../models/User");

// Checked
const getAllCommunities = async (req, res) => {
    try {
        const communities = await Community.find().lean();
        if (!communities.length) {
            return res.status(404).json({ message: "Communities not found" });
        }
        const formattedData = {
            content: {
                meta: {
                    total: communities.length,
                    pages: 1,
                    page: 1,
                },
                data: await Promise.all(communities.map(async (community) => {
                    const ownerObj = await User.findOne({ id: community.owner });
                    return {
                        id: community.id,
                        name: community.name,
                        slug: community.slug,
                        owner: {
                            id: community.owner,
                            name: ownerObj.name,
                        },
                        created_at: community.createdAt,
                        updated_at: community.updatedAt,
                    };
                })),
            },
        };
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}
// checked
const getMyCommunities = async (req, res) => {
    try {
        const communities = await Community.find({ owner: req.user.id });
        if (!communities.length) {
            return res.status(404).json({ message: "Communities not found" });
        }
        const formattedData = {
            content: {
                meta: {
                    total: communities.length,
                    pages: 1,
                    page: 1,
                },
                data: await Promise.all(communities.map(async (community) => {
                    const ownerObj = await User.findOne({ id: community.owner });
                    return {
                        id: community.id,
                        name: community.name,
                        slug: community.slug,
                        owner: {
                            id: community.owner,
                            name: ownerObj.name,
                        },
                        created_at: community.createdAt,
                        updated_at: community.updatedAt,
                    };
                })),
            }
        }
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Checked
const getCommunitiesIjoined = async (req, res) => {
    try {
        const members = await Member.find({ user: req.user.id });
        if (!members.length) {
            return res.status(404).json({ message: "No communities Joined" });
        }
        
        const communitiesId = members.map(member => member.community);
        const communities = await Community.find({ id: { $in: communitiesId } });
        const formattedData = {
            content: {
                meta: {
                    total: communities.length,
                    pages: 1,
                    page: 1,
                },
                data: await Promise.all(communities.map(async (community) => {
                    const ownerObj = await User.findOne({ id: community.owner });
                    return {
                        id: community.id,
                        name: community.name,
                        slug: community.slug,
                        owner: {
                            id: community.owner,
                            name: ownerObj.name,
                        },
                        created_at: community.createdAt,
                        updated_at: community.updatedAt,
                    };
                })),
            }
        }
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Checked
const getMembers = async (req, res) => {
    const { id } = req.params;
    const slug = id.toLowerCase().replace(/ /g, "-");
    try {
        const community = await Community.findOne({ slug: slug });
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }
        const members = await Member.find({ community: community.id });
        if (!members.length) {
            return res.status(404).json({ message: "Members not found" });
        }
        const formattedData = {
            content: {
                meta: {
                    total: members.length,
                    pages: 1,
                    page: 1,
                },
                data: await Promise.all(members.map(async (member) => {
                    const user = member.user;
                    const role = member.role;
                    const userObj = await User.findOne({ id: user });
                    const roleObj = await Role.findOne({ id: role });
                    return {
                        id: member.id,
                        community: member.community,
                        user: {
                            id: userObj.id,
                            name: userObj.name,
                        },
                        role: {
                            id: roleObj.id,
                            name: roleObj.name,
                        },
                        created_at: member.created_at,
                    }
                }))
            }
        }
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Checked
const createCommunity = async (req, res) => {
    const id = Snowflake.generate({ timestamp: Number(process.env.SNOWFLAKE_TIMESTAMP), shard_id: 4 });
    const owner = req.user.id;
    if (!owner) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/ /g, "-");
    if (!name || !slug || !owner || !id) {
        return res.status(400).json({ message: "Please fill all fields" });
    }
    try {
        const communityExists = await Community.findOne({ id });
        if (communityExists) {
            return res.status(400).json({ message: "Community already exists" });
        }
        const newCommunity = await Community.create({ id, name, slug, owner });

        if (newCommunity) {
            const uniqueMemberId = Snowflake.generate({ timestamp: Number(process.env.SNOWFLAKE_TIMESTAMP), shard_id: 4 });
            const role = await Role.findOne({ name: "Community Admin" }).exec();
            const comId = newCommunity.id;
            const newMember = await Member.create({ id: uniqueMemberId, community: comId, user: owner, role: role.id });

            if (newMember) {
                const formattedData = {
                    status: true,
                    content: {
                        data: {
                            id: newCommunity.id,
                            name: newCommunity.name,
                            slug: newCommunity.slug,
                            owner: owner,
                            created_at: newCommunity.createdAt,
                            updated_at: newCommunity.updatedAt,
                        }
                    }
                }
                res.status(201).json(formattedData);
            } else {
                await newCommunity.delete();
                await newMember.delete();
                res.status(500).json({ message: "Failed to create community" });
            }
        }
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}
// unchecked
const deleteCommunity = async (req, res) => {
    const { id } = req.body;
    try {
        const community = await Community.findOneAndDelete({ id });
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }
        res.status(200).json({ message: "Community deleted successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

module.exports = {
    createCommunity,
    getAllCommunities,
    deleteCommunity,
    getMyCommunities,
    getCommunitiesIjoined,
    getMembers
}