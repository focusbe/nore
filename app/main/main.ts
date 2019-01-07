
const electron = require("electron");
const app = electron.app;
const Menu = electron.Menu;
import {inarar,DEBUG,isproduct} from './libs/env';
import AutoUpdater from './autodater';
import mySocket from './mysocket';
import WinManager from './winmanager'
import initMenu from './initmenu';
class Main {
    constructor(){
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

        
    }
};
var main = new Main();
