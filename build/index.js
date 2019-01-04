const webpack = require("webpack");
const UI = require("readline-ui");
const ui = new UI();
const BrowserSync = require("browser-sync");
const chalk = require("chalk");
const { deleteFolder, runSh, arguments } = require("./util");
const getConfig = require("./webpack.config");
const ProgressPlugin = require("webpack/lib/ProgressPlugin");
class Build {
    constructor(mode) {
        this.names = {
            main: "主进程",
            renderer: "渲染进程"
        };
        this.configs = {
            main: getConfig("main", mode),
            renderer: getConfig("renderer", mode)
        };
        this.compilers = {};
        this.mode = mode;
        this.electronPro = null;
    }
    async run() {
        try {
            deleteFolder("./dist");
            deleteFolder("./output");
            await this.webpack('renderer');
            await this.webpack('main');
            if (mode == "production") {
                await this.builder();
            } else {
                await this.startserver();
                await this.startElectron();
            }
        } catch (error) {
            console.log(error);
        }
    }
    webpack(target) {
        var self = this;
        let name = this.names[target];
        let config = this.configs[target];
        return new Promise(function(result, reject) {
            let compiler = webpack(config);
            self.compilers[target] = compiler;
            compiler.apply(
                new ProgressPlugin(function(percentage, msg) {
                    ui.render(
                        self.name +
                            "：" +
                            chalk.green(parseInt(percentage * 100) + "%")
                    );
                })
            );
            console.log(chalk.blue("------开始打包" + name + "-------"));
            compiler.run((err, stats) => {
                if (err || stats.hasErrors()) {
                    let error =
                        err ||
                        stats.toString({
                            colors: true
                        });
                    // 在这里处理错误
                    process.stdout.write(error + "\n");
                    reject(error);
                } else {
                    console.log(
                        stats.toString({
                            colors: true
                        })
                    );
                    console.log(
                        chalk.green("------" + name + "打包完成-------")
                    );
                    result(true);
                }
                // 处理完成
            });
        });
    }
    startserver() {
        var self = this;
        return new Promise(function(result, reject) {
            let browsersync = BrowserSync.create();
            try {
                browsersync.init(
                    {
                        server: {
                            baseDir: self.configs["renderer"].output.path,
                            index: "index.html",
                            https: true
                        }
                    },
                    function() {
                        result(true);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }
    startElectron() {
        if (!!this.electronPro) {
            try {
                this.electronPro.kill();
            } catch (error) {}
        }
        this.electronPro = runSh("npm run electron", function(event, data) {
            if (event == "close") {
                console.log(chalk.yellow("electron 退出"));
            } else {
                console.log(data);
            }
        });
    }
    builder() {
        const builder = require("electron-builder");
        const Platform = builder.Platform;
        builder.build({
            
        });
    }
}
var mode = !!arguments["mode"] ? arguments["mode"] : "development";
var build = new Build(mode);
build.run();
