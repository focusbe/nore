const webpack = require("webpack");
const UI = require("readline-ui");
const ui = new UI();
const BrowserSync = require("browser-sync");
const chalk = require("chalk");
const {
    deleteFolder,
    runSh,
    arguments
} = require("./util");
const getConfig = require("./webpack.config");
const ProgressPlugin = require("webpack/lib/ProgressPlugin");
class Build {
    constructor(mode) {
        this.names = {
            main: "主进程",
            renderer: "渲染进程",
            client: 'Node代码'
        };
        this.configs = {
            main: getConfig("main", mode),
            renderer: getConfig("renderer", mode),
            client: getConfig("client", mode),
        };
        this.compilers = {};
        this.mode = mode;
        this.electronPro = null;
    }
    async run() {
        var self = this;
        try {
            deleteFolder("./dist");
            deleteFolder("./output");
            var browser = await self.startserver();
            //console.log(browser.get('server'));
            var localurl = browser.options.getIn(["urls", "local"]) + '/';
            
            if(self.mode=='development'){
                this.configs['main'].externals.push(
                    function(context, request, callback) {
                        if (request=='_serverurl') {
                            return callback(null,'"'+localurl+'"');
                        }
                        callback();
                    }
                );
                this.configs['renderer'].output.publicPath = localurl;
            }
            
            var renwebpack = await this.webpack('renderer', function (res) {
                if (res && self.mode == 'development') {
                    console.log(chalk.green('刷新页面'));
                    self.browsersync.reload();
                }
            });
            // var clientpack = await this.webpack('client', function (res) {
            //     if (res && self.mode == 'development') {
            //         BrowserSync.reload();
            //     }
            // })
            var mainwebpack = await this.webpack('main', function (res) {
                if (res && self.mode == 'development') {
                    console.log(chalk.green('启动客户端'));
                    setTimeout(self.startElectron, 2000);
                }
            });
            // await ui.pause();
            if (mode == "production") {
                await this.builder();
            }
        } catch (error) {
            console.log(error);
        }
    }
    addWatch(packobj, cb) {
        console.log('开始监听');
        var renwatching = packobj.watch({
            aggregateTimeout: 300,
            ignored: /node_modules|dist|output/
        }, (err, stats) => {
            if (err || stats.hasErrors()) {
                let error =
                    err ||
                    stats.toString({
                        colors: true
                    });
                // 在这里处理错误
                process.stdout.write(error + "\n");
                cb(false, error);
            } else {
                cb(true);
            }
        });
    }
    webpack(target, onChange, onOptions) {
        var self = this;
        let name = this.names[target];
        let config = this.configs[target];
        return new Promise(function (result, reject) {
            let compiler = webpack(config);
            self.compilers[target] = compiler;
            compiler.apply(
                new ProgressPlugin(function (percentage, msg) {
                    ui.render(
                        name +
                        "：" +
                        chalk.green(parseInt(percentage * 100) + "%")
                    );
                })
            );
            console.log(chalk.blue("------开始打包" + name + "-------"));
            compiler.watch({
                ignored: /node_modules/
            }, (err, stats) => {
                let res = true;
                if (err || stats.hasErrors()) {
                    let error =
                        err ||
                        stats.toString({
                            colors: true
                        });
                    // 在这里处理错误
                    process.stdout.write(error + "\n");
                    reject(error);
                    res = false;
                } else {


                    console.log(
                        stats.toString({
                            colors: true
                        })
                    );
                    console.log(
                        chalk.green("------" + name + "打包完成-------")
                    );
                    result(compiler);
                }
                if (typeof (onChange) == 'function') {
                    onChange(res);
                }
                // 处理完成
            });
        });
    }
    startserver() {
        var self = this;
        if (!!self.browsersync) {
            self.browsersync.reload();
        }
        return new Promise(function (result, reject) {
            let browsersync = BrowserSync.create('server');
            self.browsersync = browsersync;
            try {
                browsersync.init({
                    server: {
                        baseDir: self.configs["renderer"].output.path,
                        index: "index.html",

                    },
                    open: false
                },
                    function (error, bs) {
                        if (!!error) {
                            reject(null);
                        }
                        result(bs);
                    }
                );
            } catch (error) {
                reject(null);
            }
        });
    }
    startElectron() {
        if (!!this.electronPro) {
            try {
                this.electronPro.kill();
            } catch (error) {

            }
        }
        this.electronPro = runSh("npm run electron", function (event, data) {
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