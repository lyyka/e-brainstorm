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

// add points to each note
// sort by points
function addIdeaToList(idea){
    // idea = {text: .... , date: Date.now()}
    const bg_classes = ['dark-green-bg', 'light-green-bg', 'orange-bg', 'pink-pastel-bg'];
    var bg_class = bg_classes[Math.floor(Math.random() * bg_classes.length)]

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    // Where all ideas go
    const ideas_wrap = document.getElementById("ideas-panel")

    // Block that holds new idea
    const new_idea_block = document.createElement("div")
    new_idea_block.classList.add("position-relative", "idea-block", "shadow-sm", "py-2", "px-3", "mb-3", "mr-3", "d-inline-block", "border", bg_class)

    // Idea block header (for up and down buttons)
    const idea_block_header = document.createElement("div");
    idea_block_header.classList.add("idea-block-header");

    const arrows_p = document.createElement("p");
    arrows_p.classList.add("text-right");
    const arrow_up = document.createElement("i");
    arrow_up.classList.add("fas", "fa-arrow-up", "mr-2", "text-muted", "cursor-pointer");
    const arrow_down = document.createElement("i");
    arrow_down.classList.add("fas", "fa-arrow-down", "mr-2", "text-muted", "cursor-pointer");
    const points_span = document.createElement("span");
    points_span.innerText = idea.points

    arrows_p.appendChild(arrow_up);
    arrows_p.appendChild(arrow_down);
    arrows_p.appendChild(points_span);
    idea_block_header.appendChild(arrows_p);

    // Idea block body (for text)
    const idea_block_body = document.createElement("div");
    idea_block_body.classList.add("idea-block-body");

    // New idea text
    const idea_par = document.createElement("p")
    idea_par.classList.add("mb-0")
    const idea_text = document.createTextNode(idea.text)
    idea_par.appendChild(idea_text)

    // Add text to idea body block
    idea_block_body.appendChild(idea_par)

    // Idea block footer (for date)
    const idea_block_footer = document.createElement("div");
    idea_block_footer.classList.add("idea-block-footer");

    // Idea date text
    const date = new Date(idea.date);
    const date_par = document.createElement("p")
    date_par.classList.add("text-muted");
    date_par.classList.add("mb-0")
    const date_text = document.createTextNode(days[date.getDay()] + " " + date.getDay() + "/" + date.getMonth() + ", " + date.getHours() + ":" + date.getMinutes())
    date_par.appendChild(date_text)

    // Add date text to footer
    idea_block_footer.appendChild(date_par);

    // Construct the whole block
    new_idea_block.appendChild(idea_block_header);
    new_idea_block.appendChild(idea_block_body);
    new_idea_block.appendChild(idea_block_footer);

    // Add idea block to main wrapper
    ideas_wrap.prepend(new_idea_block)
}