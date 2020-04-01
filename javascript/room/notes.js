let safe_to_save = true;
$(document).ready(function(){
    $("#notes-paper").on("input", updateNotes);
});

function updateNotes(e){
    if(safe_to_save){
        safe_to_save = false;
        
        const notes = $(this).val();
        const req = $.ajax({
            url: '/users/update_notes',
            type: "POST",
            data: {
                socket_id: user_socket_id,
                notes: notes
            },
            async: true,
            cache: false
        })
        req.done(function(data){
            safe_to_save = true;
            if(data.success){
                $("#notes-paper-status").text("Notes saved!");
                window.setTimeout(function(){
                    $("#notes-paper-status").text("Ready");
                }, 2500);
            }
        });
        req.fail(function(){
            safe_to_save = true;
        })
    }
}