$(function () {


    uuid = localStorage.getItem("uuid");


    $("#uuid").html("<a href=\"https://api.stv.ai/tradeview/" + uuid + "\" target=\"_blank\">UUID: " + uuid + "</a>")
    window.open('https://api.stv.ai/tradeview/' + uuid)


});

