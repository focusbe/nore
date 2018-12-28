const electron = require("electron");
const app = electron.app;
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
const autoUpdater = require("electron-updater").autoUpdater;
var inarar = __dirname.indexOf("app.asar") > -1;
let DEBUG = true;
var isproduct = inarar;
let defaultWindow = {
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

const Main = {
    callback: [],
    Windows: {},
    init: function() {
        var self = this;
        app.on("ready", function() {
            self.setAppMenu();
            self.createWindow("main", "main.html");
        });
        app.on("window-all-closed", function() {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });
        app.on("activate", function() {
            self.createWindow("main");
        });
        var browserify = require("browserify");
        this.initfenfa();
        this.initUpdater();
    },
    initUpdater: function() {
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
    },
    setAppMenu: function() {
        var self = this;
        const template = [
            {
                label: "编辑",
                submenu: [
                    {
                        label: "撤销",
                        accelerator: "CmdOrCtrl+Z",
                        selector: "undo:"
                    },
                    {
                        label: "重做",
                        accelerator: "Shift+CmdOrCtrl+Z",
                        selector: "redo:"  
                    },
                    {
                        type: "separator"
                    },
                    {
                        label: "剪切",
                        accelerator: "CmdOrCtrl+X",
                        selector: "cut:"
                    },
                    {
                        label: "复制",
                        accelerator: "CmdOrCtrl+C",
                        selector: "copy:"
                    },
                    {
                        label: "粘贴",
                        accelerator: "CmdOrCtrl+V",
                        selector: "paste:"
                    },
                    {
                        label: "全选",
                        accelerator: "CmdOrCtrl+A",
                        selector: "selectAll:"
                    }
                ]
            },
            {
                label: "视图",
                submenu: [
                    {
                        label: "刷新",
                        role: "reload"
                    },
                    {
                        label: "强制刷新",
                        role: "forcereload"
                    },
                    {
                        label: "开发者工具",
                        role: "toggledevtools"
                    },
                    {
                        type: "separator"
                    },
                    {
                        label: "重置缩放",
                        role: "resetzoom"
                    },
                    {
                        label: "缩小",
                        role: "zoomin"
                    },
                    {
                        label: "放大",
                        role: "zoomout"
                    },
                    {
                        type: "separator"
                    },
                    {
                        label: "全屏",
                        role: "togglefullscreen"
                    }
                ]
            },
            {
                label:"窗口",
                role: "window",
                submenu: [
                    {
                        lable: "最小化",
                        role: "minimize"
                    },
                    {
                        lable: "关闭",
                        role: "close"
                    }
                ]
            },
            {
                label: "帮助",
                role: "learn more",
                submenu: [
                    {
                        label: "关于",
                        click() {
                            require("electron").shell.openExternal(
                                "https://www.baidu.com"
                            );
                        }
                    }
                ]
            }
        ];

        if (process.platform === "darwin") {
            template.unshift({
                label: app.getName(),
                submenu: [
                    {
                        label: "关于",
                        role: "about"
                    },
                    {
                        type: "separator"
                    },
                    {
                        label: "服务",
                        role: "services",
                        submenu: []
                    },
                    {
                        type: "separator"
                    },
                    {
                        label: "隐藏",
                        role: "hide"
                    },
                    {
                        label: "隐藏其他",
                        role: "hideothers"
                    },
                    {
                        label: "显示",
                        role: "unhide"
                    },
                    {
                        type: "separator"
                    },
                    {
                        label: "退出",
                        role: "quit"
                    }
                ]
            });

            // Edit menu
            template[1].submenu.push(
                {
                    type: "separator"
                },
                {
                    label: "语音助手",
                    submenu: [
                        {
                            label: "开启语音",
                            role: "startspeaking"
                        },
                        {
                            label: "关闭语音",
                            role: "stopspeaking"
                        }
                    ]
                }
            );

            // Window menu
            template[3].submenu = [
                {
                    label: "关闭",
                    role: "close"
                },
                {
                    label: "最小化",
                    role: "minimize"
                },
                {
                    label: "缩放",
                    role: "zoom"
                },
                {
                    type: "separator"
                },
                {
                    label: "置顶",
                    role: "front"
                }
            ];
        }
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    },
    getUrl: function (src, config) {
        console.log(config);
        var search = config.search || "";
        console.log(search);
        var hash = config.hash || "";
        console.log('hash---');
        console.log(hash);
        if (src.indexOf("//") < 0) {
            cururl = url.format({
                pathname: path.join(__dirname, (!isproduct ? "src/" : "dist/") + src),
                protocol: "file",
                slashes: true,
                search: search,
                hash: hash
            });
        } else {
            cururl = src;
        }
        return cururl;
    },
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

                let hwnd = self.Windows[tag].getNativeWindowHandle(); //获取窗口句柄。
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
        } else {
            self.Windows[tag].loadURL(this.getUrl(src, config));
            self.Windows[tag].show();
        }
        // and load the index.html of the app.
    },
    sendTo: function(tag, event, data) {
        if (!this.Windows[tag]) {
            return;
        }
        if (!event) {
            return;
        }
        if (!data) {
            data = null;
        }
        this.Windows[tag].webContents.send("senddata", {
            event: event,
            data: data
        });
    },
    sendAll: function(event, data) {
        for (var i in this.Window) {
            this.Window[i].webContents.send("senddata", {
                event: event,
                data: data
            });
        }
    },
    on:{
        open:function(data){
            console.log(data)
            var url = !!data.url?data.url:"main.html";
            var hash = !!data.hash?data.hash:"";
            var search = !!data.search?data.search:"";
            Main.createWindow(data.tag, url, {
                hash:data.hash,
                search: data.search
            });
            
        }
    },
    initfenfa: function() {
        var self = this;
        ipcMain.on("senddata", function(socket,result) {
            console.log('senddata');
            console.log(result);
            if (!!result && !!result.tag && !!result.event) {
                let tag = result.tag;
                let event = result.event;
                if (!result.data) {
                    result.data = null;
                }
                let data = result.data;
                if (tag == "ALLWINDOWS") {
                    self.sendAll(event, data);
                } else if(tag=='MAIN'){
                    console.log('MAIN');
                    console.log(data);
                    if(typeof(self.on[event])=='function'){
                        self.on[event](data);
                    }
                    
                } else {
                    self.sendTo(tag, event, data);
                }
            } else {
                console.log("no params");
            }
        });
    }
};
Main.init();
