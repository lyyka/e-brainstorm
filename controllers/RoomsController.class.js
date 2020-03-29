class RoomsController{
    constructor(){
        this.rooms = {}

        this.onConnection = this.onConnection.bind(this)
        this.listeners = this.listeners.bind(this)
        this.create_new_room = this.create_new_room.bind(this)
        this.join_room = this.join_room.bind(this)
        this.join_room_through_code = this.join_room_through_code.bind(this)
        this.get_socket_id = this.get_socket_id.bind(this)
        this.set_socket_id_to_session = this.set_socket_id_to_session.bind(this)
    }

    onConnection(socket){
        this.socket = socket
        this.listeners(socket)
    }

    get_socket_id(req, res){
        res.send({
            socket_id: req.session.socket_id
        })
    }

    // Returns true if this is the first ever connection in this session
    // False otherwise
    set_socket_id_to_session(req, res){
        if(req.session != null && req.session.socket_id == undefined){
            req.session.socket_id = req.body.id
            this.rooms[req.body.room].room.users[req.body.id] = {
                notes: ""
            }
            res.send({
                first_ever: true
            })
        }
        else{
            res.send({
                first_ever: false
            })
        }
    }

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

            // Create new controller with new namespace for each room
            // const RoomFunctionsController = require('./RoomFunctionsController.class.js')
            const room_functions = require('./RoomFunctionsController.class.js')
            // Empty room data
            room_functions.room = {
                roomCode: room,
                users_count: 0,
                ideas: [],
                users: {},
                subject: "Brainstorm!"
            }
            // pass new io namespace
            room_functions.io = this.io.of(`/room/${room}`)
            // bind on connection for that io namespace
            room_functions.io.on("connection", room_functions.onConnection)

            // Store the room controller under a room code in this controller
            this.rooms[room] = room_functions

            // console.log(this.rooms)

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

    join_room(req, res){
        const code = req.params.code
        if(this.rooms[code] != null){
            // Increase the number of users in the room
            this.rooms[code].room.users_count++
            // console.log(this.rooms[code].room.ideas)
            // Emit the new users count to all
            this.rooms[code].io.to(code).emit("update_users_count", {
                users_count: this.rooms[code].room.users_count
            })
            res.render("room", {
                room_code: code,
                users_count: this.rooms[code].room.users_count
            })
        }
        else{
            res.redirect("/create")
        }
    }

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