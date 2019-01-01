import WinManager from "./winmanager";
const electron = require("electron");
const ipcMain = electron.ipcMain;
class MySocket {
    callbacks: { [key: string]: Function }
    sendTo(tag: string, event: string, data: { [key: string]: any }={}) {
        if (!WinManager.winCache[tag]) {
            return;
        }
        if (!event) {
            return;
        }
        if (!data) {
            data = null;
        }
        WinManager.winCache[tag].webContents.send("senddata", {
            'event': event,
            'data': data
        });
    }
    sendAll(event: any, data: any) {
        for (var i in WinManager.winCache) {
            WinManager.winCache[i].webContents.send("senddata", {
                'event': event,
                'data': data
            });
        }
    }
    on(event: string, callback: Function) {
        this.callbacks[event] = callback;
    }
    // on: {
    //     open: function(data) {
    //         console.log(data)
    //         var url = !!data.url ? data.url : "main.html";
    //         var hash = !!data.hash ? data.hash : "";
    //         var search = !!data.search ? data.search : "";
    //         Main.createWindow(data.tag, url, {
    //             hash: data.hash,
    //             search: data.search
    //         });
    //     }
    // },
    private static instance = new MySocket()

    static getInstance(): MySocket {
        return MySocket.instance
    }
    private constructor() {
        var self = this;
        ipcMain.on("senddata", function (socket: any, result: any) {
            console.log('senddata');
            console.log(result);
            if (!!result && !!result.tag && !!result.event) {
                let tag = result.tag;
                let event: string = result.event;
                if (!result.data) {
                    result.data = null;
                }
                let data = result.data;
                if (tag == "ALLwinCache") {
                    self.sendAll(event, data);
                } else if (tag == 'MAIN') {
                    console.log('MAIN');
                    console.log(data);
                    if (typeof (self.callbacks[event]) == 'function') {
                        self.callbacks[event](data);
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
const mySocket = MySocket.getInstance();
export default mySocket;