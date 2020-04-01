class WebRouter{
    constructor(){
        // Bind this keyword so all functions can reference the app
        this.init_get = this.init_get.bind(this)

        // Load controllers
        this.pages_controller = require("../controllers/PagesController.class.js")
        this.rooms_controller = require("../controllers/RoomsController.class.js")
        this.rooms_functions_controller = require("../controllers/RoomFunctionsController.class.js")
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

        // Join the room through form with code
        this.app.post("/room/join", this.rooms_controller.join_room_through_code)

        // Leave the room
        // this.app.get("/leave_room", this.rooms_controller.leave_room)

        // AJAX routes

        // Get socket id of the connection
        this.app.get("/socketid", this.rooms_functions_controller.get_socket_id);
        this.app.post("/socketid/save_to_session", this.rooms_controller.set_socket_id_to_session);

        // Users
        this.app.post("/users/update_notes", this.rooms_functions_controller.save_notes);
        this.app.post("/users/update_username", this.rooms_functions_controller.update_username);
        this.app.get("/users/get_data", this.rooms_functions_controller.get_user_data);
    }
}

module.exports = new WebRouter()