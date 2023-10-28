const { rateLimit } = require("express-rate-limit")
const { logEvents } = require("./logger")

const limiter = rateLimit({
    windowMs: 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message:{
        message: "Too many requests from this IP, please try again after 60 seconds"
    },
    handler: (req, res, next, options) => {
        logEvents(`Too many requests: ${options.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    },
    standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

module.exports = limiter