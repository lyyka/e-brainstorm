class RoomsController{
    constructor(){
        this.rooms = {}

        this.onConnection = this.onConnection.bind(this)
        this.listeners = this.listeners.bind(this)
        this.create_new_room = this.create_new_room.bind(this)
        this.join_room = this.join_room.bind(this)
    }

    onConnection(socket){
        this.socket = socket
        this.listeners(socket)
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
            const RoomFunctionsController = require('./RoomFunctionsController.class.js')
            const room_functions = new RoomFunctionsController()
            // Empty room data
            room_functions.room = {
                roomCode: room,
                users_count: 0,
                ideas: [],
                subject: "Brainstorm!"
            }
            // pass new io namespace
            room_functions.io = this.io.of(`/room/${room}`)
            // bind on connection for that io namespace
            room_functions.io.on("connection", room_functions.onConnection)

            // Store the room controller under a room code in this controller
            this.rooms[room] = room_functions

            console.log(this.rooms)

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
            console.log(this.rooms[code].room.ideas)
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
        res.redirect(`/room/${code}`)
    }

    listeners(socket){
        socket.on("create_new_session", this.create_new_room)
    }
}

module.exports = new RoomsController()