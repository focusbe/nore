var defaultWindow = {
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
var Windows = /** @class */ (function () {
    function Windows() {
    }
    return Windows;
}());
{
    createWindow: function (tag, src, config) {
        var self = this;
        if (!src) {
            return;
        }
        if (!config) {
            config = {};
        }
        config = Object.assign(defaultWindow, config);
        if (!self.Windows[tag]) {
            self.Windows[tag] = new BrowserWindow(config);
            self.Windows[tag].once("ready-to-show", function () {
                var hwnd = self.Windows[tag].getNativeWindowHandle(); //获取窗口句柄。
                self.Windows[tag].show();
                if (typeof config.onShow == "function") {
                    config.onShow();
                }
            });
            self.Windows[tag].webContents.on("dom-ready", function () {
                self.Windows[tag].webContents.executeJavaScript('window.WINDOWTAG="' + tag + '"');
            });
            console.log(this.getUrl(src, config));
            self.Windows[tag].loadURL(this.getUrl(src, config));
            if (DEBUG) {
                this.Windows[tag].webContents.openDevTools();
            }
            self.Windows[tag].on("closed", function () {
                if (typeof config.onClose == "function") {
                    config.onClose();
                }
                self.Windows[tag] = null;
                delete self.Windows[tag];
            });
        }
        else {
            self.Windows[tag].loadURL(this.getUrl(src, config));
            self.Windows[tag].show();
        }
        // and load the index.html of the app.
    }
}
