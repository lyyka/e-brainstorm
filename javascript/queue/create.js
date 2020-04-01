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

let create_room_event_lsitener_set = false
let created_room_code = ""

// Function called on page load
function onLoad(e){
    // Used to bind the on click listener to the create room button
    bind_listener = () => {
        create_room_event_lsitener_set = true
        document.getElementById('create_new_session_btn').addEventListener("click", create_new_room)
    }

    // Check if the room is already generated through cookies
    // cookie_handler = new CookieHandler()
    // generated_room = cookie_handler.get_cookie("generated_room", document)

    // If room is already generated
    // if(generated_room != undefined){
        // Remove the button
        // removeCreateRoomButton()

        // Update with existing info
        // update_room_info_wrapper(generated_room)
    // }
    // else{
        // Bind click listener on the button
        bind_listener()
    // }
}

// Removes the button from the DOM along with its event listener
function removeCreateRoomButton(){
    const create_button = document.getElementById('create_new_session_btn')
    create_button.parentNode.removeChild(create_button)
    if(create_room_event_lsitener_set){
        create_button.removeEventListener("click", create_new_room)
        create_room_event_lsitener_set = false
    }
}

// On button click, create new room if one not already created
function create_new_room(e){
    const socket = io()
    socket.emit("create_new_session", function(feedback){
        if(feedback.success){
            // Delete the create button so no new rooms can be created
            removeCreateRoomButton()

            // Update the room info wrapper
            created_room_code = feedback.room_code
            update_room_info_wrapper(feedback.room_code)
        }
        else{
            alert("Error while generating your room! Please try again later, thanks.")
        }
    })
}

// Updates the room info wrapper with room code
function update_room_info_wrapper(room_code){
    // separate 2 by 2. Function called from separate_room_code.js
    separated_room_code = separateRoomCode(room_code)

    const wrapper = document.getElementById("room_info_wrapper")
    // Clear the wrapper element
    while(wrapper.firstChild){
        wrapper.removeChild(wrapper.firstChild)
    }

    // Create heading element to store room code in
    const room_code_heading = document.createElement("h2")
    room_code_heading.classList.add("font-weight-bold")
    room_code_heading.classList.add("text-center", "cursor-pointer")
    room_code_heading.addEventListener("click", copyRoomCode);
    // Add text to heading
    const text = document.createTextNode(separated_room_code)
    room_code_heading.appendChild(text)

    // Create join button
    const join_room_btn = document.createElement("a")
    join_room_btn.href = `/room/${room_code}`
    const join_room_btn_text = document.createTextNode("Join room now!")
    const btn_classes = ["d-block", "text-center", "remove-underline", "rounded", "shadow-sm", "border", "w-100", "py-2", "pink-bg", "text-white"]
    btn_classes.forEach(cls => {
        join_room_btn.classList.add(cls)
    })
    join_room_btn.appendChild(join_room_btn_text)

    // Add heading to now empty wrapper
    wrapper.appendChild(room_code_heading)
    wrapper.appendChild(join_room_btn)
}

// Copies the room code
function copyRoomCode(e){
    const heading = this;
    const code = heading.innerText
    if(code != "Code copied!"){
        // copyCode();
        copyToClipboard(created_room_code)
        heading.innerText = "Code copied!"
        window.setTimeout(function(){
            heading.innerText = code
        }, 1500);
    }
}

// JUST FOR TESTING
// function deleteAllCookies() {
//     var cookies = document.cookie.split(";");

//     for (var i = 0; i < cookies.length; i++) {
//         var cookie = cookies[i];
//         var eqPos = cookie.indexOf("=");
//         var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     }
// }