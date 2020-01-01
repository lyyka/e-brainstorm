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

function onLoad(e){
    socket.emit("get_room_subject", subjectUpdated)
    socket.on("subject_changed", subjectUpdated)
    document.getElementById("update-subject").addEventListener("click", updateSubject)
}

// On button click
function updateSubject(e){
    const subject = document.getElementById("update-subject-input").value
    // Emit the subject change event
    socket.emit("update_room_subject", {
        subject: subject
    }, subjectUpdated)
    $("#changeSubjectModal").modal("hide")
}

function subjectUpdated(subject){
    // Make new text
    const new_title = document.createTextNode(subject)

    // Set the text on subject update field
    document.getElementById("update-subject-input").value = subject;

    // Take span element and clear it
    const title_el = document.getElementById("brainstorming-subject-title")
    while(title_el.firstChild){
        title_el.removeChild(title_el.firstChild)
    }

    // Set new text
    title_el.appendChild(new_title)
}