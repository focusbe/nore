const autoUpdater = require("electron-updater").autoUpdater;
import {inarar,DEBUG,isproduct} from '../libs/env';
import mySocket from "./mysocket";
function myconsole(data:any){
    mySocket.sendTo("main", "console",data);
}
class AutoUpdater{
    static inited = false;
    static init() {
        return;
        if(this.inited){
            return;
        }
        this.inited = true;
        myconsole("DEBUG:"+DEBUG);
        if (DEBUG) {
            return;
        }
        var self = this;
        autoUpdater.on("checking-for-update", () => {
            myconsole('检查更新中');
        });
        autoUpdater.on("update-available", (ev:any, info:any) => {
            // if (DEBUG) {
            //     myconsole('有更新');
            // }
            myconsole('有更新');
        });
        autoUpdater.on("update-not-available", (ev:any, info:any) => {
            // myconsole('not-available');
            //alert('无更新');
            myconsole('无更新');
        });
        autoUpdater.on("error", (ev:any, err:any) => {
            myconsole('error:');
            //myconsole(ev);
            myconsole(err);
        });
        autoUpdater.on("download-progress", (ev:any, progressObj:any) => {
            myconsole('download progress');
            myconsole(ev);
            myconsole(progressObj);
            // 			{total: 83452555,
            //   delta: 233280,
            //   transferred: 437227,
            //   percent: 0.5239228445432258,
            //   bytesPerSecond: 174751 }
            //self.sendTo('main','alert','Download progress...');
        });
        autoUpdater.on("update-downloaded", (ev:any, info:any) => {
            myconsole('update-downloaded');
            // setTimeout(function () {
            // 	autoUpdater.quitAndInstall();
            // }, 5000)
            mySocket.sendTo("main", "console","update downloaded");
            mySocket.sendTo("main", "updateDownloaded",null);
        });
        
    }
    static check(){
        myconsole('checkForUpdates');
        if (DEBUG) {
            return;
        }
        autoUpdater.checkForUpdates();
    }
    static install(){
        autoUpdater.quitAndInstall();
    }
}
AutoUpdater.init();
export default AutoUpdater;
