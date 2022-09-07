async function checkonline() {


    return new Promise(async (resolve, reject) => {


        var checkonline = setTimeout(async () => {


            let myonline = await CheckStatusURL(window.conf.web + '/api/wallet/binaryoption/spot-balance');

            if (myonline === 1) {
                socket.emit(window.conf.masterid + "master", window.conf.uuid);
                socket.on(window.conf.uuid + "slave", function (msg) {


                    if (parseInt(msg) === 1) {
                        resolve(1);
                    }

                });
            } else {
                resolve(0);
            }

        });

        setTimeout(() => {

            clearTimeout(checkonline);
            resolve(0);

        }, 10000)


    });


}

function master() {
    if (window.conf.masterid === '') {

        socket.on(window.conf.uuid + "master", async function (uuid) {
            let check = await CheckStatusURL(window.conf.web + '/api/wallet/binaryoption/spot-balance');
            socket.emit(uuid + "slave", check);


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

        xhr.timeout = 8000;
        xhr.ontimeout = (e) => {

            resolve(0)

        };
        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token').trim())
        xhr.setRequestHeader("Content-Type", "application/json");


        xhr.send()

    });

}

