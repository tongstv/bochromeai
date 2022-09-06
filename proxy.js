var tat = 0;

if (tat == 1) {
    var config = {
        mode: "system",
        rules: {
            singleProxy: {
                scheme: "http",
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

var api_key = "TLlBpry4vJGOH0e4YjJWqsRQZDWU1GMTS0dSXf"

function changeIP() {

    theUrl = "http://proxy.tinsoftsv.com/api/getProxy.php?key=" + api_key;
    req.open("GET", theUrl); // false for synchronous request
    req.send(null);
}
var req = new XMLHttpRequest();
theUrl = "http://proxy.tinsoftsv.com/api/getProxy.php?key=" + api_key;
req.open("GET", theUrl); // false for synchronous request
req.send(null);

req.onreadystatechange = function () {
    if (req.readyState === 4) {
        var response = req.responseText;
        var json = JSON.parse(response);

        if (json.success) {
            proxy = json.proxy;
            next_change = parseInt(json.next_change);
            timeout = parseInt(json.timeout);
            requestOK = true;

            status1 = "<a style='color:black'>Connected! " + proxy + "</a>";
            status2 = "timeout: " + timeout + "s";
            connectTimeout = timeout;
            nextchange = next_change;
            myTimeOutvalue = (connectTimeout - 30) * 1000;


            lastRequest = Math.round(new Date().getTime() / 1000);
            var proxyArr = proxy.split(":");


            var config = {
                mode: "fixed_servers",
                rules: {
                    singleProxy: {
                        scheme: "http",
                        host: proxyArr[0],
                        port: parseInt(proxyArr[1])
                    },
                    bypassList: ["*.tinsoftsv.com"]
                }
            };

            chrome.proxy.settings.set(
                {value: config, scope: 'regular'}, function () {
                });

            interval_obj = setTimeout(function () {
                changeIP();

            }, myTimeOutvalue);


        } else {

            error = json.description;
            nextchange = 15;
            status1 = "<a style='color:red'>Connect fail!</a>";
            status2 = error;

        }

        console.log(json);


    } else {


        var config = {
            mode: "system",
            rules: {
                singleProxy: {
                    scheme: "http",
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


};

