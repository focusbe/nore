// var jsonfile = require("jsonfile");
// var browserify = require("browserify");
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
const lodashId = require("lodash-id");
const postcss = require("postcss");
const postcssJs = require('postcss-js');
// const css  = '#body { z-index: 1 }#body { z-index: 2;widht:100px; }body #body{z-index:10}'
// const root = postcss.parse(css);
// var obj = postcssJs.objectify(root);
// console.log(obj);
// console.log(root);
import Configs from "./configs";
import viewList from "../renderer/elements/list.js";
// var juicer = require("juicer");
// var babelify = require("babelify");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync"); // 有多种适配器可选择
import Files from "./files";
const shelljs = require("shelljs");
var jsxTransform = require("jsx-transform");
class ProjectsClass {
    private projectCache: { [key: string]: any } = {};
    private static instance: ProjectsClass;
    private constructor() {}
    static getInstance(): ProjectsClass {
        if (!ProjectsClass.instance) {
            ProjectsClass.instance = new ProjectsClass();
        }
        return this.instance;
    }
    getlist() {
        return new Promise(
            function(resolve, reject) {
                if (!Configs.getItem("workshop")) {
                    reject("没有设置workshop");
                    return;
                }
                let workshopdir = path.resolve(Configs.getItem("workshop"));
                Files.createdir(workshopdir, function() {
                    Files.getList(workshopdir, function(list) {
                        if (!list) {
                            reject("获取文件失败");
                            return;
                        } else {
                            resolve(list);
                        }
                    });
                });
            }.bind(this)
        );
    }
    add(config) {
        return new Promise(
            function(resolve, reject) {
                if (!config || !config.actname) {
                    reject("参数错误");
                    return;
                }
                if (
                    !!this.projectCache[config.actname] ||
                    this.has(config.actname)
                ) {
                    reject("项目已存在");
                    return;
                }
                let project = new Project(config);
                this.projectCache[config.actname] = project;
                project.create(function(res) {
                    if (res.ret > 0) {
                        resolve(project);
                    } else {
                        reject(res.msg);
                    }
                });
            }.bind(this)
        );
    }
    has(actname) {
        return fs.existsSync(this.getProjectDir(actname));
    }
    delete(actname) {
        return new Promise(
            function(resolve, reject) {
                let projectDir = path.resolve(
                    Configs.getItem("workshop"),
                    actname
                );
                fse.remove(projectDir, err => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(true);
                });
            }.bind(this)
        );
    }
    getTempList() {
        return new Promise(function(resolve, reject) {
            var tempdir = path.resolve(__dirname, "../../template");
            Files.createdir(tempdir, function() {
                Files.getList(tempdir, function(list) {
                    if (!list) {
                        reject("获取列表失败");
                        return;
                    }
                    resolve(list);
                });
            });
        });
    }
    openWithIed(actname) {
        return new Promise(
            function(resolve, reject) {
                let vcodedir = path.resolve(
                    Configs.getItem("vscodePath"),
                    "bin/code"
                );
                if (!vcodedir) {
                    reject("请配置VSCOD路径");
                    return;
                    // callback(false, '请配置VSCOD路径', -1);
                }
                let project = this.getProjectDir(actname);
                let sh = '"' + vcodedir + '" ' + project;
                shelljs.exec(
                    sh,
                    {
                        async: true,
                        silent: true
                    },
                    function(code, stdout, stderr) {
                        if (!!stderr) {
                            reject(stderr);
                        } else {
                            resolve(true);
                        }
                    }
                );
            }.bind(this)
        );
    }
    getProjectDir(actname) {
        let projectDir = path.resolve(Configs.getItem("workshop"), actname);
        return projectDir;
    }
    getProject(actname) {
        if (!actname) {
            return -1;
        }
        if (!this.projectCache[actname]) {
            let projectroot = path.resolve(
                Configs.getItem("workshop"),
                actname
            );
            if (!fs.existsSync(projectroot)) {
                return -2;
            }
            this.projectCache[actname] = new Project(actname);
        }
        return this.projectCache[actname];
    }
}

class Project {
    private actname: string;
    private config: { [key: string]: any };
    private rootdir: string;
    private datadir: string;
    private db: any;
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
        this.rootdir = path.resolve(Configs.getItem("workshop"), this.actname);
        this.datadir = path.resolve(this.rootdir, "data");
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
        let dbjsonpath = path.resolve(this.rootdir, "data/db.json");
        let adapter = new FileSync(dbjsonpath); // 申明一个适配器
        this.db = low(adapter);
        this.db._.mixin(lodashId);
        this.db
            .defaults({
                pages: [],
                info: {}
            })
            .write();
        return true;
    }

    getPageList() {
        let pages = this.db.get("pages").value();
        return pages;
    }

    addPage(config) {
        if (!config || !config.name) {
            return -1;
        }
        if (this.hasPage(config.name)) {
            return -2;
        }
        var newPost = this.db
            .get("pages")
            .insert(
                Object.assign(
                    {
                        tree: null
                    },
                    config
                )
            )
            .write();
        return newPost;
    }
    delPage(name) {
        if (!name || !this.hasPage(name)) {
            return -1;
        }
        var res = this.db
            .get("pages")
            .remove({
                name: name
            })
            .write();
        return res;
    }
    getPage(id) {
        var res = this.db
            .get("pages")
            .find({
                id: id
            })
            .value();
        return res;
    }
    hasPage(name) {
        var hasname = this.db
            .get("pages")
            .find({ name: name })
            .size()
            .value();
        return hasname > 0;
    }

    savePage(name, tree) {
        let curPageInfo = this.getPageByName(name);
        if (!name || !tree || !curPageInfo) {
            return -1;
        }

        let jsxobj = this.treeToJsx(tree);
        let cssPath: string = path.resolve(this.rootdir, "src/css");
        let cssFilePath = path.resolve(cssPath, name + ".css");
        let jsxFilePath = path.resolve(this.rootdir, "src/" + name + ".jsx");
        var self = this;
        let jsxString = "<page";
        for (var i in curPageInfo) {
            if (this.isValiProp(i)) {
                continue;
            }
            jsxString += ` ${i}="${curPageInfo[i]}"`;
        }
        jsxString += ">\n\t<head>";
        if (!!curPageInfo.head) {
            jsxString += "\n\t\t" + curPageInfo.head;
        }
        jsxString += "\n\t</head>\n";
        jsxString += jsxobj.jsx;
        jsxString += "\n\t<foot>";
        if (!!curPageInfo.head) {
            jsxString += "\n\t\t" + curPageInfo.foot;
        }
        jsxString += "\n\t</foot>\n</page>";
        return new Promise(function(resolve, reject) {
            Files.createdir(cssPath, function(res) {
                if (!!res) {
                    fs.writeFile(cssFilePath, jsxobj.css, function(err) {
                        if (err) reject("保存样式文件失败");
                        else {
                            fs.writeFile(jsxFilePath, jsxString, function(err) {
                                if (err) reject("保存JSX文件失败");
                                else {
                                    var res = self.db
                                        .get("pages")
                                        .find({
                                            name: name
                                        })
                                        .assign({
                                            tree: tree
                                        })
                                        .write();
                                    if (!!res) {
                                        resolve(true);
                                    } else {
                                        reject("保存JSON失败");
                                    }
                                }
                            });
                        }
                    });
                }
            });
        });
    }
    getPageByName(name) {
        var res = this.db
            .get("pages")
            .find({
                name: name
            })
            .value();
        return res;
    }

    isValiProp(prop) {
        let cantUse = ["name", "id", "tree", "head", "foot"];
        return cantUse.indexOf(prop) > -1;
    }

    async fileToDb(name) {
        let cssPath: string = path.resolve(this.rootdir, "src/css");
        let cssFilePath = path.resolve(cssPath, name + ".css");
        let jsxFilePath = path.resolve(this.rootdir, "src/" + name + ".jsx");
        let exists = await fse.pathExists(jsxFilePath);
        var jsxStr, cssStr;
        if (exists) {
            jsxStr = await fse.readFile(jsxFilePath, "utf8");

            if (!!jsxStr) {
                let cssExists = fse.pathExists(cssFilePath);
                if (cssExists) {
                    cssStr = await fse.readFile(jsxFilePath, "utf8");
                    
                }
                this.jsxToJson(jsxStr, cssStr);
            } else {
                //文件是空的或者没有读取到内容
            }
        } else {
            return -1;
            //文件不存在
        }
    }
    async dbToFile() {}
    jsxToJson(jsx, css) {
        let root = postcss.parse(css);
        let cssObj = postcssJs.objectify(root);
        var funStr = jsxTransform.fromString(jsx, {
            factory: "this.createVnode"
        });
        var pageJson = eval(funStr);
        if (!!css && !!pageJson.tree) {
            
        }
    }
    pageJsonToData(pageJson, resultJson = {}) {}
    isComp(name) {
        if (!name) {
            return false;
        }
        for (var i in viewList) {
            if (!!viewList[i]["name"] && viewList[i]["name"] == name) {
                return true;
            }
        }
        return false;
    }
    createVnode(tag, props, children) {
        var result = {};
        if (tag == "page") {
            for (var i in props) {
                if (!this.isValiProp(i)) {
                    result[i] = props[i];
                }
            }
            for (var i in children) {
                if (
                    children[i].tag == "head" ||
                    children[i].tag == "foot" ||
                    children[i].tag == "tree"
                ) {
                    result[children[i].tag] = children[i].value;
                }
            }
        } else if (tag == "head" || tag == "foot") {
            result["tag"] = tag;
            result["value"] = "";
        } else if (tag == "root") {
            result["tag"] = "tree";
            result["value"] = {
                view: "tag",
                porps: props,
                childrens: children
            };
        } else {
            result = {
                view: tag,
                porps: props,
                childrens: children
            };
        }
        return result;
    }
    treeToJsx(tree: { [key: string]: any }, tabstr: string = "\t") {
        if (!tree) {
            return;
        }
        if (!tabstr) {
            tabstr = "";
        }
        var tag = tree.view;
        if (typeof tag == "object") {
            tag = !!tag.name ? tag.name : "div";
        }
        var css = "";
        var jsx = "";
        jsx = tabstr + `<${tag} id="${tree.domid}"`;
        let proptype;
        for (var i in tree.props) {
            proptype = typeof tree.props[i];
            if (proptype != "function" && proptype != "object") {
                jsx += ` ${i}="${tree.props[i]}"`;
            }
        }
        if (!!tree.styles) {
            css = `#${tree.domid}{\n`;
            for (var i in tree.styles) {
                css += `\t${i}:${tree.styles[i]};\n`;
            }
            css += `\n}\n`;
        }
        jsx += ">";

        if (!!tree.childrens && tree.childrens.length > 0) {
            for (var j in tree.childrens) {
                let childjsx = this.treeToJsx(tree.childrens[j], tabstr + "\t");
                jsx += "\n" + childjsx.jsx;
                css += childjsx.css;
            }
        }

        jsx += `\n${tabstr}</${tag}>`;
        return { css: css, jsx: jsx };
    }
    renderToHtml(name, jsx) {}
    saveToFile() {}
    parseFile() {}

    create(callback) {
        var resolve: { [key: string]: any } = {
            ret: 1
        };
        if (!this.config.actname) {
            resolve.msg = "请传入活动名称";
            resolve.ret = -1;
            callback(resolve);
            return resolve;
        }
        if (!this.config.game) {
            resolve.msg = "请选择游戏";
            resolve.ret = -1;
            callback(resolve);
            return resolve;
        }
        if (!this.config.title) {
            resolve.msg = "请填写项目标题标题";
            resolve.ret = -1;
            callback(resolve);
            return resolve;
        }
        if (!this.config.desc) {
            resolve.msg = "请填写项目描述";
            resolve.ret = -1;
            callback(resolve);
            return resolve;
        }
        var self = this;
        let projectDir = path.resolve(
            Configs.getItem("workshop"),
            this.config.actname
        );

        Files.createdirAsync(projectDir)
            .then(function() {
                //保存基本信息
                Files.createdir(self.datadir, function(res) {
                    if (!!res) {
                        var dbres = self.initDB();
                        if (dbres) {
                            try {
                                self.db.set("info", self.config).write();
                                resolve.msg = "成功";
                                resolve.ret = 1;
                                callback(resolve);
                            } catch (error) {
                                resolve.msg = "保存项目信息失败";
                                resolve.ret = -1;
                                callback(resolve);
                            }
                        } else {
                            resolve.msg = "初始化";
                            resolve.ret = -1;
                            callback(resolve);
                        }
                    } else {
                        if (!!callback) {
                            callback(false, "创建数据目录失败");
                        }
                    }
                });
            })
            .catch(function() {
                resolve.msg = "复制文件失败";
                resolve.ret = -1;
                callback(resolve);
                return resolve;
            });
    }

    getProjectDir(actname) {
        let projectDir = path.resolve(Configs.getItem("workshop"), actname);
        return projectDir;
    }
    getInfo() {}
    save(data) {}
    runCmd() {}
    commitSvn() {}
    uploadToDev() {}
    addWorkTime() {}
}

class Page {
    private name: string;
    private template: string;
    constructor(name, template) {
        this.name = name;
        this.template = template;
    }
    save() {}
}
const Projects = ProjectsClass.getInstance();
export { Project, Projects, Page };
