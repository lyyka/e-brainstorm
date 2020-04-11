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

        // Join the room through form with code
        this.app.post("/room/join", this.rooms_controller.join_room_through_code)


        // AJAX routes
        // post - req.body.
        // get - req.query.

        // Set up current room session
        this.app.post("/socketid/save_to_session", this.rooms_controller.set_socket_id_to_session);

        // Ideas
        this.app.post('/ideas/add', this.rooms_controller.add_idea);
        this.app.post('/ideas/add_point', this.rooms_controller.add_point);
        this.app.post('/ideas/remove_point', this.rooms_controller.remove_point);
        this.app.get('/ideas/get_all', this.rooms_controller.get_all_ideas);
        this.app.get('/ideas/get_idea', this.rooms_controller.get_idea_by_id);

        // Users
        this.app.post("/users/update_notes", this.rooms_controller.save_notes);
        this.app.post("/users/update_username", this.rooms_controller.update_username);

        // Messages
        this.app.post("/messages/send", this.rooms_controller.send_message);
        this.app.get("/messages/get_all", this.rooms_controller.get_all_messages);
    }
}

module.exports = new WebRouter()