const webpack = require("webpack");
const UI = require("readline-ui");
const ui = new UI();
ui.rl.on('SIGINT', function(){
    if(process.platform == 'win32'){
        runSh('taskkill -f -t -im electron.exe',function(){});
    }
    
    console.log(chalk.yellow('再次按Ctrl+C退出'));
});
const {
    resolve
} = require('path');
const chalk = require("chalk");
const {
    deleteFolder,
    runSh,
    arguments
} = require("./util");
const getConfig = require("./webpack.config");
const ProgressPlugin = require("webpack/lib/ProgressPlugin");
const WebpackDevServer = require('webpack-dev-server');
var net = require('net')

// 获取一个可用的端口
// 执行
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
        this.progress = {

        };
        this.electronPro = null;
    }
    getReadyPortFrom(port, cb, times) {
        var self = this;
        if (!times) {
            times = 0;
        }
        var server = net.createServer().listen(port)
        server.on('listening', function () {
            server.close()
            cb(port)
        })
        server.on('error', function (err) {
            if (err.code === 'EADDRINUSE') {
                if (times < 10) {
                    times++;
                    port += 2;
                    self.getReadyPortFrom(port, cb, times);
                } else {
                    cb(false)
                }
            }
        })
    }
    async run() {
        var self = this;
        try {
            deleteFolder("./dist");
            deleteFolder("./output");
        } catch {
            console.log('删除打包文件失败');
        }
        try {
            if (self.mode == 'development') {
                var devPort = await new Promise(function (result, reject) {
                    self.getReadyPortFrom(3000, function (port) {
                        result(port);
                    });
                });
                if (!devPort) {
                    console.log(chalk.red('获取可用端口失败'));
                    return;
                }
                var localurl = 'http://127.0.0.1:' + devPort + '/';
                console.log(chalk.green(devPort+'端口可用'));
                var oldentry = this.configs['renderer'].entry['app'];
                this.configs['renderer']['entry']['app'] = oldentry.concat(['webpack-dev-server/client?' + localurl, 'webpack/hot/dev-server']);
                this.configs['renderer'].plugins = (this.configs['renderer'].plugins || []).concat([
                    new webpack.HotModuleReplacementPlugin(),
                ]);
                this.configs['renderer'].output.publicPath = localurl;
                this.configs['main'].externals.push(
                    function (context, request, callback) {
                        if (request == '_serverurl') {
                            return callback(null, '"' + localurl + '"');
                        }
                        callback();
                    }
                );
            }
            else{
                var localurl = '';
                this.configs['renderer'].output.publicPath = localurl;
                this.configs['main'].externals.push(
                    function (context, request, callback) {
                        if (request == '_serverurl') {
                            return callback(null, '"' + localurl + '"');
                        }
                        callback();
                    }
                );
            }
            var renwebpack = await this.webpack('renderer');
            var mainwebpack = await this.webpack('main');
            if (self.mode == 'development') {
                await this.startserver(renwebpack, devPort);
                await this.addWatch(mainwebpack, function (res) {
                    if (res && self.mode == 'development') {
                        console.log(chalk.green('启动客户端'));
                        setTimeout(self.startElectron, 2000);
                    }
                });
            } else {
                await this.runWebpack(renwebpack);
                await this.runWebpack(mainwebpack);
                await this.builder();
            }
        } catch (error) {
            console.log(error);
        }
    }
    runWebpack(packobj) {
        return new Promise(function (result, reject) {
            packobj.run((err, stats) => {
                let res = true;
                if (err || stats.hasErrors()) {
                    let error =
                        err ||
                        stats.toString({
                            colors: true
                        });
                    // 在这里处理错误
                    console.log('打包出现错误');
                    process.stdout.write(error + "\n");
                    result(false);
                } else {
                    console.log(
                        stats.toString({
                            colors: true
                        })
                    );
                    console.log(
                        chalk.green("------打包完成-------")
                    );
                    result(true);
                }
            })
        });
    }
    addWatch(packobj, onChange) {
        packobj.watch({
            ignored: /node_modules|dist|output/
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
                res = false;
            } else {
                console.log(
                    stats.toString({
                        colors: true
                    })
                );
                console.log(
                    chalk.green("------打包完成-------")
                );
            }
            if (typeof (onChange) == 'function') {
                onChange(res);
            }
        })
    }
    printProgress() {
        var progressStr = '';
        for (var i in this.progress) {
            progressStr += this.names[i] +
                "：" +
                chalk.green(this.progress[i]) + '       ';
        }
        ui.render(progressStr);
    }
    webpack(target, onChange) {
        var self = this;
        let config = this.configs[target];
        return new Promise(function (result, reject) {
            try {
                let compiler = webpack(config);
                self.compilers[target] = compiler;
                compiler.apply(
                    new ProgressPlugin(function (percentage, msg) {
                        self.progress[target] = parseInt(percentage * 100) + "%";
                        self.printProgress();
                    })
                );
                result(compiler);
            } catch (error) {
                reject(error);
            }
        });
    }
    startserver(compiler, port) {
        var self = this;
        if (!!self.browsersync) {
            self.browsersync.reload();
        }
        return new Promise(function (result, reject) {
            let server = new WebpackDevServer(compiler, {
                hot: true,
                contentBase: resolve(__dirname, '../dist/renderer/'),
                publicPath: '/',
                // port: '3000',
                writeToDisk: true
            });
            server.listen(port, "localhost", function () {

                console.log('Listening at http://127.0.0.1:' + port);
                result(server);
            })
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