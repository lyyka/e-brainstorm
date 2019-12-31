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
    console.log(socket.connected)
})
socket.on('disconnect', () => {
    socket.open();
});

function onLoad(e){
    document.getElementById("room-code-text").innerText = separateRoomCode(roomCode)
}