class RoomsController{
    constructor(){
        this.rooms = {}

        this.onConnection = this.onConnection.bind(this)
        this.listeners = this.listeners.bind(this)
        this.create_new_room = this.create_new_room.bind(this)
        this.join_room = this.join_room.bind(this)
        this.join_room_through_code = this.join_room_through_code.bind(this)
        this.set_socket_id_to_session = this.set_socket_id_to_session.bind(this)

        this.get_all_messages = this.get_all_messages.bind(this);
        this.send_message = this.send_message.bind(this);
        this.add_idea = this.add_idea.bind(this);
        this.add_point = this.add_point.bind(this);
        this.remove_point = this.remove_point.bind(this);
        this.get_all_ideas = this.get_all_ideas.bind(this);
        this.get_idea_by_id = this.get_idea_by_id.bind(this);
        this.save_notes = this.save_notes.bind(this);
        this.update_username = this.update_username.bind(this);
    }

    onConnection(socket){
        this.socket = socket
        this.listeners(socket)
    }

    // Get all messages
    get_all_messages(req, res) {
        res.send({
            messages: this.rooms[req.session.current_room_code].room.messages
        })
    }

    // Send message
    send_message(req, res){
        const sent = this.rooms[req.session.current_room_code][req.session.id_saved_under].send_message(req);
        res.send({
            success: sent
        })
    }

    // Add idea
    add_idea(req, res){
        const updated = this.rooms[req.session.current_room_code][req.session.id_saved_under].add_idea_to_room(req);
        res.send({
            success: updated
        })
    }

    // Add point to idea
    add_point(req, res) {
        const updated = this.rooms[req.session.current_room_code][req.session.id_saved_under].add_point(req.body);
        res.send({
            success: updated
        })
    }

    // Remove point from idea
    remove_point(req, res) {
        const updated = this.rooms[req.session.current_room_code][req.session.id_saved_under].remove_point(req.body);
        res.send({
            success: updated
        })
    }

    // Get all ideas
    get_all_ideas(req, res){
        res.send({
            ideas: this.rooms[req.session.current_room_code].room.ideas
        })
    }

    // Get all ideas
    get_idea_by_id(req, res) {
        res.send({
            idea: this.rooms[req.session.current_room_code].room.ideas[req.query.id]
        })
    }

    // Save notes
    save_notes(req, res) {
        const updated = this.rooms[req.session.current_room_code][req.session.id_saved_under].save_notes(req, res);
        res.send({
            success: updated
        })
    }

    // Saves users username (POST)
    update_username(req, res) {
        const updated = this.rooms[req.session.current_room_code][req.session.id_saved_under].update_username(req, res);
        res.send({
            success: updated
        })
    }

    // Returns true if this is the first ever connection in this session
    // False otherwise
    set_socket_id_to_session(req, res){
        // If there was not socket id set in session
        if(req.session.connected_to_new_room){
            // Update/set the session socket id to be used on each reload
            req.session.socket_id = req.body.id

            // Set the room functions controller base id to socket id from session
            // This will help us when user leaves the room so we can remove him from
            // an array
            console.log(`Accessing RMC at ${req.session.id_saved_under}`)
            this.rooms[req.body.room][req.session.id_saved_under].base_id = req.session.socket_id;
        }

        if(req.session.user == undefined || req.session.connected_to_new_room){
            // initialize new object that will hold all user data
            const id_for_nickname = req.body.id.substring(req.body.id.indexOf('#', 0) + 1, req.body.id.indexOf('#', 0) + 6)

            req.session.user = {
                notes: "",
                username: "User#" + id_for_nickname
            }
        }
        
        res.send({
            success: true,
            sid: req.session.socket_id,
            user: req.session.user
        })
    }

    // Create a new room
    create_new_room(callback){
        if(this.socket != null && this.socket != undefined){
            let generated = false;
            let room = "";
            while (!generated) {
                const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 8; i++)
                    room += possible.charAt(Math.floor(Math.random() * possible.length));

                
                generated = this.rooms[room] == null;
                
            }

            console.log(`New room created: ${room}`)

            // Store the room controller under a room code in this controller
            this.rooms[room] = {}
            this.rooms[room].room = {
                roomCode: room,
                ideas: [],
                messages: [],
                subject: "Brainstorm!",
            }

            callback({
                success: true,
                room_code: room
            })
        }
        else{
            callback({
                success: false
            })
        }
    }

    // Join the room
    join_room(req, res){
        const code = req.params.code
        if(this.rooms[code] != undefined){
            req.session.connected_to_new_room = code != req.session.current_room_code
            req.session.current_room_code = code;
            if(req.session.id_saved_under == undefined ||
                (req.session.id_saved_under != undefined && this.rooms[code][req.session.id_saved_under] == undefined)){
                console.log(`Saving new RMC under ${this.socket.id}`);
                    
                let rfc_class = require('./RoomFunctionsController.class.js')
                const room_functions = new rfc_class();
                // if(req.session.socket_id != undefined){
                //     room_functions.base_id = req.session.socket_id;
                // }
                
                room_functions.parent = this.rooms[code]
                // room_functions.room = this.rooms[code].room
                room_functions.io = this.io.of(`/room/${code}`)
                room_functions.io.on("connection", room_functions.onConnection)
                this.rooms[code][this.socket.id] = room_functions
                // console.log(this.rooms[code]);
                req.session.id_saved_under = this.socket.id;
            }

            res.render("room", {
                room_code: code,
            })
        }
        else{
            res.redirect("/create")
        }
    }

    // Join room through code in link
    join_room_through_code(req, res){
        // replace possible whitespace chars that may occur if user copies the formatted session code
        const code = req.body.code.replace(/\s/g,'').toLowerCase()
        if(this.rooms[code] != undefined){
            res.redirect(`/room/${code}`)
        }
        else{
            req.session.join_room_success = false;
            res.redirect("/create")
        }
    }

    listeners(socket){
        socket.on("create_new_session", this.create_new_room)
    }
}

module.exports = new RoomsController()