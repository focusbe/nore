
declare interface ObjectConstructor {
    assign(...objects: Object[]): Object;
}
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;
const url = require("url");
const path = require("path");
import { DEBUG, isproduct } from './libs/env';
if(!isproduct){
    var serverurl:string = require('_serverurl').replace('http://','');
}
class WinManager {
    private static defaultWindow: { [key: string]: any } = {
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
    public static winCache: { [key: string]: any } = {};
    constructor() {

    }
    static newwindow(tag: string, src: string = '', config: { [key: string]: any } = {}) {
        var self = this;
        for (var i in config) {
            this.defaultWindow[i] = config[i];
        }

        if (!this.winCache[tag]) {
            if (!src) {
                return;
            }
            self.winCache[tag] = new BrowserWindow(config);

            self.winCache[tag].once("ready-to-show", function () {

                let hwnd = self.winCache[tag].getNativeWindowHandle(); //获取窗口句柄。
                self.winCache[tag].show();
                if (typeof config.onShow == "function") {
                    config.onShow();
                }
            });
            self.winCache[tag].webContents.on("dom-ready", function () {
                self.winCache[tag].webContents.executeJavaScript('window.WINDOWTAG="' + tag + '"');
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
    static getUrl(src: string, config: { [key: string]: any }) {
        let search = config.search || "";
        let hash = config.hash || "";
        let cururl: string;
        if (src.indexOf("//") < 0) {
            cururl = url.format({
                pathname:path.join(__dirname, "../renderer/" + src),
                protocol: isproduct?"file":'file',
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

export default WinManager;