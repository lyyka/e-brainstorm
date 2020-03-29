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
    cookie_handler = new CookieHandler()
    generated_room = cookie_handler.get_cookie("generated_room", document)

    // If room is already generated
    if(generated_room != undefined){
        // Remove the button
        removeCreateRoomButton()

        // Update with existing info
        update_room_info_wrapper(generated_room)
    }
    else{
        // Bind click listener on the button
        bind_listener()
    }
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
    // cookie_handler = new CookieHandler()
    // room_generated = cookie_handler.get_cookie("generated_room", document)
    // if(room_generated != undefined){
        // alert(`You have already generated a room with code ${room_generated}`)
    // }
    // else{
        const socket = io()
        socket.emit("create_new_session", function(feedback){
            if(feedback.success){
                // Delete the create button so no new rooms can be created
                removeCreateRoomButton()

                // Create a cookie saying that the room is already generated
                // cookie_handler.add_cookie("generated_room", feedback.room_code, document)

                // Update the room info wrapper
                created_room_code = feedback.room_code
                update_room_info_wrapper(feedback.room_code)
            }
            else{
                alert("Error while generating your room! Please try again later, thanks.")
            }
        })
    // }
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
    // Add copy button to heading
    // const copy_icon = document.createElement("i")
    // copy_icon.classList.add('ml-3')
    // copy_icon.classList.add('pink-text')
    // copy_icon.classList.add('cursor-pointer')
    // copy_icon.classList.add('far')
    // copy_icon.classList.add('fa-copy')
    // copy_icon.addEventListener("click", copyCode)
    // room_code_heading.appendChild(copy_icon)

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
        copyCode();
        heading.innerText = "Code copied!"
        window.setTimeout(function(){
            heading.innerText = code
        }, 1500);
    }
}

// Copy the code to memory
function copyCode(e){
    const el = document.createElement('textarea');  // Create a <textarea> element
    el.value = created_room_code;                   // Set its value to the string that you want copied
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


// JUST FOR TESTING
function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}