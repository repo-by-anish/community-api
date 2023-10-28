require("dotenv").config(); // import dotenv 
const express = require("express"); // import express
const cors = require("cors");
const path = require("path");   // import path
const mongoose = require("mongoose"); // import mongoose
const dbConn = require("./config/dbConn"); // import dbConn
const corsOptions = require("./config/corsOption"); // import corsOption
const {logger} = require("./middleware/logger"); // import logger
const errorHandler = require("./middleware/errorHandler"); // import errorHandler 
const cookieParser= require("cookie-parser");
const app = express(); // create express app
dbConn()
const PORT = process.env.PORT||8000; // set port

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(errorHandler);
app.use(cookieParser());

app.use("/",express.static(path.join(__dirname, "public")));

app.use("/v1", require("./routes/root"))

app.use("/v1/users", require("./routes/userRoutes"))

app.use("/v1/community", require("./routes/communityRoutes"))

app.use("/v1/member", require("./routes/memberRoutes"))

app.use("/v1/role", require("./routes/roleRoutes"))

app.use("/v1/auth", require("./routes/authRoutes"))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT} click http://localhost:${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})