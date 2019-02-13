var jsonfile = require("jsonfile");
var browserify = require("browserify");
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var shortid = require("shortid");
var Configs = require("./configs");
var juicer = require("juicer");
var babelify = require("babelify");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync'); // 有多种适配器可选择
import Files from './files';
const shelljs = require('shelljs');
class Projects {
    private projectCache:{ [key: string]: any } = {}
    private static instance: Projects;
    private constructor() {}
    static getInstance(): Projects {
        if (!Projects.instance) {
            Projects.instance = new Projects();
        }
        return this.instance;
    }
    getlist() {
        return new Promise(function(reject,result){
            if (!Configs.getItem('workshop')) {
                reject('没有设置workshop');
                return;
            }
            let workshopdir = path.resolve(Configs.getItem('workshop'));
            Files.createdir(workshopdir, function () {
                Files.getList(workshopdir, function(list){
                    if(!list){
                        reject('获取文件失败');
                    }
                    result(list);
                });
            });
        });
    }
    add(config){

    }
    has(actname){
        
    }
    delete(actname) {
        return new Promise(function(reject,result){
            let projectDir = path.resolve(Configs.getItem('workshop'), actname);
            fse.remove(projectDir, err => {
                if (err){
                    reject(err);
                    return;
                }
                result(true);
            })
        });
        
    }
    getTempList() {
        return new Promise(function(reject,result){
            var tempdir = path.resolve(__dirname, "../../template");
            Files.createdir(tempdir, function () {
                Files.getList(tempdir, function(list){
                    if(!list){
                        reject('获取列表失败');
                        return;
                    }
                    result(list);
                });
            });
        });
        
    }
    openWithIed(actname) {
        return new Promise(function(reject,result){
            let vcodedir = path.resolve(Configs.getItem('vscodePath'), 'bin/code');
            if (!vcodedir) {
                reject('请配置VSCOD路径');
                return;
                // callback(false, '请配置VSCOD路径', -1);
            }
            let project = this.getProjectDir(actname);
            let sh = '"' + vcodedir + '" ' + project;
            shelljs.exec(sh, {
                async: true,
                silent: true,
            }, function (code, stdout, stderr) {
                if (!!stderr) {
                    reject(stderr);
                } else {
                    result(true);
                }
            });
        });
        
    }
    getProjectDir(actname) {
        let projectDir = path.resolve(Configs.getItem('workshop'), actname);
        return projectDir;
    }
    getProject(actname){
        if(!actname){
            return -1;
        }
        if(!!this.projectCache[actname]){
            return this.projectCache[actname];
        }
        let projectroot = path.resolve(Configs.getItem('workshop'), actname);
        if (!fs.existsSync(projectroot)) {
            return -2;
        }
        this.projectCache[actname] = new Project({
            
        });
    }
}

class Project {
    private actname:string;
    private config:object;
    private rootdir:string;
    private datadir:string;
    private db:any;
    constructor(config) {
        if (!config) {
            return;
        }
        if (typeof config == "string") {
            //项目已经存在
            this.actname = config;
            this.config = {};
        } else {
            this.config = config;
            this.actname = config.actname;
        }
        this.rootdir = path.resolve(Configs.getItem('workshop'), this.actname);
        this.datadir = path.resolve(this.rootdir, 'data');
        this.initDB();
    }
    initDB() {
        if (!!this.db) {
            return true;
        }
        if (!fs.existsSync(this.rootdir)) {
            return false;
        }
        if (!fs.existsSync(this.datadir)) {
            return false;
        }
        let adapter = new FileSync(path.resolve(this.rootdir, 'data/db.json')); // 申明一个适配器
        this.db = low(adapter);
        this.db.defaults({
                pages: [],
                info: {}
            })
            .write();
        return true;
    }

    getPageList() {
        let pages = this.db.get('pages')
            .value();
        return pages;
    }
    addPage(config) {
        if (!config || !config.name) {
            return -1;
        }
        if (this.hasPage(name)) {
            return -2;
        }
        var id = this.db.get('pages').push(
            Object.assign({
                id: shortid.generate()
            }, config, {
                tree: null
            })
        ).write();
        return id;
    }
    delPage(name) {
        if (!name || !this.hasPage(name)) {
            return -1;
        }
        var res = this.db.get('pages')
            .remove({
                name: name
            })
            .write();
        return res;
    }
    hasPage(name) {
        var hasname = this.db.get({
            name: name
        }).size();
        return !!hasname;
    }
    savePage(name, tree) {
        if (!name || !tree || !this.hasPage(name)) {
            return -1;
        }
        var res = this.db.get('pages')
            .find({
                name: name
            })
            .assign({
                tree: tree
            }).write();
        return res;
    }
    saveToFile() {

    }
    parseFile() {

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
            result.msg = "请填写项目标题标题";
            result.ret = -1;
            callback(result);
            return result;
        }
        if (!this.config.desc) {
            result.msg = "请填写项目描述";
            result.ret = -1;
            callback(result);
            return result;
        }
        var self = this;
        let projectDir = path.resolve(Configs.getItem('workshop'), this.config.actname);

        Files.createdirAsync(projectDir).then(function () {
            //保存基本信息
            Files.createdir(datadir, function (res) {
                if (!!res) {
                    var dbres = self.initDB();
                    if (dbres) {
                        try {
                            self.db.set('info', self.config)
                                .write();
                            result.msg = "成功";
                            result.ret = 1;
                            callback(result);
                        } catch (error) {
                            result.msg = "保存项目信息失败";
                            result.ret = -1;
                            callback(result);
                        }
                    } else {
                        result.msg = "初始化";
                        result.ret = -1;
                        callback(result);
                    }

                } else {
                    if (!!callback) {
                        callback(false, '创建数据目录失败');
                    }
                }
            });

        }).catch(function () {
            result.msg = "复制文件失败";
            result.ret = -1;
            callback(result);
            return result;
        });
    }


    getProjectDir(actname) {
        let projectDir = path.resolve(Configs.getItem('workshop'), actname);
        return projectDir;
    }
    isexit() {

    }
    save(data) {

    }
    saveMain(main, callback) {
        if (main) {
            var result = jsonfile.writeFileSync(this.path + "main.json", main);
            callback(true);
        } else {
            callback(false);
        }
    }
    saveHtml(canvasHtml, callback) {}
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
    runCmd() {}
    commitSvn() {}
    uploadToDev() {}
    addWorkTime() {}
}

class Page {

    constructor(name, template) {
        this.name = name;
        this.template = template;

    }
    save() {

    }
}
const projects = Projects.getInstance();
export {
    Project,
    Files,
    projects,
    Page
};