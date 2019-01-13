import WinManager from "./winmanager";
const electron = require("electron");
const ipcMain = electron.ipcMain;
class MySocket {
    callbacks: { [key: string]: Function } = {};
    private static instance = new MySocket();
    static getInstance(): MySocket {
        return MySocket.instance;
    }
    public sendTo(tag: string, event: string, data: any) {
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
            event: event,
            data: data
        });
    }
    public sendAll(event: any, data: any) {
        for (var i in WinManager.winCache) {
            WinManager.winCache[i].webContents.send("senddata", {
                event: event,
                data: data
            });
        }
    }
    public on(event: string, callback: Function) {
        console.log('绑定事件',event);
        console.log(this.callbacks);
        this.callbacks[event] = callback;
    }
    private constructor() {
        var self = this;
        ipcMain.on("senddata", function(socket: any, result: any) {
            console.log("senddata");
            console.log(result);
            if (!!result && !!result.tag && !!result.event) {
                let tag = result.tag;
                let event: string = result.event;
                if (!result.data) {
                    result.data = null;
                }
                let data = result.data;
                if (tag == "ALLWINDOWS") {
                    self.sendAll(event, data);
                } else if (tag == "MAIN") {
                    console.log("MAIN");
                    console.log(data);
                    if (typeof self.callbacks[event] == "function") {
                        self.callbacks[event](data);
                    }
                } else {
                    self.sendTo(tag, event, data);
                }
            } else {
                console.log("no params");
            }
        });
        this.on("AJAX", async function(data: any) {
            var self = MySocket.instance;
            if (!data || !data.url || !data.callbackid || !data.windowtag) {
                return;
            }
            if (data.data) {
                data.data = null;
            }
            let curCall = self.callbacks["AJAX_" + data.url];
            if (typeof curCall == "function") {
                let res = await curCall(data.data);
                await self.sendTo(data.windowtag, "AJAX_" + data.ajaxid, res);
            }
        });
    }
    public onAjax(url: string, callback: Function) {
        this.callbacks["AJAX_" + url] = function() {
            new Promise(function(resolve, err) {
                
            });
        };
    }
}
const mySocket = MySocket.getInstance();
export default mySocket;
