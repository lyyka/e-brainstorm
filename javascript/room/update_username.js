let check_appended = false

$(document).ready(function(){
    $("#username").on("input", updateUsername)
});

function updateUsername(e){
    // console.log("event");
    
    const wrapper = $(this)
    const username = wrapper.text();
    const req = $.ajax({
        url: '/users/update_username',
        type: "POST",
        data: {
            socket_id: user_socket_id,
            username: username,
            code: roomCode
        },
        async: true,
        cache: false
    })
    req.done(function(data){
        if(data.success && !check_appended){
            check_appended = true;
            const i = $("<i class = 'ml-2 text-success fas fa-check'></i>")
            wrapper.append(i)
            window.setTimeout(function(){
                i.remove()
                check_appended = false
            }, 2000)
        }
    })
}