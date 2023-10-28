const allowdOrigins = require("./allowedOrigins")

const corsOptions = {
    origin: function (origin, callback) {
        if (allowdOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credential: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions