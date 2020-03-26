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
    }

    // When someone connects on this IO, join him in the room
    onConnection(socket){
        this.socket = socket
        this.socket.join(this.room.roomCode)
        this.listeners(socket)
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
        const new_idea = {
            id: this.room.ideas.length,
            text: data.idea,
            date: Date.now(),
            points: 0
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

    // Adds a point to idea with specified ID
    add_point(data){
        this.room.ideas[data.idea_id].points++;
        this.io.to(this.room.roomCode).emit("point_added", {
            idea_id: data.idea_id
        });
    }

    // Removes a point from an idea with specified ID
    remove_point(data){
        this.room.ideas[data.idea_id].points--;
        this.io.to(this.room.roomCode).emit("point_removed", {
            idea_id: data.idea_id
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

module.exports = RoomFunctionsController