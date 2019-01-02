var electronPro;
const {
    runSh,
    deleteFolder
} = require("./util");
try {
    deleteFolder("./dist");
    deleteFolder("./output");

} catch (error) {

}
console.log("开始打包主进程代码");
var main = runSh("npm run start-main", function (event, data) {
    if (event == "data" || event == "error") {
        console.log("dist-main:", data);
        if (data.indexOf("Built at:") > -1) {
            console.log("Success:主进程代码打包完成");
            if (!!electronPro) {
                console.log('重启Electron');
                electronPro.kill();
            } else {
                console.log('启动Electron');
            }
            let electronsh = "npm run electron";
            electronPro = runSh(electronsh, function (event, data) {
                if (event == "close") {
                    console.log("Electron退出");
                } else {
                    console.log("Electron:", data);
                }
            });
        }
    } else {
        console.log("打包主进程退出");
    }
});

var renderer = runSh("npm run start-rendder", function (event, data) {
    if (event == "data" || event == "error") {
        console.log("dist-renderer:", data);
        if (data.indexOf("Built at:") > -1) {
            console.log("Success:渲染进程代码打包完成");
        }
    } else {
        console.log("打包渲染进程退出");
    }
});