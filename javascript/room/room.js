let user_socket_id = undefined

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

    let first_ever = true;

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
        first_ever = data.first_ever
        if(first_ever){
            user_socket_id = socket.id
        }
        else{
            const get_old_id_req = $.ajax({
                url: "/socketid",
                type: "GET",
                async: true,
                cache: false
            })
            get_old_id_req.done(function(data){
                user_socket_id = data.socket_id
                const get_notes_req = $.ajax({
                    url: "/users/get_notes",
                    data: {
                        socket_id: user_socket_id
                    },
                    type: "GET",
                    async: true,
                    cache: false
                })
                get_notes_req.done(function(data){
                    $("#notes-paper").text(data.notes)
                })
            })
        }
    })    
})
socket.on('disconnect', () => {
    socket.open();
});

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

// Does the actual copy
function copyToClipboard (str) {
    const el = document.createElement('textarea');  // Create a <textarea> element
    el.value = str;                                 // Set its value to the string that you want copied
    el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
    el.style.position = 'absolute';                 
    el.style.left = '-9999px';                      // Move outside the screen to make it invisible
    document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
    const selected =            
      document.getSelection().rangeCount > 0        // Check if there is any content selected previously
        ? document.getSelection().getRangeAt(0)     // Store selection if found
        : false;                                    // Mark as false to know no selection existed before
    el.select();                                    // Select the <textarea> content
    document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
    document.body.removeChild(el);                  // Remove the <textarea> element
    if (selected) {                                 // If a selection existed before copying
      document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
      document.getSelection().addRange(selected);   // Restore the original selection
    }
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