conf = {}
window.ref = 0;

async function getBlance(live = 'DEMO') {

    let res = await get(window.conf.web + '/api/wallet/binaryoption/spot-balance', 15000);
    let liveBalance = res.d.availableBalance;
    let DemoBalance = res.d.demoBalance;
    if (live === 'DEMO') {
        return DemoBalance;
    } else {
        return liveBalance;
    }

}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

async function checkconnect() {


    let autoref = 0;
    var req = new XMLHttpRequest();
    req.timeout = 10000;
    req.open("GET", web); // false for synchronous request
    req.send(null);

    req.onreadystatechange = async () => {
        if (req.readyState === 4 && req.status === 200) {

            setInterval(() => {

                let intrade = localStorage.getItem("intrade");
                if (intrade !== 1) {


                    get(window.conf.web + "/api/wallet/binaryoption/transaction/open?page=1&size=10&betAccountType=DEMO", 10000).then((json) => {

                        autoref++;
                        if (autoref > 20) {
                            autoref = 0;

                            chrome.runtime.reload();
                        }

                        console.log("auto refet")
                        //sendsms(JSON.stringify(json))
                    })
                }

            }, 62000)
            await appstart()


        }
    }
    req.ontimeout = () => {


        sendsms("Connent: " + window.conf.web + " fail!")

    }

}

async function checkweb() {

    return await getURL(web, 10000);
}

async function sock5s(add) {


    if (add.indexOf('http') === 0) {
        add = await get(add);
        add = add.sock;

    }

    if (add === '') {
        var config = {
            mode: "system",
            rules: {
                singleProxy: {
                    scheme: "socks5",
                    host: "0.0.0.0",
                    port: 8080
                },
                bypassList: ["*.tinsoftsv.com"]
            }
        };

        chrome.proxy.settings.set(
            {value: config, scope: 'regular'}, function () {
            });
    } else {
        sendsms("Wait Connenct Sock5: " + add)
        let proxyArr = add.split(":");
        var config = {
            mode: "fixed_servers",
            rules: {
                singleProxy: {
                    scheme: "socks5",
                    host: proxyArr[0],
                    port: parseInt(proxyArr[1])
                },
                bypassList: ["*.tinsoftsv.com"]
            }
        };
        chrome.proxy.settings.set(
            {value: config, scope: 'regular'}, function () {
            });

        var req = new XMLHttpRequest();
        req.timeout = 10000;
        req.open("GET", web); // false for synchronous request
        req.send(null);

        req.onreadystatechange = () => {
            if (req.readyState === 4 && req.status === 200) {

                sendsms("Connect sock5 " + add + " success!")
            }
        }
        req.ontimeout = () => {

            sendsms("Sock5: " + add + " TimeOut!");
            var config = {
                mode: "system",
                rules: {
                    singleProxy: {
                        scheme: "socks5",
                        host: "0.0.0.0",
                        port: 8080
                    },
                    bypassList: ["*.tinsoftsv.com"]
                }
            };

            chrome.proxy.settings.set(
                {value: config, scope: 'regular'}, function () {
                });
        }
    }
}


function getkey(key) {


    if (conf[key] === '' || conf[key] === null || conf[key] === undefined) {

        conf = localGet("config");
        console.log(conf)
        if (conf) {
            conf = JSON.parse(conf)
            conf = conf
            return conf[key];
        }


    } else {
        return conf[key]
    }


}

var last_gettoken = 0;
var last_resettoken = 0;

async function gettoken() {


    if (Date.now() < last_gettoken) {
        return;
    }
    last_gettoken = Date.now() + 30000;


    landangnhap++;


    if (_has(window, "gettoken_lock")) {

        if (Date.now() < window.gettoken_lock) {
            console.log("Đang lấy token");
            return false;
        }
    }
    window.gettoken_lock = (Date.now() / 1000) + 120

    if (landangnhap < 3) {


        sendsms("Wait decode google captcha")

        capcha = await getcapcha(window.conf.web + '/login', window.conf.sitekey)


        console.log("token new" + window.conf.email + "_" + window.conf.password)
        let data = {
            "captcha": capcha,
            "captcha_geetest": {
                "captcha_output": "",
                "gen_time": "",
                "lot_number": "",
                "pass_token": ""
            },
            "client_id": window.conf.client_id,
            "email": window.conf.email,
            "grant_type": "password",
            "password": window.conf.password
        }

        console.log(data)
        token = await postJSON(window.conf.web + '/api/auth/auth/token', data)

        console.log(token)
        if (_has(token, "ok") && token.ok !== false) {


            localStorage.setItem("token", token.d.access_token)
            localStorage.setItem("refresh_token", token.d.refresh_token)
            localStorage.setItem("email", window.conf.email);

            console.log(token)

            localSet("config", JSON.stringify(conf))
            sendsms("login success!")
            //https://vista.trade/api/auth/auth/token-2fa
            var accesstoken = token.d.t

            if (window.conf.secret !== '') {

                let code = await post('https://api.stv.ai/googleauth.php', 'secret=' + window.conf.secret.trim())

                if (code == '') sendsms('Not get 2fa Code')

                let token2fa =
                    {
                        "client_id": window.conf.client_id,
                        "token": accesstoken,
                        "code": code,
                        "td_code": "",
                        "td_p_code": ""
                    }


                token2 = await postJSON(window.conf.web + '/api/auth/auth/token-2fa', token2fa)


                if (_has(token2, "ok") && token2.ok !== false) {


                    console.log(token2)

                    //   localStorage.setItem("refresh_token", token.d.refresh_token)

                    localStorage.setItem("token", token2.d.access_token)
                    localStorage.setItem("refresh_token", token2.d.refresh_token)

                    sendsms("auth 2fa OK")


                } else {
                    sendsms("auth 2fa Error")
                }
                console.log("secret:" + token)


            }


        } else if (_has(token, "ok") && token.ok == false) {

            sendsms(JSON.stringify(token))
        }
    } else if (landangnhap >= 3 && landangnhap < 6) {

        await sock5s(window.conf.sock5)

    } else {
        setTimeout(() => {


            landangnhap = 0;
        }, 15 * 60000)
        sendsms("Please changer new ip or wait 15m")
    }


}

var reftoken1 = 0;

async function reftoken() {

    console.log("reft token")

    if (Date.now() < last_resettoken) {
        return;
    }
    last_resettoken = Date.now() + 30000;

    if (localStorage.getItem('refresh_token') !== '' && localStorage.getItem('refresh_token') !== undefined) {
        data = {
            "captcha": "string",
            "captcha_geetest": {
                "captcha_output": "",
                "gen_time": "",
                "lot_number": "",
                "pass_token": ""
            },
            "client_id": "deniex-web",
            "grant_type": "refresh_token",
            "refresh_token": localStorage.getItem('refresh_token')
        }
        token = await postJSON(window.conf.web + '/api/auth/auth/token?refresh=1', data);


        if (_has(token, "ok") && token.ok !== false) {


            localStorage.setItem("token", token.d.access_token)
            localStorage.setItem("refresh_token", token.d.refresh_token)
            localSet("config", JSON.stringify(conf))

            reftoken1 = 0

        }

        lanlanmoi++;
        if (lanlanmoi > 2) {

            await gettoken();
            lanlanmoi = 0;
        }
        return token


    } else {
        reftoken1 = 0;
        await gettoken()
    }


}

async function slide(type, vol, demo = "DEMO") {

    if (type === 'buy') {
        var data = {
            "betAccountType": demo,
            "betAmount": vol,
            "betType": "UP"
        }
    } else if (type === 'sell') {

        var data = {
            "betAccountType": demo,
            "betAmount": vol,
            "betType": "DOWN"
        }
    }


    return new Promise(async function (resolve, reject) {

        console.log(data)

        res = await trade(window.conf.web + "/api/wallet/binaryoption/bet", data)

        if (_has(res, "ok") && res.ok !== false) {
            resolve(res);
        } else if (res === undefined) {

            reftoken();
            /// clearInterval(inter);
        } else {


            var x = 0
            var inter = setInterval(async function () {
                console.log(data)
                x++;
                res = await trade(window.conf.web + "/api/wallet/binaryoption/bet", data)

                if (_has(res, "ok") && res.ok !== false) {
                    clearInterval(inter)
                    resolve(res);
                }
                console.log("Đuổi: " + (x * 5) + 's' + console.log(res))
            }, 7000)

        }

        setTimeout(function () {

            clearInterval(inter)
            resolve(res)
        }, 40000)


    });

}


async function _ref() {

    setTimeout(reftoken, 5 * 60000);

}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function wait(s) {
    return new Promise(resolve => {

        sec = d.getSeconds();

        if (s >= 30) {
            if (sec > 35 && sec < 55) {
                resolve(true)
            }
        } else if (s < 30 && (sec > 10 && sec < 20)) {

            resolve(true)


        }
    });
}

function syncGet(key) {
    return new Promise(resolve => {
        chrome.storage.sync.get([key], function (items) {
            if (chrome.runtime.error || !(key in items)) resolve(undefined);
            else resolve(items[key]);
        });
    });
}

function syncSet(key, value) {
    return new Promise(resolve => {
        chrome.storage.sync.set({[key]: value}, function () {
            if (chrome.runtime.error) resolve(false);
            else resolve(true);
        });
    });
}

function syncClear() {
    return new Promise(resolve => {
        chrome.storage.sync.clear(function () {
            if (chrome.runtime.error) resolve(false);
            else resolve(true);
        });
    });
}

function localGet(key) {

    return localStorage.getItem(key)
}

function localSet(key, value) {

    return localStorage.setItem(key, value)
}


async function postJSON(url, json) {

    return new Promise(function (resolve, reject) {
        let loop = 0;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {

                //  console.log(url);
                json = JSON.parse(xhr.responseText)
                resolve(json);

            }
        };
        xhr.timeout = 15000
        xhr.ontimeout = (e) => {
            resolve(undefined)

            loop++;

            if (loop >= 3) {
                resolve(undefined)

            } else if (loop > 2) {

                sock5s(window.conf.sock5);

            }
        };
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(json))

    });
}


async function get(url, timeout = 10000) {


    return new Promise(async function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        let loop = 1;

        xhr.onreadystatechange = async function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                json = JSON.parse(xhr.responseText)
                resolve(json);


            }

            if (xhr.readyState === 4 && xhr.status === 401) {

                await reftoken()


            }

        };

        xhr.timeout = timeout
        xhr.ontimeout = (e) => {


            loop++;

            if (loop >= 3) {
                resolve(undefined)

            } else if (loop > 2) {

                sock5s(window.conf.sock5);

            }

        };
        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token').trim())
        xhr.setRequestHeader("Content-Type", "application/json");


        xhr.send()

    });
}


async function post(url, data, timeout = 10000) {

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {

                localStorage.setItem('token', xhr.responseText);
                resolve(xhr.responseText);

            }
        };
        xhr.timeout = timeout
        xhr.ontimeout = (e) => {
            resolve(undefined)
        };

        xhr.send(data)

    }, 15000);
}

async function urlGet(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url); // false for synchronous request
    req.send(null);
}

async function getcapcha(url, sitekey) {

    let capcha = await post('https://api.stv.ai/2capcha.php', 'url=' + url + '&sitekey=' + sitekey, 40000);

    if (!capcha) {

        await sock5s(window.conf.sock5);
        capcha = await post('https://api.stv.ai/2capcha.php', 'url=' + url + '&sitekey=' + sitekey, 40000);

    }
    return capcha;


}


function datetime() {

    function addZero(i) {
        if (i < 10) {
            i = "0" + i
        }
        return i;
    }

    const d = new Date();
    let h = addZero(d.getHours());
    let m = addZero(d.getMinutes());
    let s = addZero(d.getSeconds());
    let time = h + ":" + m + ":" + s;
    return time;
}

async function sendsms(txt) {


    //  console.log('Telegram Sent: ' + window.conf.chatid + ' | ' + txt)
    socket.emit('trade', window.conf.chatid, {txt: txt});
}


function _has(obj, key) {

    if (obj !== undefined)
        return hasOwnProperty.call(obj, key);
    else
        return false
};
var lan = 0;

async function trade(url, json) {

    let lan =0;
    return new Promise(async function (resolve, reject) {
        var xhr = new XMLHttpRequest();


        xhr.open("POST", url, true);

        xhr.onreadystatechange = async function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                json = JSON.parse(xhr.responseText)

                lan = 0;
                resolve(json);

            }
            if (xhr.readyState === 4 && xhr.status === 401) {

                lan++;

                if(lan ===1)
                {
                    await gettoken();
                    trade(url, json);
                }


            }
        };
        xhr.timeout = 10000
        xhr.ontimeout = async (e) => {
            await sock5s(window.conf.sock5);
            resolve(undefined)
        };

        xhr.setRequestHeader("Content-Type", "application/json");


        // console.log(localStorage.getItem('token'))
        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
        xhr.send(JSON.stringify(json))

    });
}