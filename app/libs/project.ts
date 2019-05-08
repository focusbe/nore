var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
const lodashId = require("lodash-id");
const postcss = require("postcss");
const postcssJs = require("postcss-js");
const Vue = require("vue");
import Canvas from "../renderer/componets/canvas.vue";
Vue.component("my-canvas", Canvas);
var beautify = require("js-beautify").html;
const renderer = require("vue-server-renderer").createRenderer();
// import Trackcode from "./trackcode";
import Configs from "./configs";
import viewList from "../renderer/elements/list.js";
import juicer from "juicer";
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync"); // 有多种适配器可选择
import Files from "./files";
var jsxTransform = require("jsx-transform");
import Games from "./games";
import Util from "./util";
enum Env {
    origin = "origin",
    src = "src",
    dist = "dist",
    all = "all"
}
class ProjectsClass {
    private projectCache: { [key: string]: any } = {};
    private static instance: ProjectsClass;
    private workshopdir;
    private constructor() { 
        // if(!!Configs.getItem("workshop")){
        //     this.workshopdir = path.resolve(Configs.getItem("workshop"));
        // }
        
    }
    static getInstance(): ProjectsClass {
        
        if (!ProjectsClass.instance) {
            
            ProjectsClass.instance = new ProjectsClass();
        }
        return this.instance;
    }
    getlist() {
        return new Promise(
            (resolve, reject) => {
                if (!Configs.getItem("workshop")) {
                    reject("没有设置workshop");
                    return;
                }
                if(!!Configs.getItem("workshop")){
                    this.workshopdir = path.resolve(Configs.getItem("workshop"));
                }
                Files.createdir(this.workshopdir, () => {
                    Files.getList(this.workshopdir, async (list) => {
                        if (!list) {
                            reject("获取文件失败");
                            return;
                        } else {
                            let projectlist = [];
                            //debugger;
                            for(var i in list){
                                let projectjson = await this.isProject(i);
                                if(!!projectjson){
                                    projectlist.push(projectjson);
                                }
                                resolve(projectlist);
                            }
                            //resolve(list);
                        }
                    });
                });
            }
        );
    }
    async isProject(name) {
        if(!!Configs.getItem("workshop")){
            this.workshopdir = path.resolve(Configs.getItem("workshop"));
        }
        let projectFile = path.resolve(this.workshopdir,name);
        let imgFile = path.resolve(projectFile, 'data/preview.webp');
        let dbFile = path.resolve(projectFile, 'data/db.json');
        if (!await fse.exists(dbFile)) {
            return false;
        }
        let json = await fse.readJson(dbFile);

        if (!json || !json.info) {
            return false;
        }
        if(await fse.exists(imgFile)){
            json.info.preview = imgFile.replace(/\\/g,'/');
        }
        return json.info;
    }
    add(config) {
        return new Promise(
            function (resolve, reject) {
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
                project.create(function (res) {
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
    async delete(actname) {
        await new Promise(
             (resolve, reject) =>{
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
            }
        );
    }
    getTempList() {
        return new Promise(function (resolve, reject) {
            var tempdir = path.resolve(__dirname, "../../templates");
            Files.createdir(tempdir, function () {
                Files.getList(tempdir, function (list) {
                    if (!list) {
                        reject("获取列表失败");
                        return;
                    }
                    resolve(list);
                });
            });
        });
    }
    getScaList() {
        return new Promise(function (resolve, reject) {
            var tempdir = path.resolve(__dirname, "../../scaffold");
            Files.createdir(tempdir, function () {
                Files.getList(tempdir, function (list) {
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
            function (resolve, reject) {
                if (!Configs.getItem("vscodePath")) {
                    reject("请配置VSCOD路径");
                    return;
                    // callback(false, '请配置VSCOD路径', -1);
                }
                let vcodedir = path.resolve(
                    Configs.getItem("vscodePath"),
                    "bin/code"
                );

                let project = this.getProjectDir(actname);
                let sh = '"' + vcodedir + '" ' + project;
                Util.runSh(sh)
                    .then(res => {
                        {
                            resolve(res);
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
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
    private srcDir: string;
    private originDir: string;
    private distDir: string;
    private db: any;
    constructor(config) {
        if (!config) {
            return;
        }
        if (typeof config == "string") {
            //项目已经存在
            this.actname = config;
            this.config = null;
        } else {
            this.config = config;
            this.actname = config.actname;
        }

        this.rootdir = path.resolve(Configs.getItem("workshop"), this.actname);
        this.datadir = path.resolve(this.rootdir, "data");
        this.srcDir = path.resolve(this.rootdir, "src");
        this.originDir = path.resolve(this.rootdir, "origin");
        this.distDir = path.resolve(this.rootdir, "dist");
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
        if (!this.config) {
            this.config = this.db.get("info").value();
        }
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
                        tree: null,
                        createtime: new Date().getTime(),
                        updatetime: new Date().getTime()
                    },
                    config
                )
            )
            .write();
        return newPost;
    }
    async delPage(name) {
        if (!name || !this.hasPage(name)) {
            return -1;
        }
        var res = this.db
            .get("pages")
            .remove({
                name: name
            })
            .write();
        try {
            let OriginFiles = await this.getPageFiles(Env.origin, name);
            let SrcFiles = await this.getPageFiles(Env.src, name);
            let DistFiles = await this.getPageFiles(Env.dist, name);
            var files = [OriginFiles, SrcFiles, DistFiles];
            for (var i in files) {
                if (!!files[i]) {
                    for (var j in files[i]) {
                        await Files.delFile(files[i][j]);
                    }
                }
            }
        } catch (error) {
            return false;
            //alert("文件删除失败");
        }
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
    saveToDb(name, pagejson) {
        var res = this.db
            .get("pages")
            .find({
                name: name
            })
            .assign(pagejson, {
                updatetime: new Date().getTime()
            })
            .write();
        return res;
    }
    async savePreImg(canvasData){
        if(!canvasData){
            return false;
        }
        let imgFile = path.resolve(this.datadir,'preview.webp');
        try {
            var dataBuffer = Buffer.from(canvasData, 'base64');
            let res = await fse.writeFile(imgFile,dataBuffer);
        } catch (error) {
            console.log(error)
            return false;
        }
        return true;
    }
    async delPreImg(){
        let imgFile = path.resolve(this.datadir,'preview.webp');
        try {
            await Files.delFile(imgFile);
        } catch (error) {
            return false;
        }
        return true;
    }
    async saveToFile(name, pageinfo) {
        let curPageInfo = this.getPageByName(name);
        curPageInfo = Object.assign(curPageInfo, pageinfo);
        if (!name || !pageinfo || !curPageInfo) {
            return -1;
        }
        let jsxobj = this.treeToJsx(curPageInfo.tree);

        let pageFiles = await this.getPageFiles(Env.origin, name);
        if (!pageFiles) {
            return;
        }
        
        jsxobj.css = Util.cssUrlChange(
            this.originDir,
            jsxobj.css,
            pageFiles.css
        );
        let imgFilepath = path.resolve(this.rootdir, "origin/images");
        let srcImgFile = path.resolve(this.rootdir, "src/images");
        try {
            Files.createLn(srcImgFile, imgFilepath);
        } catch (error) { }
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
        try {
            await Files.writeFile(pageFiles.css, jsxobj.css);
            await Files.writeFile(pageFiles.html, jsxString);
            //this.saveToDb(name, tree);
            return true;
        } catch (error) {
            return false;
        }
    }
    async savePage(name, pageinfo) {
        try {
            let res1 = await this.saveToDb(name, pageinfo);
            if (!!res1) {
                let res2 = await this.saveToFile(name, pageinfo);
                return res2;
            }
            return false;
        } catch (error) {
            return false;
        }
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
    async getPageFiles(env: Env, pagename) {
        if (!env && !pagename) {
            return false;
        }
        if (env == Env.all) {
            return {
                dist: await this.getPageFiles(Env.dist, name),
                src: await this.getPageFiles(Env.src, name),
                origin: await this.getPageFiles(Env.origin, name)
            };
        }
        var parentPath = path.resolve(this.rootdir, env);
        var res = await Files.createdirAsync(parentPath);
        let csstype = ".scss";
        let htmltype = ".html";
        if (env == Env.origin) {
            csstype = ".ncss";
            htmltype = ".jsx";
        }
        if (!!res) {
            let files: any = {
                css: path.resolve(parentPath, "css/" + pagename + csstype),
                images: path.resolve(parentPath, "images/" + pagename),
                html: path.resolve(parentPath, pagename + htmltype)
            };
            if (env == Env.dist) {
                files.buildcss = files.css;
                files.css = path.resolve(
                    parentPath,
                    "css/build" + pagename + csstype
                );
            }
            return files;
        }
        return false;
    }
    async fileToDb(name) {
        var pageFiles = await this.getPageFiles(Env.origin, name);
        let exists = await fse.pathExists(pageFiles.html);
        var jsxStr, cssStr;
        if (exists) {
            jsxStr = await fse.readFile(pageFiles.html, "utf8");
            if (!!jsxStr) {
                let cssExists = fse.pathExists(pageFiles.CSS);
                if (cssExists) {
                    cssStr = await fse.readFile(pageFiles.css, "utf8");
                }
                var tree = this.jsxToJson(jsxStr, cssStr);
                if (!!tree) {
                    let res = this.saveToDb(name, tree);
                    return res;
                }
                return false;
            } else {
                //文件是空的或者没有读取到内容
                return true;
            }
        } else {
            return false;
            //文件不存在
        }
    }
    async hasBuildFile(name) {
        var pageFIles = await this.getPageFiles(Env.src, name);

        var res = await fse.exists(pageFIles.html);
        return res;
    }
    async whoIsLatest(name, type = "origin") {
        var dbtime = this.getPageByName(name).updatetime;
        // console.log(dbtime);
        var originTime = await this.getEnvTime(Env.origin, name);
        var srcTime = await this.getEnvTime(Env.src, name);
        var bijiao;
        if (!dbtime) {
            return false;
        }
        if (type == "origin") {
            bijiao = originTime;
        } else {
            bijiao = srcTime;
        }
        return Math.abs(bijiao - dbtime) < 3000
            ? "same"
            : dbtime > bijiao
                ? "data"
                : type;
    }
    async getEnvTime(env: Env, name) {
        var pageFiles = await this.getPageFiles(env, name);
        var jstime = await Files.getMtime(pageFiles.html);
        var csstime = await Files.getMtime(pageFiles.css);
        if (!jstime && csstime) {
            return 0;
        } else if (!jstime) {
            return csstime;
        } else if (!csstime) {
            return jstime;
        }
        return Math.max(jstime, csstime);
    }
    async dbToFile(pagename) {
        var pageinfo = this.getPageByName(pagename);
        // var tree = pageinfo.tree;
        var res = await this.saveToFile(pagename, pageinfo);
        return res;
    }
    jsxToJson(jsx, css) {
 
        var funStr = jsxTransform.fromString(jsx, {
            factory: "this.createVnode"
        });

        var pageJson = eval(funStr);
        // console.log(pageJson);
        if (!!css && !!pageJson.tree) {
            try {
                let cssroot = postcss.parse(css);
                let cssObj = postcssJs.objectify(cssroot);
                let tree = pageJson.tree;
                this.setVnodeStyle(tree, cssObj);
                return pageJson;
            } catch (error) {
                console.log(error);
                return false;
            }
        }
        return false;
    }
    setVnodeStyle(vnode, cssObj) {
        if (!!vnode && !!vnode.props && !!vnode.props.id) {
            let id = vnode.props.id;
            let curcssObj;
            if (!!cssObj["#" + id]) {
                curcssObj = cssObj["#" + id];
                for (var i in curcssObj) {
                    if (curcssObj[i] instanceof Array) {
                        curcssObj[i] = curcssObj[i][curcssObj[i].length - 1];
                    } else if (curcssObj[i] instanceof Object) {
                        delete curcssObj[i];
                    }
                }
                vnode.styles = curcssObj;
            }
        }
        if (!!vnode && !!vnode.childrens) {
            for (var i in vnode.childrens) {
                this.setVnodeStyle(vnode.childrens[i], cssObj);
            }
        }
        return true;
    }
    pageJsonToData(pageJson, resultJson = {}) { }
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
            result["value"] = children;
        } else if (tag == "root") {
            result["tag"] = "tree";
            result["value"] = {
                view: tag,
                props: props,
                childrens: children
            };
        } else {
            result = {
                view: tag,
                props: props,
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
        jsx = tabstr + `<${tag} `;
        let proptype;
        for (var i in tree.props) {
            proptype = typeof tree.props[i];
            if (proptype != "function" && proptype != "object") {
                jsx += ` ${i}="${tree.props[i]}"`;
            }
        }
        if (!!tree.styles) {
            css = `#${tree.props.id}{\n`;
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
    renderToHtml(name, jsx) { }
    parseFile() { }

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
        // if (!this.config.game) {
        //     resolve.msg = "请选择游戏";
        //     resolve.ret = -1;
        //     callback(resolve);
        //     return resolve;
        // }
        // if (!this.config.title) {
        //     resolve.msg = "请填写项目标题标题";
        //     resolve.ret = -1;
        //     callback(resolve);
        //     return resolve;
        // }
        // if (!this.config.desc) {
        //     resolve.msg = "请填写项目描述";
        //     resolve.ret = -1;
        //     callback(resolve);
        //     return resolve;
        // }
        if (!this.config.scaffold) {
            resolve.msg = "请选择脚手架";
            resolve.ret = -1;
            callback(resolve);
            return resolve;
        }
        var self = this;
        let projectDir = path.resolve(
            Configs.getItem("workshop"),
            this.config.actname
        );
        let scaffold = path.resolve(
            __dirname,
            "../../scaffold/" + this.config.scaffold
        );

        Files.createdirAsync(projectDir)
            .then(() => {
                Files.copy(scaffold, projectDir, async err => {
                    if (!!err) {
                        console.log(err);
                        callback({ ret: -1, msg: "获取脚手架失败" });
                        try {
                            fse.unlink(projectDir);
                        } catch (error) { }
                        return;
                    }
                    try {
                        let configPath = path.resolve(
                            projectDir,
                            "./configs/ztconfig.json"
                        );
                        let ztConfig = await Games.getGame(this.config.game);

                        if (!!ztConfig) {
                            ztConfig = Object.assign(
                                ztConfig,
                                Configs.getList(),
                                { game: this.config.game }
                            );

                            let configres = await Files.writeJson(
                                configPath,
                                ztConfig
                            );
                        }
                    } catch (error) { }

                    //保存基本信息
                    Files.createdir(self.datadir, function (res) {
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
                });
            })
            .catch(function () {
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
    dirCode(dir) {
        return path.resolve(__dirname, dir);
    }
    dirProject(dir) {
        return path.resolve(this.rootdir, dir);
    }
    dirTemp(dir) {
        return path.resolve(this.rootdir, ".temp", dir);
    }
    async buildPage(name) {
        var pageObj = this.getPageByName(name);
        var page = Object.assign(
            {
                header: "",
                footer: "",
                maincss: "./css/" + name + ".css",
                mainjs: "./js/" + "all" + ".js"
            },
            pageObj
        );
        page.tree = JSON.stringify(page.tree);

        if (!page) {
            return false;
        }
        var templatesrc = this.dirProject("./src/templates/" + page.template);
        var templateAssets = this.dirCode("../../templates/" + page.template);
        var TplPath = this.dirCode(
            "../../templates/" + page.template + "/html.tpl"
        );
        // console.log(templatesrc);
        var temres = await Files.createdirAsync(templatesrc);

        if (!temres) {
            return false;
        }
        var copyres = await new Promise((resolve, reject) => {
            Files.copy(templateAssets, templatesrc, function (err) {
                if (!!err) {
                    reject("获取模板文件失败");
                    return;
                }
                resolve(true);
            });
        });
        if (!copyres) {
            return false;
        }
        var templatehtml: String = await new Promise(function (resolve, reject) {
            fs.readFile(TplPath, "utf8", function (err, data) {
                if (err) {
                    resolve("");
                    return;
                }
                resolve(data);
            });
        });
        if (!templatehtml) {
            return false;
        }

        // var trackcode = await Trackcode.getCode(this.config.game);

        // if (!!trackcode) {
        //     for (var i in trackcode) {
        //         if (!trackcode[i]["code"]) {
        //             continue;
        //         }
        //         if (trackcode[i]["position"] == "before") {
        //             var tagstr = "</" + trackcode[i]["tag"] + ">";
        //             templatehtml = templatehtml.replace(
        //                 tagstr,
        //                 trackcode[i]["code"] + "\n" + tagstr
        //             );
        //         } else if (trackcode[i]["position"] == "after") {
        //             var tagstr = "<" + trackcode[i]["tag"] + ">";
        //             templatehtml = templatehtml.replace(
        //                 tagstr,
        //                 tagstr + "\n" + trackcode[i]["code"]
        //             );
        //         }
        //     }
        // }

        // var gameinfo: any = await Games.getGame(this.config.game);
        // var common: any = await Games.getGame("common");
        
        // var wxid = !!gameinfo&&!!gameinfo.wxid
        //     ? gameinfo.wxid
        //     : !!common.wxid
        //         ? common.wxid
        //         : "";
        // page.header += '<script>var WXID="' + wxid + '"</script>';

        var maincssstr = "";
        var mainjsstr = "";
        var tree = await Files.getTree(templatesrc, false);
        for (var i in tree) {
            let extname = path.extname(tree[i]["path"]);
            let realPath = path.relative(templatesrc, tree[i]["path"]);
            if (extname == ".scss") {
                maincssstr +=
                    '@import "../templates/' +
                    page.template +
                    "/" +
                    realPath +
                    '";\n';
     
            } else if (extname == ".js") {
                mainjsstr +=
                    'require("../templates/' +
                    page.template +
                    "/" +
                    realPath +
                    '");\n';
            }
        }
        maincssstr += '@import "./build/' + name + '";\n';
        maincssstr = maincssstr.replace(/\\/g, "/");

        var app = new Vue({
            data: {
                page: pageObj,
                projectname: this.actname,
                pagename: name
            },
            template: `<my-canvas :canvasData="page" isssr="true" :projectname="projectname" :pagename="pagename"></my-canvas>`
        });

        var html = await renderer.renderToString(app);

        var regstr = /id="([^\s\'\"\<\>]*?)"([^\<\>]*?)style="([^\'\"\<\>]*?)"/gim;
        var htmlattr;
        var cssstr = "";
        var htmlstr = html;
        var csspath = path.resolve(
            this.rootdir,
            "src/css/build/" + name + ".scss"
        );

        var htmlpath = path.resolve(this.rootdir, "src/" + name + ".html");
        var srcpath = path.resolve(this.rootdir, "src/");
        var maincsspath = path.resolve(
            this.rootdir,
            "src/css/" + name + ".scss"
        );
        var mainjspath = path.resolve(this.rootdir, "src/js/" + "main" + ".js");
        while ((htmlattr = regstr.exec(html))) {
            if (!!htmlattr[1] && !!htmlattr[3]) {
                htmlstr = htmlstr.replace('style="' + htmlattr[3] + '"', "");
                let stylestr = Util.cssUrlChange(srcpath, htmlattr[3], csspath);
                cssstr +=
                    "#" +
                    htmlattr[1] +
                    "{\n\t" +
                    stylestr.replace(/;/g, ";\n\t") +
                    "\n}\n";
            }
        }
        cssstr = cssstr.replace(/\t\n\}/g, "}");
        page.html = htmlstr;
        var reshtml = juicer(templatehtml, { page: page });
        reshtml = beautify(reshtml, {
            preserve_newlines: false,
            wrap_attributes: "auto",
            brace_style: "none",
            inline: ""
        });
        try {
            await Files.writeFile(htmlpath, reshtml);
            await Files.writeFile(csspath, cssstr);
            await Files.writeFile(maincsspath, maincssstr);
            if (!(await fse.exists(mainjspath))) {
                mainjsstr = mainjsstr.replace(/\\/g, "/");
                await Files.writeFile(mainjspath, mainjsstr);
            }
        } catch (error) {
            return false;
        }
        return true;
    }
    getInfo() {
        let info = this.db.get("info").value();
        return info;
    }
    getDevPath(...value) {
        var devpath = Configs.getItem("devpath");
        if (!value || !value.length) {
            return null;
        }
        if (!!devpath) {
            if (devpath[devpath.length - 1] != '\\') {
                devpath = devpath + '\\';
            }
            return devpath + path.join(...value);
        }
        return null;
    }
    async devHas() {
        // let actpath = path.resolve(
        //     Configs.getItem("devpath"),
        //     "common/" + this.config.game + "/act/" + this.config.actname
        // );
        let actpath = this.getDevPath("common/" + this.config.game + "/act/" + this.config.actname);
        if (!actpath) {
            throw new Error('获取测试服地址失败')
        }
        if (await fse.exists(actpath)) {
            //var gaptime =  (new Date().getTime())-await Files.getMtime(actpath);
            return Util.howLong(await Files.getMtime(actpath))
        }
        return false;
    }
    async localHas() {
        var games = await Games.getGame(this.config.game);
        if (!games) {
            throw new Error("没找到对应游戏的配置");
        }
        var dev = games.online || "svn";
        let actpath = path.resolve(
            Configs.getItem(dev + "Folder"),
            this.config.game +
            (dev == "svn" ? "/release" : "") +
            "/act/" +
            this.config.actname
        );
        return await fse.exists(actpath);
    }
    async publishDev() {
        var games = await Games.getGame(this.config.game);
        if (!games) {
            throw new Error("没找到对应游戏的配置");
        }
        var dev = games.dev || "ftp";
        if (dev != "ftp") {
            throw new Error("目前只支持代码在samba下的项目");
        }
        // if (!(await Configs.getItem("devpath"))) {
        //     throw new Error(
        //         "请在设置中配置 测试目录 如：\\\\192.168.150.116\\"
        //     );
        // }
        let actpath = this.getDevPath("common/" + this.config.game + "/act");
        let projectpath = this.getDevPath("common/" + this.config.game + "/act", this.config.actname);

        if (await fse.exists(actpath)) {

            await fse.copy(this.distDir, projectpath);
            return true;
        } else {
            throw new Error(actpath + "文件夹不存在");
        }
    }
    async publishOnline() {
        var games = await Games.getGame(this.config.game);
        if (!games) {
            throw new Error("没找到对应游戏的配置");
        }
        var dev = games.online || "svn";
        // if (dev != "ftp") {
        //     throw new Error("目前只支持代码在samba下的项目");
        // }
        if (!(await Configs.getItem(dev + "Folder"))) {
            throw new Error("请在设置中配置" + dev + "代码目录");
        }
        let actpath = path.resolve(
            Configs.getItem(dev + "Folder"),
            this.config.game + (dev == "svn" ? "/release" : "") + "/act"
        );
        let projectpath = path.resolve(actpath, this.config.actname);
        if (await fse.exists(actpath)) {
            if (!(await Files.createdirAsync(projectpath))) {
                throw new Error("创建项目文件失败");
            }

            if (dev == "svn") {
                await this.updateSvn(projectpath);
            }
            await fse.copy(this.distDir, projectpath);
            if (dev == "svn") {
                return await this.commitSvn(projectpath);
            } else {
                Files.openFolder(projectpath);
                return true;
            }
        } else {
            throw new Error(actpath + "文件夹不存在");
        }
    }
    async svnClientisOk() {
        if (!(await Configs.getItem("svnClient"))) {
            throw new Error("请在设置中配置乌龟SVN安装目录");
        }
        if (!(await fse.exists(Configs.getItem("svnClient")))) {
            throw new Error("乌龟SVN安装目录不存在");
        }
        return true;
    }
    async updateSvn(svnpath) {
        await this.svnClientisOk();
        let sh =
            '"' +
            Configs.getItem("svnClient") +
            '" /command:update /path ' +
            svnpath;
        return await Util.runSh(sh);
    }
    async commitSvn(svnpath) {
        await this.svnClientisOk();
        let sh =
            '"' +
            Configs.getItem("svnClient") +
            '" /command:commit /path ' +
            svnpath;
        return await Util.runSh(sh);
    }
    save(data) { }
    runCmd() { }
    uploadToDev() { }
    addWorkTime() { }
}

class Page {
    private name: string;
    private template: string;
    constructor(name, template) {
        this.name = name;
        this.template = template;
    }
    save() { }
}
const Projects = ProjectsClass.getInstance();
export { Project, Projects, Page };
