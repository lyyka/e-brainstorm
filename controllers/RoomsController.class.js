class RoomsController{
    constructor(){
        this.rooms = {}

        this.onConnection = this.onConnection.bind(this)
        this.listeners = this.listeners.bind(this)
        this.create_new_room = this.create_new_room.bind(this)
        this.join_room = this.join_room.bind(this)
        this.join_room_through_code = this.join_room_through_code.bind(this)
        this.set_socket_id_to_session = this.set_socket_id_to_session.bind(this)
        // this.leave_room = this.leave_room.bind(this)
        // this.page_refresh_leave = this.page_refresh_leave.bind(this);
        // this.leave = this.leave.bind(this);
    }

    onConnection(socket){
        this.socket = socket
        this.listeners(socket)
    }

    // Returns true if this is the first ever connection in this session
    // False otherwise
    set_socket_id_to_session(req, res){
        if(req.session != null && req.session.socket_id == undefined){
            // Update/set the session socket id to be used on each reload
            req.session.socket_id = req.body.id

            const id_for_nickname = req.body.id.substring(req.body.id.indexOf('#', 0) + 1, req.body.id.length - 6)

            // initialize new object that will hold all user data
            this.rooms[req.body.room].room.users[req.body.id] = {
                notes: "",
                username: "User#" + id_for_nickname
            }

            this.rooms[req.body.room].io.to(req.body.room).emit("update_users_list", {
                users: this.rooms[req.body.room].room.users
            })

            this.rooms[req.body.room].io.to(req.body.room).emit("update_users_count", {
                // users_count: this.rooms[code].room.users_count
                users_count: Object.keys(this.rooms[req.body.room].room.users).length
            })

            this.rooms[req.body.room].room.modified_user_socket_id = req.session.socket_id;
            res.send({
                first_ever: true
            })
        }
        else{
            // old_user is set in socketDisconnected() in other controller
            // It saves current users data in case he refreshed the page
            // and will come back immediately, so if there is old_user
            // set the current users data to it
            if(this.rooms[req.body.room].room.old_user != undefined){
                this.rooms[req.body.room].room.users[req.session.socket_id] = this.rooms[req.body.room].room.old_user;
                this.rooms[req.body.room].room.old_user = undefined;
            }
            this.rooms[req.body.room].room.modified_user_socket_id = req.session.socket_id;
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
                // users_count: 0,
                ideas: [],
                users: {}, // key value pairs, nested object, key - socket id, value - object with user data
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
            // If there is saved socket id, and that user does not exist, remove the socket id
            if(req.session.socket_id != undefined){
                const existing_socket_id = req.session.socket_id
                if(this.rooms[code].room.users[existing_socket_id] == undefined){
                    req.session.socket_id = undefined
                }
            }
            // Increase the number of users in the room
            // this.rooms[code].room.users_count++
            // console.log(this.rooms[code].room.ideas)
            // Emit the new users count to all
            res.render("room", {
                room_code: code,
                // users_count: this.rooms[code].room.users_count
                users_count: Object.keys(this.rooms[code].room.users).length
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

    // when the leave button is clicked (this is accessible through link /leave_room?code=xxxxxx)
    // leave_room(req, res){
    //     // this.leave(req.query.code)
        
    //     // req.session.socket_id = undefined
    //     res.redirect("/create")
    // }

    // on unload
    // page_refresh_leave(data){
    //     console.log("Page refresh leave");
        
    //     this.leave(data.code)
    // }

    // Deletes user from the list
    // Updates users list 
    // Updates users count
    // leave(room_code){
    //     delete this.rooms[room_code].room.users[req.session.socket_id]
        
    //     this.rooms[room_code].io.to(room_code).emit("update_users_list", {
    //         users: this.rooms[room_code].room.users
    //     })

    //     this.rooms[room_code].io.to(room_code).emit("update_users_count", {
    //         // users_count: this.rooms[code].room.users_count
    //         users_count: Object.keys(this.rooms[room_code].room.users).length
    //     })
    // }

    listeners(socket){
        socket.on("create_new_session", this.create_new_room)
        // socket.on("page_refresh_leave", this.page_refresh_leave)
    }
}

module.exports = new RoomsController()