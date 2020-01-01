// On document ready with vanilla js
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
docReady(onLoad)

const socket = io(`/room/${roomCode}`)
socket.on('connect_error', (error) => {
    console.log(error)
});
socket.on("connect", () => {
    console.log("You have connected successfully!")
})
socket.on('disconnect', () => {
    socket.open();
});

function onLoad(e){
    document.getElementById("room-code-text").innerText = separateRoomCode(roomCode)
}

// When users leave the page
window.onbeforeunload = function(){
    socket.emit("decrease_users_count");
}

// Users count
socket.on("update_users_count", function(data){
    const users_count = data.users_count
    document.getElementById('users_count').innerText = `${users_count} people brainstorming`
});