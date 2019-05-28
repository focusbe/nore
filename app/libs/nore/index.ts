// import Util from "../util";
import path from "path";
import Configs from "../configs";
import fs from "fs-extra";
import Files from "../files";
import webpack from "webpack";
console.log(__dirname);
const getConfig = require("../../build/webpack.config.js");
class Nore {
    private static instance: Nore;
    private cache = {};
    constructor() {}
    static getInstance(): Nore {
        if (!Nore.instance) {
            Nore.instance = new Nore();
            //window.Nore = this.instance;
        }
        return this.instance;
    }
    async require(id) {
        if (!!this.cache[id]) {
            return this.cache[id];
        }
        // var self = this;
        // let moduleDir = path.resolve(Configs.getHome(), id);
        // let tempDir = path.resolve(moduleDir, ".temp");
        // let distDir = path.resolve(tempDir, "dist");
        // let jssrc = path.resolve(distDir, "index.js");
        // let entryjs = path.resolve(tempDir, "entry.js");
        // let exists = await fs.pathExists(jssrc);
        // if (!exists) {
        //     await this.packModules(id);
        // } else {
        //     let fileList: any = Files.getList(moduleDir);
        //     var stats = await fs.stat(jssrc);
        //     if (!!stats && !!stats.mtime) {
        //         //console.log(stats.mtime.getTime());
        //         // return stats.mtime.getTime();
        //         for (var i in fileList) {
        //             if (fileList[i].indexOf(".temp") > -1) {
        //                 continue;
        //             }
        //             if (!!Files.getMtime(fileList[i]) && Files.getMtime(fileList[i]) > stats.mtime) {
        //                 await this.packModules(id);
        //                 break;
        //             }
        //         }
        //     }
        // }

        // //打包完成后加载打包后的js并缓存变量；
        // var head = document.getElementsByTagName("head")[0];
        // var script = document.createElement("script");
        // script.type = "text/javascript";
        // var res = await new Promise(function(resolve, reject) {
        //     script.onreadystatechange = function() {
        //         // console.log(this);
        //         if (this.readyState == "complete") {
        //             resolve(true);
        //         }
        //     };
        //     script.onload = function() {
        //         resolve(true);
        //     };
        //     script.onerror = function(err) {
        //         reject(err);
        //     };
        //     script.src = jssrc;
        //     head.appendChild(script);
        // });
        //return res;
    }
    async packModules(id) {
        //打包需要的模块们，创建入口页面，然后运行webpack打包；
        var webpackConfig = getConfig("renderer", "");
        let moduleDir = path.resolve(Configs.getHome(), id);
        let tempDir = path.resolve(moduleDir, ".temp");
        let distDir = path.resolve(tempDir, "dist");
        let jssrc = path.resolve(distDir, "index.js");
        let entryjs = path.resolve(tempDir, "entry.js");
        let entrystr = require("./build/entry.js").default;
        entrystr = entrystr.replace("__ExtensionDir__", moduleDir.replace(/\\/g, "/"));
        console.log(entrystr);
        //
        // entrystr = entrystr.replace("__ModuleId__", id);
        let mainjs = path.resolve(tempDir, "main.js");
        await Files.writeFile(mainjs, entrystr);
        // let mainjs =
        webpackConfig.entry = mainjs;
        webpackConfig.output = {
            libraryTarget: "commonjs",
            filename: "index.js",
            path: distDir,
            publicPath: distDir
        };
        webpackConfig.mode = "development";
        console.log(webpackConfig);
        let compiler = webpack(webpackConfig);
        return await new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
                if (!!err || stats.hasErrors()) {
                    if (!err) {
                        err = new Error(stats.compilation.errors);
                    }
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
}
const nore = Nore.getInstance();
// nore.packModules('extension');

export default nore;
