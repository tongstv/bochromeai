var token = localGet('token');
var chatid = localGet('chatid');
var email = localGet('email');
var password = localGet('passsword');
var web = "https://vista.trade"
var d = new Date();
var botid = localGet('botid')
var landangnhap = 0;
var lanlanmoi = 0;
var config = {}
var conf;
window.startapp = 0

var st1 = null

var boton = 0
try {


    async function start(st) {


        var loopstart = st
        if (st === 1 && boton === 0) {
            boton = 1;
            localStorage.setItem("starttime",Date.now());
            if (_has(window.conf, "sock5") && window.conf.sock5 !== '') {
                await sock5s(window.conf.sock5.trim())
            }


            await checkconnect();


        } else if (boton === 1) {

            boton = 0;
        }

    }

//  /api/wallet/binaryoption/spot-balance
// /api/wallet/binaryoption/transaction/close?page=1&size=10&betAccountType=DEMO
//
// /api/wallet/binaryoption/transaction/open?page=1&size=10&betAccountType=DEMO

    $(function () {

        uuid = localGet('uuid')
        console.log(uuid)
        if (!uuid) {
            uuid = generateUUID();
            localSet("uuid", uuid)


        }

        conf = localGet("config");

        conf = JSON.parse(conf)
        window.conf = conf;

        autostart = function () {

            return new Promise((resolve, reject) => {


                let auto = setInterval(() => {

                    conf = localGet("config");

                    conf = JSON.parse(conf)
                    window.conf = conf;
                    if (_has(window, "conf")) {
                        if (window.conf.status === '1' && window.conf.email !== '') {
                            sendsms('Start Auto Chrome ...')
                            clearInterval(auto);

                            start(1);
                            resolve(true);

                        }
                    }
                }, 5000);

                setTimeout(() => {
                    clearInterval(auto)
                }, 30000);


            });
        };

        if (boton === 0) {
            autostart();
        }
        console.log("conf" + uuid)
        socket.on("conf" + uuid, function (txt) {


                localSet("config", txt)


                conf = localGet("config");


                window.conf = JSON.parse(conf)


                console.log(conf)


                if (window.conf.status === '1') {

                    if (boton === 0) {

                        localStorage.setItem("stoploss",0);
                        localStorage.setItem("profit",0);
                        start(1);
                        sendsms('Start Chrome ...')


                    } else {
                        sendsms("Bot IS RUN...")
                    }


                } else {

                    sendsms('STOP Chrome ...')
                    start(0)
                    chrome.runtime.reload();
                }


            }
        )


    })

    sock5s("");

} catch (e) {

    console.error(e.message);
    setTimeout(()=>{
        sock5s("");
        chrome.runtime.reload();
    },10000)
} finally {




}
