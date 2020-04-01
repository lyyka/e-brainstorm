$(document).ready(function(){
    // Fix positioning of elements in chat
    const controls_height = $("#msg-controls").outerHeight();
    $("#messages-main-wrap").css('max-height', ($(window).height() - controls_height - $("#chat-header").outerHeight()) + 'px');
    $("#messages-main-wrap").css('padding-bottom', controls_height + 'px');

    // ui events
    $("#close-chat").click(closeChat)
    $("#open-chat").click(openChat)
    // socket events
    socket.on("update_users_list", updateUsersList)
});

function openChat(e){
    $("#main-chat-wrap").show();
}
function closeChat(e){
    $("#main-chat-wrap").hide();
}

function updateUsersList(data){
    // console.log("Tryin yo update");
    
    // console.log(data.users);
    const users_list_wrap = $("#users-list");
    users_list_wrap.empty();
    const ids = Object.keys(data.users);
    for(let i = 0; i < Object.keys(data.users).length; i++){
        const user = data.users[ids[i]];
        const username_par = $("<p></p>");
        console.log(`${ids[i]} == ${user_socket_id}`);
        
        if(ids[i] == user_socket_id){
            username_par.html(`<strong>You</strong> (${user.username})`);
        }
        else{
            username_par.text(user.username);
        }
        users_list_wrap.append(username_par);
        users_list_wrap.append($("<hr/>"));
    }
}