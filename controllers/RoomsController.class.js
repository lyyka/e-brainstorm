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
        this.socketDisconnectedClient = this.socketDisconnectedClient.bind(this)
        this.save_notes = this.save_notes.bind(this);
        this.update_username = this.update_username.bind(this);
        this.get_user_data = this.get_user_data.bind(this);
        // this.leave_room = this.leave_room.bind(this)
        // this.page_refresh_leave = this.page_refresh_leave.bind(this);
        // this.leave = this.leave.bind(this);
    }

    onConnection(socket){
        this.socket = socket
        this.listeners(socket)
    }

    save_notes(req, res) {
        this.rooms[req.body.code][req.session.id_saved_under].save_notes(req, res);
        res.send({
            success: true
        })
    }
    // Saves users username (POST)
    update_username(req, res) {
        this.rooms[req.body.code][req.session.id_saved_under].update_username(req, res);
    }

    socketDisconnectedClient(req, res){
        this.rooms[req.query.code][req.session.id_saved_under].socketDisconnectedClient(req, res);
        res.send({
            success: true
        })
    }

    get_user_data(req, res) {
        res.send({
            user: this.rooms[req.query.code].room.users[req.query.socket_id]
        })
    }

    get_socket_id(req, res) {
        // WHen getting socket id on socket connection from front end
        // Send the existing socket id AND users list to update
        res.send({
            socket_id: req.session.socket_id,
            users: this.rooms[req.query.code].room.users
        })
    }

    // Returns true if this is the first ever connection in this session
    // False otherwise
    set_socket_id_to_session(req, res){
        // Remove socket id from session if that id is not in this room
        if(req.session.socket_id != undefined){
            const existing_socket_id = req.session.socket_id
            if(this.rooms[req.body.room].room.users[existing_socket_id] == undefined && this.rooms[req.body.room].room.old_user[existing_socket_id] == undefined){
                console.log('SSID reset');
                
                req.session.socket_id = undefined
            }
        }

        console.log(`Accessing RMC at ${req.session.id_saved_under}`)
        // If there was not socket id set in session
        if(req.session != null && req.session.socket_id == undefined){
            console.log("New ID being set");
            // console.log( this.rooms[req.body.room]);
            
            
            // Update/set the session socket id to be used on each reload
            req.session.socket_id = req.body.id

            // Set the room functions controller base id to socket id from session
            // This will help us when user leaves the room so we can remove him from
            // an array
            this.rooms[req.body.room][req.session.id_saved_under].base_id = req.session.socket_id;
            console.log(this.rooms[req.body.room]);

            // initialize new object that will hold all user data
            const id_for_nickname = req.body.id.substring(req.body.id.indexOf('#', 0) + 1, req.body.id.length - 6)

            this.rooms[req.body.room].room.users[req.body.id] = {
                notes: "",
                username: "User#" + id_for_nickname
            }
            console.log('New users array: ');
            console.log(this.rooms[req.body.room].room.users);
            
            
            // Update users list to all clients
            this.rooms[req.body.room][req.session.id_saved_under].io.to(req.body.room).emit("update_users_list", {
                users: this.rooms[req.body.room].room.users
            })

            // Update users count to all clients
            this.rooms[req.body.room][req.session.id_saved_under].io.to(req.body.room).emit("update_users_count", {
                // users_count: this.rooms[code].room.users_count
                users_count: Object.keys(this.rooms[req.body.room].room.users).length
            })

            res.send({
                first_ever: true
            })
        }
        else{
            // old_user is set in socketDisconnected(sid) in other controller
            // It saves current users data in case he refreshed the page
            // and will come back immediately, so if there is old_user
            // set the current users data to it
            if(this.rooms[req.body.room].room.old_user[req.session.socket_id] != undefined){
                // console.log(`User ${req.session.socket_id} regenerated`);
                
                console.log("Users after reconnect of " + req.session.socket_id)

                // Set user from old one and delete old one
                this.rooms[req.body.room].room.users[req.session.socket_id] = this.rooms[req.body.room].room.old_user[req.session.socket_id];
                delete this.rooms[req.body.room].room.old_user[req.session.socket_id];

                console.log(this.rooms[req.body.room].room.users)
                // console.log('---------------');
                

                this.rooms[req.body.room][req.session.id_saved_under].io.to(req.body.room).emit("update_users_list", {
                    users: this.rooms[req.body.room].room.users
                })
    
                this.rooms[req.body.room][req.session.id_saved_under].io.to(req.body.room).emit("update_users_count", {
                    // users_count: this.rooms[code].room.users_count
                    users_count: Object.keys(this.rooms[req.body.room].room.users).length
                })
            }
            
            res.send({
                first_ever: false
            })
        }
        console.log('---------------------');
        
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

            // Store the room controller under a room code in this controller
            this.rooms[room] = {}
            this.rooms[room].room = {
                roomCode: room,
                ideas: [],
                // users: {}, // key value pairs, nested object, key - socket id, value - object with user data
                subject: "Brainstorm!",
                // old_user: {},
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

    join_room(req, res){
        const code = req.params.code
        if(this.rooms[code] != null){
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

    listeners(socket){
        socket.on("create_new_session", this.create_new_room)
    }
}

module.exports = new RoomsController()