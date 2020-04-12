// let opened = false;
let msgs_list = [];
let nomsgs_removed = false;
$(document).ready(function(){
    // ui events
    $("#close-chat").click(closeChat)
    $("#open-chat").click(openChat)

    // Events
    $("#send-msg").click(sendMessage);
    $("#msg-input").keydown(inputEnter);
    $("#remove-send-idea").click(endSendIdea); // little X btn
    $("#ideas-panel").on('click', 'div.idea-block > div.idea-block-footer > span.send-idea-to-chat', sendIdeaToChat);
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
            // $(".no-msgs-img").remove();
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
    if(!nomsgs_removed){
        $(".no-msgs-img").remove();
        nomsgs_removed = true;
    }

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
    if(msg.attachment != undefined){
        msg_wrap.attr('attachment-id', msg.attachment);
    }
    msg_wrap.addClass("message");

    // Par. to store the time/date
    const sender_text = $("<p></p>");
    sender_text.addClass("text-muted mb-0");
    // date_text.text(`${convert_to_double(msg.date.hours)}:${convert_to_double(msg.date.minutes)}`);

    // Reply button
    const reply = $("<span></span>")
    reply.html('<i class="fas fa-reply"></i>')
    reply.addClass('align-middle text-muted cursor-pointer d-inline-block')

    // Final message container
    const msg_main = $("<div></div>");
    msg_main.addClass("msg-cont d-inline-block py-2 px-3 rounded shadow-sm border");
    msg_main.html($(`<div>${msg.text}</div>`));

    // Separate users from other messages
    if(msg.sender == user_socket_id){
        sender_text.text("Me");
        msg_wrap.addClass("text-right");
        msg_main.addClass("sent-msg mb-2 text-white");
        reply.addClass("mr-2");
    }
    else{
        // sender_text.text(`User#${msg.sender.substring(msg.sender.indexOf('#', 0) + 1, msg.sender.indexOf('#', 0) + 6)}`);
        sender_text.text(msg.username);
        msg_wrap.addClass("text-left");
        msg_main.addClass("received-msg mb-2 text-dark");
        reply.addClass("ml-2");
    }

    if(msgs_list.length == 0 || (msgs_list.length > 0 && msgs_list[msgs_list.length - 1].sender != msg.sender)){
        msg_wrap.append(sender_text);
    }

    let reply_appended = false;
    if (msg.sender == user_socket_id) {
        msg_wrap.append(reply);
        reply_appended = true;
    }

    if (msg.attachment != undefined){
        const req = $.ajax({
            url: '/ideas/get_idea',
            type: 'GET',
            data: {
                id: msg.attachment
            },
            async: true,
            cache: false
        });
        req.done(function (data) {
            if(data.idea != undefined){
                addIdeaToCustomWrap(data.idea, msg_main[0], true)
                msg_wrap.append(msg_main);
                if (!reply_appended) {
                    msg_wrap.append(reply);
                }
                list.append(msg_wrap);
            }
        });
    }
    else{
        msg_wrap.append(msg_main);
        if(!reply_appended){
            msg_wrap.append(reply);
        }
        list.append(msg_wrap);
    }

    msgs_list.push(msg);
    list.animate({ scrollTop: list.prop("scrollHeight") }, 1000);
}

function sendMessage(e){
    const msg_input = $("#msg-input");
    // Get message from input
    const msg_text = msg_input.val();

    if(msg_text.trim() != ""){
        const attachment = msg_input.attr('attachment')
        // Make a request
        const req = $.ajax({
            url: '/messages/send',
            type: 'POST',
            data: {
                socket_id: user_socket_id,
                text: msg_text,
                attachment_idea_id: attachment
            },
            async: true,
            cache: false
        });

        req.done(function (data) {
            if (data.success) {
                $(".no-msgs-img").remove();
                msg_input.val("");
                if(attachment != undefined){
                    endSendIdea(null);
                }
            }
        });
    }
}

function sendIdeaToChat(e){
    const idea_html = $(this).parents().eq(1).clone();
    idea_html.find(".send-idea-to-chat").remove();
    $('#msg-input').attr('attachment', $(this).attr('id'));
    $(".idea-to-send-wrap").html(idea_html);
    $(".idea-attachment-wrap").removeClass("d-none");
    openChat(undefined);
}

function endSendIdea(e){
    $('#msg-input').removeAttr('attachment');
    $(".idea-attachment-wrap").addClass("d-none");
    $(this).parents().eq(1).find(".idea-to-send-wrap").empty();
    adjustPosition();
}

function inputEnter(e){
    if (e.keyCode == 13) {
        sendMessage(e);
    }
}

function openChat(e){
    $("#main-chat-wrap").show();
    // Fix the positioning
    adjustPosition();
}
function closeChat(e){
    // opened = false;
    $("#main-chat-wrap").hide();
}