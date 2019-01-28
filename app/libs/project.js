var jsonfile = require("jsonfile");
var browserify = require("browserify");
var fs = require("fs");
var path = require("path");
import Configs from './configs';

var juicer = require("juicer");
var babelify = require("babelify");
import Files from './files';
class Projects {
    constructor() { }
    static getlist(callback) {
        if (!Configs.getItem('workshop')) {
            callback(false, '没有设置workshop');
            console.log('没有设置workshop');
            return;
        }
        var workshopdir = path.resolve(Configs.getItem('workshop'));
        Files.createdir(workshopdir, function () {
            Files.getList(workshopdir, callback);
        });
    }
    static getProject(actname, callback) {
        var actpath = path.join(
            __dirname,
            "../" + Configs.getItem('workshop') + "/" + actname + "/"
        );
        var mainsrc = actpath + "main.json";
        var logicsrc = actpath + "main.json";
        var result = {};
        try {
            result["main"] = jsonfile.readFileSync(mainsrc);
            result["logic"] = jsonfile.readFileSync(logicsrc);
        } catch (e) {
            callback(false);
        }
        callback(result);
    }
    static getTempList(callback) {
        var tempdir = path.resolve(__dirname, "../../template");
        Files.createdir(tempdir, function () {
            Files.getList(tempdir, callback);
        });
    }
}


class Project {
    constructor(config) {
        if (!config) {
            return;
        }
        if (typeof config == "string") {
            this.actname = config;
            this.path = path.join(
                __dirname,
                "../" + Configs.getItem('workshop') + "/" + this.actname + "/"
            );
            // console.log(1111);
            // console.log(fs.existsSync("xxxx"));
            if (fs.existsSync(this.path + "config.json")) {
                this.config = jsonfile.readFileSync(this.path + "config.json");

            }
        } else {
            this.config = config;

            if (!this.config.template) {
                this.config.template = "blank";
            }
        }

        return true;
    }

    getinfo(callback) {
        var mainsrc = this.path + "main.json";
        //console.log(logicsrc);
        var logicsrc = this.path + "logic.json";
        var result = {};
        try {
            result["main"] = jsonfile.readFileSync(mainsrc);
            result["logic"] = jsonfile.readFileSync(logicsrc);
            callback(result);
        } catch (e) {
            callback(false);
        }
    }

    create(callback) {
        var result = {
            ret: 1
        };
        if (!this.config.actname) {
            result.msg = "请传入活动名称";
            result.ret = -1;
            callback(result);
            return result;
        }
        if (!this.config.game) {
            result.msg = "请选择游戏";
            result.ret = -1;
            callback(result);
            return result;
        }
        if (!this.config.title) {
            result.msg = "请填写页面标题";
            result.ret = -1;
            callback(result);
            return result;
        }
        if (!this.config.desc) {
            result.msg = "请填写页面描述";
            result.ret = -1;
            callback(result);
            return result;
        }
        var self = this;
        try {
            console.log(path.resolve(__dirname, "../../template/" + this.config.template + "/"))
            console.log(path.resolve(Configs.getItem('workshop'), this.config.actname));
        } catch (error) {
            console.log(error);
        }
        try {
            let projectDir = path.resolve(Configs.getItem('workshop'), this.config.actname);
            Files.createdirAsync(projectDir).then(function () {
                jsonfile.writeFile(
                    path.join(
                        Configs.getItem('workshop') +
                        "/" +
                        self.config.actname +
                        "/config.json"
                    ),
                    self.config, {
                        spaces: 4
                    },
                    function (err) {
                        if (!err) {
                            result.msg = "创建配置文件失败";
                            result.ret = -1;
                            callback(result);
                            return;
                        } else {
                            result.msg = "成功";
                            result.ret = 1;
                            callback(result);
                            return;
                        }
                    }
                );
            }).catch(function () {
                result.msg = "复制文件失败";
                result.ret = -1;
                callback(result);
                return result;
            });
        } catch (error) {
            console.log(error);
        }

    }

    delete() { }
    isexit() { }
    save() { }
    saveMain(main, callback) {
        if (main) {
            var result = jsonfile.writeFileSync(this.path + "main.json", main);
            callback(true);
        } else {
            callback(false);
        }
    }
    saveHtml(canvasHtml, callback) { }
    saveLogic(logic, callback) {
        if (logic) {
            var result = jsonfile.writeFileSync(
                this.path + "logic.json",
                logic
            );
            callback(result);
        } else {
            callback(false);
        }
    }
    render(canvaData, canvashtml, callback) {

        var self = this;
        this.saveMain(canvaData.toJson(), function (res) {
            console.log("保存文件成功");
            var modulelist = canvaData.getModulslist();
            var b = browserify({
                // basedir: path.join(
                //     __dirname,
                //     './src/elements/views/'
                // ),
                //standalone:'statdalonename'
            }).transform(babelify, {
                presets: ["es2015"]
            });
            for (var i in modulelist) {
                b.require("./src/elements/" + modulelist[i] + '/index.js', {
                    expose: modulelist[i].replace(".js", "")
                });
            }
            b.bundle(function (err, buff) {
                console.log(err);
                if (err) {
                    callback(false);
                } else {

                    var bundlejs = buff.toString();
                    try {
                        fs.writeFileSync(
                            self.path + "assets/js/bundle.js",
                            bundlejs
                        );
                    } catch (error) {
                        callback(false);
                        return;
                    }
                    var result = console.log("保存数据");
                    console.log(res);
                    if (res) {
                        console.log("保存数据成功");
                        var template = fs.readFileSync(
                            self.path + "template.html",
                            "utf-8"
                        );
                        console.log("获取模版");
                        console.log(template);
                        if (!template) {
                            callback(false);
                            return;
                        }

                        var data = {
                            config: {
                                title: self.config.title,
                                keyword: [self.config.actname],
                                desc: self.config.desc
                            },
                            canvas: {
                                renderData: JSON.stringify(canvaData.toJson()),
                                html: canvashtml
                            }
                        };
                        var html = juicer(template, data);
                        console.log(html);
                        console.log("写文件");
                        console.log(result);
                        try {
                            var result = fs.writeFileSync(
                                self.path + "index.html",
                                html
                            );
                            //var result = fs.writeFileSync(self.path + 'index.html', html);
                            console.log("写文件");
                            console.log(true);
                            callback(true);
                        } catch (error) {
                            callback(false);
                        }
                    } else {
                        callback(false);
                    }
                }
            });
        });
    }
    runCmd() { }
    commitSvn() { }
    uploadToDev() { }
    addWorkTime() { }
}
export {
    Project,
    Files,
    Projects
};