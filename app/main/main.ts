const electron = require("electron");
const path = require("path");
const app = electron.app;
const Menu = electron.Menu;
import { inarar, DEBUG, isproduct } from "./libs/env";
import AutoUpdater from "./autodater";
import mySocket from "./mysocket";
import WinManager from "./winmanager";
import initMenu from "./initmenu";
const fs = require('fs');

// if (DEBUG) {
//     require("electron-watch")(
//         __dirname,
//         "electron", // npm scripts, means: npm run dev:electron-main
//         path.join(__dirname, "../"), // cwd
//         2000 // debounce delay
//     );
// }
class Main {
    constructor() {
        var self = this;
        app.on("ready", function() {

            initMenu(app);
            WinManager.newwindow("main", "index.html");
            
        });
        app.on("window-all-closed", function() {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });
        app.on("activate", function() {
            WinManager.newwindow("main");
        });
        AutoUpdater.init();
        this.watch();
    }
    watch(){
        if(DEBUG){
            fs.watch(__filename,function(event:any,filename:any){
                app.exit();
            });
        }

    }
}
export default Main;
var main = new Main();
