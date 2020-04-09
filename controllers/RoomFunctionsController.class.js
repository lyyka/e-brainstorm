class RoomFunctionsController{
    constructor(){
        this.parent = undefined;
        this.io = undefined;
        this.onConnection = this.onConnection.bind(this)
        this.listeners = this.listeners.bind(this)
        this.emitters = this.emitters.bind(this)
        this.update_room_subject = this.update_room_subject.bind(this)
        this.get_room_subject = this.get_room_subject.bind(this)
        this.add_idea_to_room = this.add_idea_to_room.bind(this)
        this.add_point = this.add_point.bind(this)
        this.remove_point = this.remove_point.bind(this)
        this.allow_point = this.allow_point.bind(this)
        this.update_objects_and_points = this.update_objects_and_points.bind(this)
        this.send_message = this.send_message.bind(this);
        this.save_notes = this.save_notes.bind(this);
        this.update_username = this.update_username.bind(this);
    }

    // When someone connects on this IO, join him in the room
    onConnection(socket){
        this.socket = socket
        this.socket.join(this.parent.room.roomCode)
        this.listeners(socket)
    }

    // Add message to room (POST)
    send_message(req){
        const date = new Date();
        if (req.body.text.trim() != ""){
            const msg = {
                sender: req.body.socket_id,
                text: req.body.text,
                date: {
                    hours: date.getHours(),
                    minutes: date.getMinutes(),
                    day: date.getDate(),
                    month: date.getMonth(),
                    fullyear: date.getFullYear(),
                }
            }
            this.parent.room.messages.push(msg);
            this.io.to(this.parent.room.roomCode).emit("new_message", msg)
            return true;
        }
        return false;
    }

    // Saves users notes (POST)
    save_notes(req, res){
        req.session.user.notes = req.body.notes;
        return true;
    }

    // Saves users username (POST)
    update_username(req, res){
        if(req.body.username.length > 2 && req.body.username.length <= 16){
            req.session.user.username = req.body.username;
            return true;
        }
        else{
            return false;
        }
    }

    // Update rooms subject
    update_room_subject(data, callback){
        const subject = data.subject
        this.parent.room.subject = subject
        // Emit the event to others in the room
        this.io.to(this.parent.room.roomCode).emit("subject_changed", subject)
        callback(subject)
    }

    // Just returns the room subject to the frontend
    // Used when connecting to the room to download the actual room subject
    get_room_subject(callback){
        callback(this.parent.room.subject)
    }

    // Adds the idea to room
    add_idea_to_room(req){
        // Initial idea settings
        if(req.body.idea.length > 0){
            const new_idea = {
                user_socket_id: req.body.usid,
                author_username: req.session.user.username,
                id: this.parent.room.ideas.length,
                text: req.body.idea,
                date: Date.now(),
                points: 0,
                socket_ids_who_gave_point: [] // array of objects like {socket_id: ... , positive_point: true/false}
            };
            this.parent.room.ideas.push(new_idea)
            this.io.to(this.parent.room.roomCode).emit("new_idea_uploaded", {
                ideas_count: this.parent.room.ideas.length,
                idea: new_idea
            });
            return true;
        }
        return false;
    }

    // Check if the user already gave a point to an idea
    // User can give negative point if he gave positive one before
    // User can give positive point if he gave negative one before
    allow_point(idea_id, user_socket_id, positive_point){
        let add_socket_id = true;
        let existing = false
        let index = -1
        // Finds if the user already gave some sort of point and gets the index of it
        for(let i = 0; i < this.parent.room.ideas[idea_id].socket_ids_who_gave_point.length && !existing; i++){
            existing = (String(this.parent.room.ideas[idea_id].socket_ids_who_gave_point[i].socket_id) == String(user_socket_id))
            if(existing){
                index = i
            }
        }
        
        // If the user gave any points
        if(index >= 0){
            // if the user wants to give positive point, but already gave negative, or
            // if the user wants to give negative point, but already gave positive,
            // delete the existing one, and allow the user to make change
            if(positive_point != this.parent.room.ideas[idea_id].socket_ids_who_gave_point[index].positive_point){
                add_socket_id = false;
                this.parent.room.ideas[idea_id].socket_ids_who_gave_point.splice(index, 1);
                return true;
            }
        }

        if(add_socket_id && index < 0){
            this.parent.room.ideas[idea_id].socket_ids_who_gave_point.push({
                socket_id: user_socket_id,
                positive_point: positive_point
            });
        }

        return index < 0;
    }

    // Adds a point to idea with specified ID
    add_point(data){
        if(this.parent.room.ideas[data.idea_id].user_socket_id != data.user_socket_id){
            if(this.allow_point(data.idea_id, data.user_socket_id, true)){
                this.update_objects_and_points(data, 1);
                return true;
            }
        }
        return false;
    }

    // Removes a point from an idea with specified ID
    remove_point(data){
        if(this.parent.room.ideas[data.idea_id].user_socket_id != data.user_socket_id){
            if(this.allow_point(data.idea_id, data.user_socket_id, false)){
                this.update_objects_and_points(data, -1);
                return true;
            }
        }
        return false;
    }

    // Updates points based on add_point and remove_point methods
    // Changes the number of points
    update_objects_and_points(data, addition){
        this.parent.room.ideas[data.idea_id].points += addition;
        this.io.to(this.parent.room.roomCode).emit("update_points", {
            idea_id: data.idea_id,
            points: this.parent.room.ideas[data.idea_id].points
        });
    }

    listeners(socket){
        socket.on("update_room_subject", this.update_room_subject)
        socket.on("get_room_subject", this.get_room_subject)
    }

    emitters(socket){

    }
}

module.exports = RoomFunctionsController