import Util from "../util";
import path from "path";
import Configs from "../configs";
import fs from "fs-extra";
import Files from "../files";
class Nore {
    private static instance: Nore;
    private cache = {};
    constructor() {}
    static getInstance(): Nore {
        if (!Nore.instance) {
            Nore.instance = new Nore();
            window.Nore = this.instance;
        }
        return this.instance;
    }
    async require(id) {
        if (!!this.cache[id]) {
            return this.cache[id];
        }
        var self = this;
        let moduleDir = path.resolve(Configs.getHome(), id);
        let tempDir = path.resolve(moduleDir, ".temp");
        let distDir = path.resolve(tempDir, "dist");
        let jssrc = path.resolve(distDir, "index.js");
        let entryjs = path.resolve(tempDir, "entry.js");
        let exists = await fs.pathExists(jssrc);
        if (!exists) {
            await this.packModules(id);
        } else {
            let fileList: any = Files.getList(moduleDir);
            var stats = await fs.stat(jssrc);
            if (!!stats && !!stats.mtime) {
                //console.log(stats.mtime.getTime());
                // return stats.mtime.getTime();
                for (var i in fileList) {
                    if (fileList[i].indexOf(".temp") > -1) {
                        continue;
                    }
                    if (
                        !!Files.getMtime(fileList[i]) &&
                        Files.getMtime(fileList[i]) > stats.mtime
                    ) {
                        await this.packModules(id);
                        break;
                    }
                }
            }
        }

        //打包完成后加载打包后的js并缓存变量；
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.type = "text/javascript";
        await new Promise(function(resolve, reject) {
            script.onreadystatechange = function() {
                // console.log(this);
                if (this.readyState == "complete") {
                    resolve();
                }
            };
            script.onload = function() {
                resolve();
            };
            script.onerror = function(err) {
                reject(err);
            };
            script.src = jssrc;
            head.appendChild(script);
        });
    }
    async packModules(id) {
        //打包需要的模块们，创建入口页面，然后运行webpack打包；
    }
    export(id, obj) {
        //导出模块，在其他webpack中打包的js中执行，用于把变量导出到Nore中，方便require；
        this.cache[id] = obj;
    }
}
const nore = Nore.getInstance();
export default nore;
