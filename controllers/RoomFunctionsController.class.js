class RoomFunctionsController{
    constructor(){
        this.onConnection = this.onConnection.bind(this)
        this.listeners = this.listeners.bind(this)
        this.emitters = this.emitters.bind(this)
        this.update_room_subject = this.update_room_subject.bind(this)
        this.get_room_subject = this.get_room_subject.bind(this)
    }

    onConnection(socket){
        // When someone connects on this IO, join him in the room
        this.socket = socket
        this.socket.join(this.room.roomCode)
        this.listeners(socket)
    }

    update_room_subject(data, callback){
        // Update this rooms subject
        const subject = data.subject
        const room = data.room
        this.room.subject = subject
        // Emit the event to others in the room
        this.io.to(room).emit("subject_changed", {
            subject: subject
        })
        callback(data)
    }

    get_room_subject(data, callback){
        // Just returns the room subject to the frontend
        // Used when connecting to the room to download the actual room subject
        callback({
            subject: this.room.subject
        })
    }

    listeners(socket){
        socket.on("update_room_subject", this.update_room_subject)
        socket.on("get_room_subject", this.get_room_subject)
    }

    emitters(socket){

    }
}

module.exports = new RoomFunctionsController()