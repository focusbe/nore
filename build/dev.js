
var electronPro;
const { runSh, platform, deleteFolder } = require("./util");
try {
    deleteFolder("./dist");
    deleteFolder("./output");
    
} catch (error) {
    
}

var renderer = runSh("npm run start-rendder", function(event, data) {
    if (event == "data" || event == "error") {
        console.log("dist-renderer:", data);
        if (data.indexOf("Built at:") > -1) {
            renderer.kill();
            console.log("Success:渲染进程代码打包完成");
            console.log("开始打包主进程代码");
            var main = runSh("npm run start-main", function(event, data) {
                if (event == "data" || event == "error") {
                    console.log("dist-main:", data);
                    if (data.indexOf("Built at:") > -1) {
                        main.kill();
                        console.log("Success:主进程代码打包完成");
                        if (!!electronPro) {
                            console.log('重启Electron');
                            electronPro.kill();
                        }
                        else{
                            console.log('启动Electron');
                        }
                        let electronsh = "npm run electron";
                        runSh(electronsh, function(event, data) {
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
        }
    } else {
        console.log("打包渲染进程退出");
    }
});

// const renderer = exec('npm run start-rendder', {
//     cwd: path.resolve(__dirname, '../'),
//     windowsHide: false
// });
// renderer.stdout.on('data', (data) => {
//     // startmain.kill(1);
//     console.log(`rendere: ${data}`);
//     if (data.indexOf('Built at:') > -1) {
//         console.log('渲染服务已启动');
//         const startmain = exec('npm run start-main', {
//             cwd: path.resolve(__dirname, '../'),
//             windowsHide: false
//         });
//         startmain.stdout.on('data', (data) => {
//             // startmain.kill(1);
//             if (data.indexOf('Built at:') > -1) {
//                 console.log('主进程已打包完成');
//                 if (!!electronPro) {
//                     console.log('重启Electron');
//                     electronPro.kill();
//                 }
//                 else{
//                     console.log('启动Electron');
//                 }
//                 electronPro = exec('npm run electron', {
//                     cwd: path.resolve(__dirname, '../'),
//                     windowsHide: false
//                 });
//                 electronPro.stdout.on('data', (data) => {
//                     console.log(`electron: ${data}`);
//                 });
//                 electronPro.stderr.on('data', (data) => {
//                     console.log(`electron-data: ${data}`);
//                 });
//                 electronPro.on('close', (code) => {
//                     console.log(`electron退出：${code}`);
//                 });
//             }
//             console.log(`main: ${data}`);

//         });
//         startmain.stderr.on('data', (data) => {
//             //console.log(`main-data: ${data}`);
//         });
//         startmain.on('close', (code) => {
//             console.log(`main退出：${code}`);
//         });
//     }
// });
// renderer.stderr.on('data', (data) => {
//     console.log(`renderer-data: ${data}`);
// });
// renderer.on('close', (code) => {
//     console.log(`renderer退出：${code}`);
// });