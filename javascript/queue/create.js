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

let created_room_code = ""

// Function called on page load
function onLoad(e){
    document.getElementById('create_new_session_btn').addEventListener("click", create_new_room)
    $(".code-block-input").on('input', copyToHidden);
    $(".code-block-input").on('focus', codeBlockFocused);
}

// Copis the divided code blocks into one input for join part
function copyToHidden(e){
    const current_input = $(this);
    if(current_input.val() != ""){
        let current_input_index = 0;

        const inputs = $(".code-block-input");
        let text = "";
        for (let i = 0; i < inputs.length; i++) {
            console.log(inputs.eq(i)[0]);
            console.log(current_input[0]);

            if (inputs.eq(i)[0] == current_input[0]) { current_input_index = i; }
            text += inputs.eq(i).val();
        }
        $("#hidden-code").val(text);

        if (current_input_index + 1 < inputs.length) {
            inputs.eq(current_input_index + 1).focus()
        }
        else {
            inputs.eq(0).focus()
        }
    }
}
function codeBlockFocused(e){
    $(this).select();
}

// On button click, create new room if one not already created
function create_new_room(e){
    const socket = io()
    socket.emit("create_new_session", function(feedback){
        if(feedback.success){
            // Delete the create button so no new rooms can be created
            const create_button = document.getElementById('create_new_session_btn')
            create_button.parentNode.removeChild(create_button)
            create_button.removeEventListener("click", create_new_room)

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