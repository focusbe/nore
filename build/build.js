const { runSh, platform, deleteFolder } = require("./util");
try {
    deleteFolder("./dist");
    deleteFolder("./output");
    
} catch (error) {
    
}

var renderer = runSh("npm run dist-renderer", function(event, data) {
    if (event == "data" || event == "error") {
        console.log("dist-renderer:", data);
        if (data.indexOf("Built at:") > -1) {
            renderer.kill();
            console.log("Success:渲染进程代码打包完成");
            console.log("开始打包主进程代码");
            var main = runSh("npm run dist-main", function(event, data) {
                if (event == "data" || event == "error") {
                    console.log("dist-main:", data);
                    if (data.indexOf("Built at:") > -1) {
                        main.kill();
                        console.log("Success:主进程代码打包完成");
                        console.log("开始构建安装包");
                        let electronsh = "npm run electron-builder ";
                        if (platform == "win") {
                            electronsh += "--x64";
                        }
                        runSh(electronsh, function(event, data) {
                            if (event == "close") {
                                console.log("构建安装包退出");
                            } else {
                                console.log("electron-builder:", data);
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
