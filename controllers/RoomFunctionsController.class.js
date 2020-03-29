class RoomFunctionsController{
    constructor(){
        this.onConnection = this.onConnection.bind(this)
        this.listeners = this.listeners.bind(this)
        this.emitters = this.emitters.bind(this)
        this.update_room_subject = this.update_room_subject.bind(this)
        this.get_room_subject = this.get_room_subject.bind(this)
        this.decrease_users_count = this.decrease_users_count.bind(this)
        this.add_idea_to_room = this.add_idea_to_room.bind(this)
        this.fetch_all_ideas = this.fetch_all_ideas.bind(this)
        this.add_point = this.add_point.bind(this)
        this.remove_point = this.remove_point.bind(this)
        this.allow_point = this.allow_point.bind(this)
        this.update_objects_and_points = this.update_objects_and_points.bind(this)
        this.save_notes = this.save_notes.bind(this);
        this.get_user_data = this.get_user_data.bind(this);
    }

    // When someone connects on this IO, join him in the room
    onConnection(socket){
        this.socket = socket
        this.socket.join(this.room.roomCode)
        this.listeners(socket)
    }

    // Saves users notes (POST)
    save_notes(req, res){
        this.room.users[req.body.socket_id].notes = req.body.notes;
        res.send({
            success: true
        })
    }
    // Gets users notes (GET)
    get_user_data(req, res){
        res.send({
            user: this.room.users[req.query.socket_id]
        })
    }

    // Update rooms subject
    update_room_subject(data, callback){
        const subject = data.subject
        this.room.subject = subject
        // Emit the event to others in the room
        this.io.to(this.room.roomCode).emit("subject_changed", subject)
        callback(subject)
    }

    // Just returns the room subject to the frontend
    // Used when connecting to the room to download the actual room subject
    get_room_subject(callback){
        callback(this.room.subject)
    }

    // Decreases the number of users in a room
    decrease_users_count(){
        this.room.users_count--;
        // Emit the new users count to all
        this.io.to(this.room.roomCode).emit("update_users_count", {
            users_count: this.room.users_count
        })
    }

    // Adds the idea to room
    add_idea_to_room(data){
        // Initial idea settings
        const new_idea = {
            user_socket_id: data.user_socket_id,
            id: this.room.ideas.length,
            text: data.idea,
            date: Date.now(),
            points: 0,
            socket_ids_who_gave_point: [] // array of objects like {socket_id: ... , positive_point: true/false}
        };
        this.room.ideas.push(new_idea)
        this.io.to(this.room.roomCode).emit("new_idea_uploaded", {
            ideas_count: this.room.ideas.length,
            idea: new_idea
        });
    }

    // Fetches all existing ideas
    fetch_all_ideas(callback){
        callback({
            ideas: this.room.ideas
        })
    }

    // Check if the user already gave a point to an idea
    // User can give negative point if he gave positive one before
    // User can give positive point if he gave negative one before
    allow_point(idea_id, user_socket_id, positive_point){
        let add_socket_id = true;
        let existing = false
        let index = -1
        // Finds if the user already gave some sort of point and gets the index of it
        for(let i = 0; i < this.room.ideas[idea_id].socket_ids_who_gave_point.length && !existing; i++){
            existing = (String(this.room.ideas[idea_id].socket_ids_who_gave_point[i].socket_id) == String(user_socket_id))
            if(existing){
                index = i
            }
        }
        
        // If the user gave any points
        if(index >= 0){
            // if the user wants to give positive point, but already gave negative, or
            // if the user wants to give negative point, but already gave positive,
            // delete the existing one, and allow the user to make change
            if(positive_point != this.room.ideas[idea_id].socket_ids_who_gave_point[index].positive_point){
                add_socket_id = false;
                this.room.ideas[idea_id].socket_ids_who_gave_point.splice(index, 1);
                return true;
            }
        }

        if(add_socket_id && index < 0){
            this.room.ideas[idea_id].socket_ids_who_gave_point.push({
                socket_id: user_socket_id,
                positive_point: positive_point
            });
        }

        return index < 0;
    }

    // Adds a point to idea with specified ID
    add_point(data){
        if(this.room.ideas[data.idea_id].user_socket_id != data.user_socket_id){
            if(this.allow_point(data.idea_id, data.user_socket_id, true)){
                this.update_objects_and_points(data, 1);
            }
        }
    }

    // Removes a point from an idea with specified ID
    remove_point(data){
        if(this.room.ideas[data.idea_id].user_socket_id != data.user_socket_id){
            if(this.allow_point(data.idea_id, data.user_socket_id, false)){
                this.update_objects_and_points(data, -1);
            }
        }
    }

    // Updates points based on add_point and remove_point methods
    // Changes the number of points
    update_objects_and_points(data, addition){
        this.room.ideas[data.idea_id].points += addition;
        this.io.to(this.room.roomCode).emit("update_points", {
            idea_id: data.idea_id,
            points: this.room.ideas[data.idea_id].points
        });
    }

    listeners(socket){
        socket.on("update_room_subject", this.update_room_subject)
        socket.on("get_room_subject", this.get_room_subject)
        socket.on("decrease_users_count", this.decrease_users_count)
        socket.on("new_idea", this.add_idea_to_room)
        socket.on("get_ideas", this.fetch_all_ideas);
        socket.on("add_point", this.add_point);
        socket.on("remove_point", this.remove_point);
    }

    emitters(socket){

    }
}

module.exports = new RoomFunctionsController()