const electron = require("electron");
const path = require("path");
const app = electron.app;
const Menu = electron.Menu;
import { inarar, DEBUG, isproduct } from "../libs/env";
import AutoUpdater from "./autodater";
import mySocket from "./mysocket";
import WinManager from "./winmanager";
import initMenu from "./initmenu";

const fs = require('fs');
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
                app.exit();
            }
        });
        app.on("activate", function() {
            //WinManager.newwindow("main");
        });
        app.on("quit",function(){
            WinManager.closeAll();
        })
        AutoUpdater.init();
        this.watch();
    }
    watch(){
        if(DEBUG){
            
            fs.watch(__filename,function(event:any,filename:any){
                app.exit();
                app.quit();
            });
        }
    }
}
export default Main;
var main = new Main();
