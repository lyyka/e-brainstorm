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
        this.io.to(this.room.roomCode).emit("subject_changed", {
            subject: subject
        })
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
        this.room.ideas.push(data.idea)
        this.io.to(this.room.roomCode).emit("new_idea_uploaded", {
            idea: data.idea
        });
    }

    // Fetches all existing ideas
    fetch_all_ideas(callback){
        callback({
            ideas: this.room.ideas
        })
    }

    listeners(socket){
        socket.on("update_room_subject", this.update_room_subject)
        socket.on("get_room_subject", this.get_room_subject)
        socket.on("decrease_users_count", this.decrease_users_count)
        socket.on("new_idea", this.add_idea_to_room)
        socket.on("get_ideas", this.fetch_all_ideas);
    }

    emitters(socket){

    }
}

module.exports = new RoomFunctionsController()