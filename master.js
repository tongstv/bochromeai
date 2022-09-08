

function master() {
    if (window.conf.masterid === '') {


        socket.on("slave" + window.conf.uuid, async function (from, msg) {

            if (msg === 'restart' && from !== window.conf.uuid) {
                sendsms("restart by slave");
                chrome.runtime.reload();
            } else {
                let check = await CheckStatusURL(window.conf.web + '/api/wallet/binaryoption/spot-balance');

                if (check !== 1) {
                    socket.emit("slave", window.conf.uuid, "restart");
                    sendsms("reset by master")
                    console.log("reset slave");
                }
            }

        });
    }
}


async function CheckStatusURL(url) {

    return new Promise(async function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        let loop = 1;

        xhr.onreadystatechange = async function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                json = JSON.parse(xhr.responseText)
                resolve(1);


            }

            if (xhr.readyState === 4 && xhr.status === 401) {


                resolve(0)

            }

        };

        xhr.timeout = 1000;
        xhr.ontimeout = (e) => {

            resolve(0)

        };
        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token').trim())
        xhr.setRequestHeader("Content-Type", "application/json");


        xhr.send()

    });

}

