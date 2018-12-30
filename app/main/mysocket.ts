class static MySocket{
    static sendTo(tag, event, data) {
        if (!this.Windows[tag]) {
            return;
        }
        if (!event) {
            return;
        }
        if (!data) {
            data = null;
        }
        this.Windows[tag].webContents.send("senddata", {
            event: event,
            data: data
        });
    },
    static sendAll(event, data) {
        for (var i in this.Window) {
            this.Window[i].webContents.send("senddata", {
                event: event,
                data: data
            });
        }
    },
    on: {
        open: function(data) {
            console.log(data)
            var url = !!data.url ? data.url : "main.html";
            var hash = !!data.hash ? data.hash : "";
            var search = !!data.search ? data.search : "";
            Main.createWindow(data.tag, url, {
                hash: data.hash,
                search: data.search
            });
        }
    },
    constructor() {
        var self = this;
        ipcMain.on("senddata", function (socket, result) {
            console.log('senddata');
            console.log(result);
            if (!!result && !!result.tag && !!result.event) {
                let tag = result.tag;
                let event = result.event;
                if (!result.data) {
                    result.data = null;
                }
                let data = result.data;
                if (tag == "ALLWINDOWS") {
                    self.sendAll(event, data);
                } else if (tag == 'MAIN') {
                    console.log('MAIN');
                    console.log(data);
                    if (typeof (self.on[event]) == 'function') {
                        self.on[event](data);
                    }

                } else {
                    self.sendTo(tag, event, data);
                }
            } else {
                console.log("no params");
            }
        });
    }
}
export default MySocket;