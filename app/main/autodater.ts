const autoUpdater = require("electron-updater").autoUpdater;
import {inarar,DEBUG,isproduct} from './libs/env';
class AutoUpdater{
    static init() {
        if (DEBUG) {
            return;
        }
        var self = this;
        autoUpdater.on("checking-for-update", () => {
            //console.log('checking');
        });
        autoUpdater.on("update-available", (ev, info) => {
            // if (DEBUG) {
            //     console.log('有更新');
            // }
            // console.log('available');
        });
        autoUpdater.on("update-not-available", (ev, info) => {
            // console.log('not-available');
            //alert('无更新');
        });
        autoUpdater.on("error", (ev, err) => {
            //console.log('error:');
            //console.log(ev);
            // console.log(err);
        });
        autoUpdater.on("download-progress", (ev, progressObj) => {
            // console.log('download progress');
            // console.log(ev);
            // console.log(progressObj);
            // 			{total: 83452555,
            //   delta: 233280,
            //   transferred: 437227,
            //   percent: 0.5239228445432258,
            //   bytesPerSecond: 174751 }
            //self.sendTo('main','alert','Download progress...');
        });
        autoUpdater.on("update-downloaded", (ev, info) => {
            //console.log('update-downloaded');
            // setTimeout(function () {
            // 	autoUpdater.quitAndInstall();
            // }, 5000)
            self.sendTo("main", "update-downloaded");
        });
        autoUpdater.checkForUpdates();
    }
}
export default AutoUpdater;
