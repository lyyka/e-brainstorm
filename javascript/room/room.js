let user_socket_id = undefined
let user = undefined

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
socket.on("connect", () => {
    const save_to_sess_req = $.ajax({
        url: "/socketid/save_to_session",
        data: {
            id: socket.id,
            room: roomCode
        },
        type: "POST",
        async: true,
        cache: false
    })
    save_to_sess_req.done(function(data){
        if(data.success){
            user_socket_id = data.sid
            user = data.user
            userDataToUI()
            loadExistingIdeas()
            loadExistingMessages();
        }
    })    
})

function userDataToUI(){
    $("#username").text(user.username)
    $("#notes-paper").text(user.notes) // Set notes text on load
}

function onLoad(e){
    const room_code_text = document.getElementById("room-code-text")
    room_code_text.innerText = separateRoomCode(roomCode)
    room_code_text.addEventListener("click", copyRoomCode);
}

// Copy room code when user clicks on it
function copyRoomCode(e){
    const heading = this;
    const code = heading.innerText
    if(code != "Code copied!"){
        copyToClipboard(code);
        heading.innerText = "Code copied!"
        window.setTimeout(function(){
            heading.innerText = code
        }, 1500);
    }
}