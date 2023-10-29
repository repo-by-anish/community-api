const Member = require("../models/Member");
const Role = require("../models/Role");


const isAdmin= async(userId,)=>{
    const member = await Member.findOne({ user: userId });
    const userRole = await Role.findOne({ id: member.role });
    return userRole.name === "Community Admin";
}

const isModerator= async(userId,)=>{
    const member = await Member.findOne({ user: userId });
    const userRole = await Role.findOne({ id: member.role });
    return userRole.name === "Community Moderator";
}

module.exports = {
    isAdmin,
    isModerator
}