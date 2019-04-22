const electron = require("electron");
const app = electron.app;
import { inarar, DEBUG, isproduct } from "../libs/env";
import AutoUpdater from "./autodater";
import WinManager from "./winmanager";
import initMenu from "./initmenu";
import mySocket from "./mysocket";
const fs = require("fs");
class Main {
    constructor() {
        var self = this;
        app.on("ready", function() {
            initMenu(app);
            WinManager.newwindow("main", "index.html");
        });
        app.on("window-all-closed", function() {
            // if (process.platform !== "darwin") {
            //     app.quit();
            //     app.exit();
            // }
            setTimeout(function(){
                app.quit();
            },500)
            //app.exit();
        });
        app.on("activate", function() {
            //WinManager.newwindow("main");
        });
        app.on("quit", function() {
            WinManager.closeAll();
        });
        mySocket.on('relaunch',function(){
            app.relaunch();
            app.exit(0);
        })
        mySocket.on('quitInstall',function(){
            AutoUpdater.install();
        })
        AutoUpdater.check();
        this.watch();
    }
    watch() {
        if (DEBUG) {
            fs.watch(__filename, function(event: any, filename: any) {
                app.exit();
                app.quit();
            });
        }
    }
}
export default Main;
var main = new Main();
