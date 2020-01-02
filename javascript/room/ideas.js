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

function onLoad(e) {
    document.getElementById("send-idea").addEventListener("click", sendIdea)
    socket.on('new_idea_uploaded', newIdeaReceived);
    socket.emit('get_ideas', loadExistingIdeas)
}

function sendIdea(e){
    const idea_input = document.getElementById("idea-input")
    const idea = idea_input.value
    idea_input.value = ""
    socket.emit("new_idea", {
        idea: idea
    })
}

function newIdeaReceived(data) {
    setStatusTextAndImage(data.ideas_count)
    addIdeaToList(data.idea)
}

function loadExistingIdeas(data){
    setStatusTextAndImage(data.ideas.length)
    data.ideas.forEach(idea => {
        addIdeaToList(idea)
    })
}

function setStatusTextAndImage(ideas_list_len){
    document.getElementById("ideas-count-text").innerText = `${ideas_list_len} ideas posted`
    if(ideas_list_len == 0){
        const img_wrap = document.createElement("div")
        img_wrap.id = "no-ideas-img"
        img_wrap.classList.add('text-center')
        const no_ideas_img = document.createElement("img")
        no_ideas_img.src = "/images/space.png"
        no_ideas_img.classList.add("img-fluid")
        img_wrap.appendChild(no_ideas_img)
        const ideas_panel = document.getElementById("ideas-panel")
        ideas_panel.appendChild(img_wrap)
    }
    else{
        const element = document.getElementById('no-ideas-img')
        if(element != null){
            element.parentNode.removeChild(element)
        }
    }
}

function addIdeaToList(idea){
    const ideas_wrap = document.getElementById("ideas-panel")
    const new_idea_block = document.createElement("div")
    new_idea_block.classList.add("rounded", "shadow-sm", "py-2", "px-3", "mb-3", "mr-3", "d-inline-block", "border")
    const idea_par = document.createElement("p")
    idea_par.classList.add("mb-0")
    const idea_text = document.createTextNode(idea)
    idea_par.appendChild(idea_text)
    new_idea_block.appendChild(idea_par)
    ideas_wrap.prepend(new_idea_block)
}