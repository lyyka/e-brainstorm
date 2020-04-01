function updateUsersList(users){
    // console.log("Tryin yo update");
    
    // console.log(data.users);
    const users_list_wrap = $("#users-list");
    users_list_wrap.empty();
    const ids = Object.keys(users);
    for(let i = 0; i < Object.keys(users).length; i++){
        const user = users[ids[i]];
        const username_par = $("<p></p>");
        // console.log(`${ids[i]} == ${user_socket_id}`);
        
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