/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/Users/liu/www/github/webcreator/dist/main";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../node_modules/electron-updater/out/main.js":
/*!**********************************************************************************!*\
  !*** /Users/liu/www/github/webcreator/node_modules/electron-updater/out/main.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/Users/liu/www/github/webcreator/node_modules/electron-updater/out/main.js'");

/***/ }),

/***/ "./autodater.ts":
/*!**********************!*\
  !*** ./autodater.ts ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _libs_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./libs/env */ "./libs/env.ts");
/* harmony import */ var _mysocket__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mysocket */ "./mysocket.ts");
const autoUpdater = __webpack_require__(/*! electron-updater */ "../../node_modules/electron-updater/out/main.js").autoUpdater;


class AutoUpdater {
    static init() {
        if (_libs_env__WEBPACK_IMPORTED_MODULE_0__["DEBUG"]) {
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
            _mysocket__WEBPACK_IMPORTED_MODULE_1__["default"].sendTo("main", "update-downloaded");
        });
        autoUpdater.checkForUpdates();
    }
}
/* harmony default export */ __webpack_exports__["default"] = (AutoUpdater);


/***/ }),

/***/ "./initmenu.ts":
/*!*********************!*\
  !*** ./initmenu.ts ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const electron = __webpack_require__(/*! electron */ "electron");
const Menu = electron.Menu;
function setAppMenu(app) {
    var self = this;
    let template;
    template = [
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
            label: "窗口",
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
                        __webpack_require__(/*! electron */ "electron").shell.openExternal("https://www.baidu.com");
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
        template[1].submenu.push({
            type: "separator"
        }, {
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
        });
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
}
/* harmony default export */ __webpack_exports__["default"] = (setAppMenu);


/***/ }),

/***/ "./libs/env.ts":
/*!*********************!*\
  !*** ./libs/env.ts ***!
  \*********************/
/*! exports provided: inarar, DEBUG, isproduct */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "inarar", function() { return inarar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEBUG", function() { return DEBUG; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isproduct", function() { return isproduct; });
const inarar = __dirname.indexOf("app.asar") > -1;
const DEBUG = true;
const isproduct = inarar;



/***/ }),

/***/ "./main.ts":
/*!*****************!*\
  !*** ./main.ts ***!
  \*****************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _autodater__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./autodater */ "./autodater.ts");
/* harmony import */ var _winmanager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./winmanager */ "./winmanager.ts");
/* harmony import */ var _initmenu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./initmenu */ "./initmenu.ts");
const electron = __webpack_require__(/*! electron */ "electron");
const app = electron.app;
const Menu = electron.Menu;



class Main {
    constructor() {
        var self = this;
        app.on("ready", function () {
            Object(_initmenu__WEBPACK_IMPORTED_MODULE_2__["default"])(app);
            _winmanager__WEBPACK_IMPORTED_MODULE_1__["default"].newwindow("main", "index.html");
        });
        app.on("window-all-closed", function () {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });
        app.on("activate", function () {
            _winmanager__WEBPACK_IMPORTED_MODULE_1__["default"].newwindow("main");
        });
        _autodater__WEBPACK_IMPORTED_MODULE_0__["default"].init();
    }
}
;
var main = new Main();


/***/ }),

/***/ "./mysocket.ts":
/*!*********************!*\
  !*** ./mysocket.ts ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _winmanager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./winmanager */ "./winmanager.ts");

const electron = __webpack_require__(/*! electron */ "electron");
const ipcMain = electron.ipcMain;
class MySocket {
    constructor() {
        var self = this;
        ipcMain.on("senddata", function (socket, result) {
            console.log('senddata');
            console.log(result);
            if (!!result && !!result.tag && !!result.event) {
                let tag = result.tag;
                let event = result.event;
                if (!result.data) {
                    result.data = null;
                }
                let data = result.data;
                if (tag == "ALLwinCache") {
                    self.sendAll(event, data);
                }
                else if (tag == 'MAIN') {
                    console.log('MAIN');
                    console.log(data);
                    if (typeof (self.callbacks[event]) == 'function') {
                        self.callbacks[event](data);
                    }
                }
                else {
                    self.sendTo(tag, event, data);
                }
            }
            else {
                console.log("no params");
            }
        });
    }
    sendTo(tag, event, data = {}) {
        if (!_winmanager__WEBPACK_IMPORTED_MODULE_0__["default"].winCache[tag]) {
            return;
        }
        if (!event) {
            return;
        }
        if (!data) {
            data = null;
        }
        _winmanager__WEBPACK_IMPORTED_MODULE_0__["default"].winCache[tag].webContents.send("senddata", {
            'event': event,
            'data': data
        });
    }
    sendAll(event, data) {
        for (var i in _winmanager__WEBPACK_IMPORTED_MODULE_0__["default"].winCache) {
            _winmanager__WEBPACK_IMPORTED_MODULE_0__["default"].winCache[i].webContents.send("senddata", {
                'event': event,
                'data': data
            });
        }
    }
    on(event, callback) {
        this.callbacks[event] = callback;
    }
    static getInstance() {
        return MySocket.instance;
    }
}
// on: {
//     open: function(data) {
//         console.log(data)
//         var url = !!data.url ? data.url : "main.html";
//         var hash = !!data.hash ? data.hash : "";
//         var search = !!data.search ? data.search : "";
//         Main.createWindow(data.tag, url, {
//             hash: data.hash,
//             search: data.search
//         });
//     }
// },
MySocket.instance = new MySocket();
const mySocket = MySocket.getInstance();
/* harmony default export */ __webpack_exports__["default"] = (mySocket);


/***/ }),

/***/ "./winmanager.ts":
/*!***********************!*\
  !*** ./winmanager.ts ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _libs_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./libs/env */ "./libs/env.ts");
const electron = __webpack_require__(/*! electron */ "electron");
const BrowserWindow = electron.BrowserWindow;
const url = __webpack_require__(/*! url */ "url");
const path = __webpack_require__(/*! path */ "path");

class WinManager {
    constructor() {
    }
    static newwindow(tag, src = '', config = {}) {
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
            if (_libs_env__WEBPACK_IMPORTED_MODULE_0__["DEBUG"]) {
                this.winCache[tag].webContents.openDevTools();
            }
            self.winCache[tag].on("closed", function () {
                if (typeof config.onClose == "function") {
                    config.onClose();
                }
                self.winCache[tag] = null;
                delete self.winCache[tag];
            });
        }
        else {
            self.winCache[tag].loadURL(this.getUrl(src, config));
            self.winCache[tag].show();
        }
        // and load the index.html of the app.
    }
    static getUrl(src, config) {
        let search = config.search || "";
        let hash = config.hash || "";
        let cururl;
        console.log(path.join(__dirname, (!_libs_env__WEBPACK_IMPORTED_MODULE_0__["isproduct"] ? "../renderer/" : "../renderer/") + src));
        if (src.indexOf("//") < 0) {
            cururl = url.format({
                pathname: path.join(__dirname, (!_libs_env__WEBPACK_IMPORTED_MODULE_0__["isproduct"] ? "../renderer/" : "../renderer/") + src),
                protocol: "file",
                slashes: true,
                search: search,
                hash: hash
            });
        }
        else {
            cururl = src;
        }
        return cururl;
    }
}
WinManager.defaultWindow = {
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
WinManager.winCache = {};
/* harmony default export */ __webpack_exports__["default"] = (WinManager);


/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map