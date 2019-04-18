declare interface ObjectConstructor {
    assign(...objects: Object[]): Object;
}
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;
const url = require("url");
const path = require("path");
import mySocket from './mySocket';
import { DEBUG, isproduct } from "../libs/env";
if (!isproduct) {
    var serverurl: string = require("_serverurl").replace("http://", "");
}

class WinManager {
    private defaultWindow: { [key: string]: any } = {
        width: 1000,
        height: 800,
        frame: true,
        webPreferences: {
            webSecurity: false
        },
        show: false,
        titleBarStyle: "hidden",
        backgroundColor: "#3c3c3c"
    };
    public winCache: { [key: string]: any } = {};
    private constructor() {
        var self = this;
        mySocket.on('open', function (data: any) {

            self.newwindow(data.tag, '', data);
        });
    }
    private static instance = new WinManager();
    static getInstance(): WinManager {
        return WinManager.instance
    }
    public newwindow(
        tag: string,
        src: string = "index.html",
        config: { [key: string]: any } = {}
    ) {
        var self = this;
        // for (var i in this.defaultWindow) {
        //     config[i] = this.defaultWindow[i];
        // }
        config = Object.assign({},this.defaultWindow,config);
        if(!src){
            src = 'index.html';
        }
        if (!this.winCache[tag]) {
            // if (!src) {
            //     return;
            // }
            self.winCache[tag] = new BrowserWindow(config);

            self.winCache[tag].once("ready-to-show", function () {
                self.winCache[tag].show();
                if (typeof config.onShow == "function") {
                    config.onShow();
                }
            });
            
            self.winCache[tag].webContents.on("dom-ready", function () {
                self.winCache[tag].webContents.executeJavaScript(
                    'window.WINDOWTAG="' + tag + '"'
                );
            });

            self.winCache[tag].loadURL(this.getUrl(src, config));
            if (DEBUG) {
                this.winCache[tag].webContents.openDevTools();
            }
            self.winCache[tag].on("closed", function () {
                if (typeof config.onClose == "function") {
                    config.onClose();
                }
                self.winCache[tag] = null;
                delete self.winCache[tag];
            });
        } else {
            self.winCache[tag].loadURL(this.getUrl(src, config));
            self.winCache[tag].show();
        }
        // and load the index.html of the app.
    }
    closeAll() {
        for (var i in this.winCache) {
            this.winCache[i].webContents.closeDevTools();
            this.winCache[i].close();
        }
    }
    getUrl(src: string = 'index.html', config: { [key: string]: any }) {
        let search = config.search || "";
        let hash = config.hash || "";
        let cururl: string;

        if (src.indexOf("//") < 0) {
            cururl = url.format({
                pathname: path.join(__dirname, "../renderer/" + src),
                protocol: isproduct ? "file" : "file",
                slashes: true,
                search: search,
                hash: hash
            });
        } else {
            cururl = src;
        }
        return cururl;
    }
}
const winManager = WinManager.getInstance();
export default winManager;
