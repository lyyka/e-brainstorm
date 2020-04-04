let current_check = undefined
let timeout = undefined

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
        },
        async: true,
        cache: false
    })
    req.done(function(data){
        window.clearTimeout(timeout);
        if(current_check != undefined) {
            current_check.remove();
        }
        if(data.success){
            current_check = $("<i class = 'ml-2 text-success fas fa-check'></i>")
            
        }
        else if(!data.success){
            current_check = $("<i class = 'ml-2 text-danger fas fa-times'></i>")
        }
        wrapper.append(current_check)
        timeout = window.setTimeout(function () {
            current_check.remove()
        }, 2000)
    })
}