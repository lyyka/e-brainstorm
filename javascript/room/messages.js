$(document).ready(function(){
    // Fix positioning of elements in chat
    const controls_height = $("#msg-controls").outerHeight();
    $("#messages-main-wrap").css('max-height', ($(window).height() - controls_height - $("#chat-header").outerHeight()) + 'px');
    $("#messages-main-wrap").css('padding-bottom', controls_height + 'px');

    // ui events
    $("#close-chat").click(closeChat)
    $("#open-chat").click(openChat)
});

function openChat(e){
    $("#main-chat-wrap").show();
}
function closeChat(e){
    $("#main-chat-wrap").hide();
}