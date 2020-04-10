let opened = false;
let msgs_list = [];
$(document).ready(function(){
    // ui events
    $("#close-chat").click(closeChat)
    $("#open-chat").click(openChat)

    // Events
    $("#send-msg").click(sendMessage);
    $("#msg-input").keydown(inputEnter);
    socket.on("new_message", msgReceived)
});

function adjustPosition(){
    const controls_height = $("#msg-controls").outerHeight();
    const header_height = $("#chat-header").outerHeight();
    $("#messages-main-wrap").css('max-height', ($(window).height() - controls_height  - header_height) + 'px');
    $("#messages-main-wrap").css('padding-bottom', controls_height + 'px');
}

function loadExistingMessages(){
    const req = $.ajax({
        url: '/messages/get_all',
        type: 'GET',
        async: true,
        cache: false
    })
    req.done(function (data) {
        if(data.messages.length > 0){
            $(".no-msgs-img").remove();
            data.messages.forEach(msg => {
                msgReceived(msg)
            })
        }
        else{
            const list = $("#msgs-list");
            const centered_div = $("<div></div>");
            centered_div.addClass("text-center");
            const img = $("<img/>");
            img.attr('src', '/images/nomsgs.png');
            img.addClass("img-fluid w-50 no-msgs-img");
            centered_div.append(img);
            list.append(centered_div);
        }
    });
}

function msgReceived(msg){ 
    // Convert from 1 digit to 2 digit hours/minutes
    const convert_to_double = (number) => {
        let text = `${number}`;
        if(number < 10){
            text = `0${number}`;
        }
        return text;
    };

    // Main wrap for all messages
    const list = $("#msgs-list");

    // Wrap for message
    const msg_wrap = $("<div></div>");
    msg_wrap.addClass("message");

    // Par. to store the time/date
    const sender_text = $("<p></p>");
    sender_text.addClass("text-muted mb-0");
    // date_text.text(`${convert_to_double(msg.date.hours)}:${convert_to_double(msg.date.minutes)}`);

    // Message text container
    const msg_cont = $("<div></div>");
    msg_cont.addClass("msg-cont");

    // Final message container
    const msg_main = $("<div></div>");
    msg_main.addClass("d-inline-block py-2 px-3 rounded shadow-sm border");
    msg_main.text(msg.text);

    // Separate users from other messages
    if(msg.sender == user_socket_id){
        sender_text.text("Me");
        msg_wrap.addClass("text-right");
        msg_main.addClass("pink-bg text-white");
    }
    else{
        sender_text.text(`User#${msg.sender.substring(msg.sender.indexOf('#', 0) + 1, msg.sender.indexOf('#', 0) + 6)}`);
        msg_wrap.addClass("text-left");
        msg_main.addClass("received-msg text-dark");
    }

    if(msgs_list.length == 0 || (msgs_list.length > 0 && msgs_list[msgs_list.length - 1].sender != msg.sender)){
        msg_wrap.append(sender_text);
    }
    msg_cont.append(msg_main);
    msg_wrap.append(msg_cont);

    list.append(msg_wrap);
    msgs_list.push(msg);
}

function sendMessage(e){
    const msg_input = $("#msg-input");
    // Get message from input
    const msg_text = msg_input.val();

    if(msg_text.trim() != ""){
        // Make a request
        const req = $.ajax({
            url: '/messages/send',
            type: 'POST',
            data: {
                socket_id: user_socket_id,
                text: msg_text
            },
            async: true,
            cache: false
        });

        req.done(function (data) {
            if (data.success) {
                $(".no-msgs-img").remove();
                msg_input.val("");
            }
        });
    }
}

function inputEnter(e){
    if (e.keyCode == 13) {
        sendMessage(e);
    }
}

function openChat(e){
    if (opened) { $("#main-chat-wrap").hide(); opened = false; }
    else{
        opened = true;
        $("#main-chat-wrap").show();
        // Fix the positioning
        adjustPosition();
    }
}
function closeChat(e){
    opened = false;
    $("#main-chat-wrap").hide();
}