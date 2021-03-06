// Load up the env variables from file
require('dotenv').config()

// Server set up requirements
const cookieSession = require('cookie-session')
const http = require('http')
const express = require("express")
const app = express()
const server = http.createServer(app)
// Create and listen on general IO server, with no namespace
// Will use this to create rooms only
const io = require('socket.io').listen(server)
const rooms_controller = require('./controllers/RoomsController.class.js')
io.on('connection', rooms_controller.onConnection)
rooms_controller.io = io

// Set view engine to pug
const path = require('path')
app.use(express.static(__dirname));
app.set("view engine", 'pug')
app.set('views', path.join(__dirname, '/views'))
app.set("trust_proxy", 1)

// Requests parser
const body_parser = require('body-parser')
app.use(body_parser.json())
app.use(body_parser.urlencoded({
    extended: false
}))
app.use(cookieSession({
    name: 'session',
    secret: 'abcxyz'
}))

// Configure routes
router = require("./routes/web.js")
router.app = app
router.init_router()

// Start the App
server.listen(process.env.PORT || 80, "0.0.0.0", () => {
    console.log("App started on port " + process.env.PORT)
})