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
    document.getElementById("idea-input").addEventListener("keydown", sendIdeaOnEnter)
    document.getElementById("send-idea").addEventListener("click", sendIdea)
    socket.on('new_idea_uploaded', newIdeaReceived);
    socket.on('update_points', updatePoints);
}

function sendIdeaOnEnter(e){
    if(e.keyCode == 13){
        sendIdea(e);
    }
}

function sendIdea(e){
    const idea_input = document.getElementById("idea-input")
    const idea = idea_input.value
    if(idea.length > 0){
        idea_input.value = ""
        const req = $.ajax({
            url: '/ideas/add',
            type: 'POST',
            data: {
                usid: user_socket_id,
                idea: idea
            },
            async: true,
            cache: false
        });
    }
}

function newIdeaReceived(data) {
    setStatusTextAndImage(data.ideas_count)
    addIdeaToList(data.idea)
}

function loadExistingIdeas(){
    const req = $.ajax({
        url: '/ideas/get_all',
        type: 'GET',
        async: true,
        cache: false
    })
    req.done(function(data){
        setStatusTextAndImage(data.ideas.length)
        data.ideas.forEach(idea => {
            addIdeaToList(idea)
        })
    });
}

function setStatusTextAndImage(ideas_list_len){
    document.getElementById("ideas-count-text").innerText = `${ideas_list_len} idea(s) posted`
    if(ideas_list_len == 0){
        const img_wrap = document.createElement("div")
        img_wrap.id = "no-ideas-img"
        img_wrap.classList.add('text-center')
        const no_ideas_img = document.createElement("img")
        no_ideas_img.src = "/images/noimg.png"
        no_ideas_img.classList.add("img-fluid", "no-ideas-img")
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

function parse_link_in_idea_text(text){
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a target = "_blank" href="' + url + '">' + url + '</a>';
    });
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
    new_idea_block.setAttribute('id', idea.id);
    new_idea_block.classList.add("position-relative", "idea-block", "shadow-sm", "py-2", "px-3", "mb-3", "mr-3", "d-inline-block", "border", bg_class)

    // Idea block header (for up and down buttons)
    const idea_block_header = document.createElement("div");
    idea_block_header.classList.add("idea-block-header");

    const arrows_p = document.createElement("p");
    arrows_p.classList.add("text-right");
    
    if(idea.user_socket_id != user_socket_id){
        const arrow_up = document.createElement("i");
        arrow_up.classList.add("fas", "fa-arrow-up", "mr-2", "text-muted", "cursor-pointer");
        arrow_up.setAttribute("data-id", idea.id);
        $(arrow_up).click(add_point_to_idea)
        // arrow_up.addEventListener("click", add_point_to_idea);
        const arrow_down = document.createElement("i");
        arrow_down.classList.add("fas", "fa-arrow-down", "mr-2", "text-muted", "cursor-pointer");
        arrow_down.setAttribute("data-id", idea.id);
        // arrow_down.addEventListener("click", remove_point_from_idea);
        $(arrow_down).click(remove_point_from_idea)
        arrows_p.appendChild(arrow_up);
        arrows_p.appendChild(arrow_down);
    }
    const points_span = document.createElement("span");
    points_span.classList.add("idea-points");
    points_span.innerText = idea.points

    arrows_p.appendChild(points_span);
    idea_block_header.appendChild(arrows_p);

    // Idea block body (for text)
    const idea_block_body = document.createElement("div");
    idea_block_body.classList.add("idea-block-body");

    // New idea text
    // const idea_text_div = document.createElement("div")
    // idea_text_div.classList.add("mb-0", "idea-text-div")
    idea_block_body.innerHTML = parse_link_in_idea_text(idea.text)
    // const idea_text = document.createTextNode(parse_link_in_idea_text(idea.text))
    // idea_text_div.appendChild(idea_text)

    // Add text to idea body block
    // idea_block_body.appendChild(idea_text_div)

    // Idea block footer (for date)
    const idea_block_footer = document.createElement("div");
    idea_block_footer.classList.add("idea-block-footer");

    // Idea date text
    const date = new Date(idea.date);
    const idea_data_par = document.createElement("p")
    idea_data_par.classList.add("text-muted");
    idea_data_par.classList.add("mb-0")
    const idea_author_text = document.createTextNode(idea.user_socket_id == user_socket_id ? "You" : idea.author_username)
    const idea_date_text = document.createTextNode(date.getHours() + ":" + date.getMinutes());
    idea_data_par.appendChild(idea_author_text)
    idea_data_par.appendChild(document.createElement("br"))
    idea_data_par.appendChild(idea_date_text)

    // Add date text to footer
    idea_block_footer.appendChild(idea_data_par);

    // Construct the whole block
    new_idea_block.appendChild(idea_block_header);
    new_idea_block.appendChild(idea_block_body);
    new_idea_block.appendChild(idea_block_footer);

    // Add idea block to main wrapper
    ideas_wrap.prepend(new_idea_block)
}

// When a user adds a point
function add_point_to_idea(e){
    const id = $(this).attr('data-id');
    $.ajax({
        url: '/ideas/add_point',
        type: 'POST',
        data: {
            sid: user_socket_id,
            idea_id: id
        },
        async: true,
        cache: false
    })
}

// When a user removes a point
function remove_point_from_idea(e) {
    const id = $(this).attr('data-id');
    $.ajax({
        url: '/ideas/remove_point',
        type: 'POST',
        data: {
            sid: user_socket_id,
            idea_id: id
        },
        async: true,
        cache: false
    })
}

// Callback to be called when someone else adds a point
function updatePoints(data){
    const ideas_wrap = document.getElementById("ideas-panel")
    let found = false
    for(let i = 0; i < ideas_wrap.childNodes.length && !found; i++){
        const node = ideas_wrap.childNodes[i];
        if(node.getAttribute('id') == data.idea_id){
            found = true;
            const header_nodes = node.childNodes[0].childNodes[0].childNodes;
            // If the card to be updated is from some user, so it has 3 elements in header (arrows + points text)
            if(header_nodes.length == 3){
                node.childNodes[0].childNodes[0].childNodes[2].innerText = data.points
            }
            else if(header_nodes.length == 1){
                // If the card to be updated is from current user, so it has 1 element in header (points, NO ARROWS)
                node.childNodes[0].childNodes[0].childNodes[0].innerText = data.points
            }
        }
    }
}