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
// socket.on('connect_error', (error) => {
//     console.log(error)
// });
socket.on("connect", () => {
    // socket.id is current

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
        // If this is first ever connection on this session
        // No need to call server for socket id, we can use the one we have
        if(data.first_ever){
            user_socket_id = socket.id
            user = {
                notes: "",
                username: "User#" + socket.id.substring(socket.id.indexOf("#") + 1, socket.id.length - 6)
            }
            userDataToUI()
            updateUsersList(data.users)
        }
        else{
            // console.log("Not first ever");
            
            // If this is not the first connection
            // Get the old socket id
            const get_old_id_req = $.ajax({
                url: "/socketid",
                type: "GET",
                async: true,
                cache: false
            })
            get_old_id_req.done(function(data){
                // console.log(data.socket_id);
                user_socket_id = data.socket_id
                updateUsersList(data.users)
                // Get all user data and store it in global variable 'user'
                const get_user_data_req = $.ajax({
                    url: "/users/get_data",
                    data: {
                        socket_id: user_socket_id
                    },
                    type: "GET",
                    async: true,
                    cache: false
                })
                get_user_data_req.done(function(data){
                    user = data.user
                    userDataToUI()
                })
            })
        }
    })    
})
socket.on('disconnect', () => {
    socket.open();
});

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

// When users leave the page
window.onbeforeunload = function(){
    // socket.emit("decrease_users_count");
}

// Users count
socket.on("update_users_count", function(data){
    const users_count = data.users_count
    document.getElementById('users_count').innerText = `${users_count} people brainstorming`
});