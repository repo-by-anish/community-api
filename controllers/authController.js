const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Snowflake } = require("@theinternetfolks/snowflake")
const register = async (req, res) => {
    const id = Snowflake.generate({ timestamp: Number(process.env.SNOWFLAKE_TIMESTAMP), shard_id: 4 });
    const { name, email, password } = req.body;
    if (!id || !name || !email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }
    try {
        const userExists = await User.findOne({ id });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ id, name, email, password: hashedPassword });
        if (newUser) {
            const accessToken = jwt.sign(
                {
                    "info": {
                        email: newUser.email,
                        id: newUser.id
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "30m" }
            )

            const refreshToken = jwt.sign(
                {
                    "info": {
                        email: newUser.email,
                        id: newUser.id
                    }
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "1d" }
            )

            res.cookie("jwt", refreshToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            const formatedData = {
                status: true,
                content: {
                    data: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        created_at: newUser.createdAt
                    },
                    meta: {
                        accessToken,
                    }
                }
            }

            res.status(200).json({ formatedData });
        }
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

const getMe = async (req, res) => {
    const id = req.user.id;
    if(!id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ id }).select("-password");
    if (!user) {
        return res.status(404).json({ message: "Unauthorized" });
    } else {
        const formatedData = {
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.createdAt
                }
            }
        }
        res.status(200).json(formatedData);
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    try {
        const foundUser = await User.findOne({ email }).exec()
        if (!foundUser) {
            return res.status(401).json({ message: "User not found" });
        }
        const match = await bcrypt.compare(password, foundUser.password)
        if (!match) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const accessToken = jwt.sign(
            {
                "info": {
                    email: foundUser.email,
                    id: foundUser.id
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
            {
                "info": {
                    email: foundUser.email,
                    id: foundUser.id
                }
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const formatedData = {
            status: true,
            content: {
                data: {
                    id: foundUser.id,
                    name: foundUser.name,
                    email: foundUser.email,
                    created_at: foundUser.createdAt
                },
                meta: {
                    accessToken,
                }
            }
        }

        res.status(200).json({ formatedData });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const refresh = (req, res) => {
    const cookies = req.cookies
    if (!cookies || !cookies.jwt) return res.status(401).json({ message: 'Unauthorized' });
    const refreshToken = cookies.jwt;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" });
            const { info } = decoded;
            const foundUser = await User.findOne({ id: info.id }).select("-password").exec();
            if (!foundUser) return res.status(404).json({ message: 'User not found' });
            const accessToken = jwt.sign(
                {
                    "info": {
                        email: foundUser.email,
                        id: foundUser.id
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "30m" }
            );
            res.status(200).json({ accessToken });
        }
    )
}

const logout = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.json({ message: "Cookie cleared" });
}

module.exports = {
    login,
    refresh,
    logout,
    register,
    getMe
}