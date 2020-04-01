function updateUsersList(users){
    let this_user_block = undefined; // WIll save current user block in the list for later use
    const users_list_wrap = $("#users-list");
    users_list_wrap.empty();
    const ids = Object.keys(users);
    for(let i = 0; i < Object.keys(users).length; i++){
        const user = users[ids[i]];
        const username_par = $("<p></p>");
        
        // if this is the current user, save it in a variable for later use, after the loop
        // Current user should always be on top
        if(ids[i] == user_socket_id){
            this_user_block = `<p><strong>You</strong> (${user.username})</p>`;
        }
        else{
            username_par.text(user.username);
            users_list_wrap.append(username_par);
            if(i < Object.keys(users).length - 1){
                users_list_wrap.append($("<hr/>"));
            }
        }
    }
    if(this_user_block != undefined){
        users_list_wrap.prepend($("<hr/>"))
        users_list_wrap.prepend($(this_user_block));
    }
}