class WebRouter{
    constructor(){
        // Bind this keyword so all functions can reference the app
        this.init_get = this.init_get.bind(this)

        // Load controllers
        this.pages_controller = require("../controllers/PagesController.class.js")
        this.rooms_controller = require("../controllers/RoomsController.class.js")
    }

    init_router(){
        // Call the functions
        this.init_get()
    }

    init_get(){
        // Home page
        this.app.get("/", this.pages_controller.index)

        // Create brainstorming session page
        this.app.get("/create", this.pages_controller.createSession)

        // Open the room
        this.app.get("/room/:code", this.rooms_controller.join_room)

        // Join the room through form
        this.app.post("/room/join", this.rooms_controller.join_room_through_code)
    }
}

module.exports = new WebRouter()