var ailoop = 2;
var nextloop = 5;

function ai(tradeview, msg) {


    nextloop--;
    if (val.result === "WIN") {


        if (ailoop > 0) {
            tradeview.vol = tradeview.vol * 0.95;

            sendsms("X2: Loop:" + ailoop)
            tradeview.tradetype="LIVE";
            socket.emit(window.conf.uuid, tradeview);
            ailoop--;
        } else {
            tradeview.vol = 1;
            ailoop = 2;
        }
    }
    if (nextloop == 0) {
        nextloop = 5;
        setai = 0;
    }


}


