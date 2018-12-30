var autoUpdater = require("electron-updater").autoUpdater;
import { DEBUG } from './env';
var AutoUpdater = /** @class */ (function () {
    function AutoUpdater() {
    }
    AutoUpdater.init = function () {
        if (DEBUG) {
            return;
        }
        var self = this;
        autoUpdater.on("checking-for-update", function () {
            //console.log('checking');
        });
        autoUpdater.on("update-available", function (ev, info) {
            // if (DEBUG) {
            //     console.log('有更新');
            // }
            // console.log('available');
        });
        autoUpdater.on("update-not-available", function (ev, info) {
            // console.log('not-available');
            //alert('无更新');
        });
        autoUpdater.on("error", function (ev, err) {
            //console.log('error:');
            //console.log(ev);
            // console.log(err);
        });
        autoUpdater.on("download-progress", function (ev, progressObj) {
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
        autoUpdater.on("update-downloaded", function (ev, info) {
            //console.log('update-downloaded');
            // setTimeout(function () {
            // 	autoUpdater.quitAndInstall();
            // }, 5000)
            self.sendTo("main", "update-downloaded");
        });
        autoUpdater.checkForUpdates();
    };
    return AutoUpdater;
}());
export default AutoUpdater;
