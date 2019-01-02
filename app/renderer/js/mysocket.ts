const ipcRenderer = require("electron").ipcRenderer;
interface SocketEvent {
    event: string;
    data: any;
}
declare var WINDOWTAG:string;
class MySocket {
    private callback: any = {};
    private ajaxid: number = 0;
    private static instance = new MySocket();
    static getInstance(): MySocket {
        return MySocket.instance;
    }
    constructor() {
        var self = this;
        ipcRenderer.on("senddata", function(sender: any, data: SocketEvent) {
            if (!data) {
                return;
            }
            if (
                !!data.event &&
                typeof self.callback[data["event"]] == "function"
            ) {
                if (!!data.data) {
                    data.data = null;
                }
                self.callback[data["event"]](data.data);
            }
        });
    }
    public sendTo(tag: string, event: string, data: SocketEvent) {
        if (!tag || !event) {
            return;
        }
        if (!data) {
            data = null;
        }
        ipcRenderer.send("senddata", {
            tag: tag,
            event: event,
            data: data
        });
    }

    public sendAll(event: string, data: any) {
        ipcRenderer.send("senddata", {
            tag: "ALLWINDOWS",
            event: event,
            data: data
        });
    }

    public send(event: string, data: any) {
        if (!event) {
            return;
        }
        if (!data) {
            data = null;
        }
        this.sendTo("MAIN", event, data);
    }
    public on(event: string, callback: Function) {
        var self = this;
        self.callback[event] = callback;
    }
    public ajax(url:string,callback:Function){
        this.send('AJAX',{
            url:url,
            callbackid:++this.ajaxid,
            windowtag:WINDOWTAG
        });
        this.on('AJAX_'+this.ajaxid,callback)
    }
}
const mySocket = MySocket.getInstance();
export default mySocket;
