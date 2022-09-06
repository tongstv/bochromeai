var func = {

    "waittime": 0,
    "wait": function (time) {


        if (Date.now() > this.waittime) {

            console.log("RUN");
            this.waittime = Date.now()+time*100;
        } else {

            console.log("Wait: " + (this.waittime - Date.now()) / 1000 + " sec");
        }
    }

}

func.wait(100);

func.wait(10);

func.wait(30)