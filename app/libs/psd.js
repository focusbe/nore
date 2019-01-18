const psdjs = require("psdpaser");
const fse = require("fs-extra");
const path = require("path");
const systemFont = ["MicrosoftYaHei", "SimSun", "SimHei", "KaiTi", "YouYuan"];
class PSD {
    constructor(psdpath, imgdir, asseturl,pixelMax) {
        if(!pixelMax){
            pixelMax = 1000*10000;
        }
        this.pixelMax = pixelMax;
        this.psdpath = psdpath;
        this.imgdir = imgdir;
        this.asseturl = asseturl;

    }
    async parse(duowei, debug) {
        var self = this;
        //判断文件是否存在，保存图片的目录是否存在
        let exists = await fse.exists(this.psdpath);
        if (!exists) {
            throw new Error("psd文件不存在");
        }
        exists = await fse.exists(this.imgdir);
        if (!exists) {
            var res = await new Promise(function (result, reject) {
                fse.mkdir(self.imgdir, function (err) {
                    if (!err) result(true);
                    else reject(err);
                });
            });
        }
        var psd = await psdjs.open(this.psdpath);
        var psdtree = psd.tree();
        var res = this.getvnodetree(psdtree);
        var errorimg = null;
        if (!debug) {
            await new Promise(function (result, reject) {
                self.saveimg(
                    res.saveimgPool,
                    function (res) {
                        result(res);
                    },
                    null,
                    function (img) {
                        if (!errorimg) {
                            errorimg = [];
                        }
                        errorimg.push(img);
                    }
                );
            });
        }
        if (!duowei) {
            let vnodetree = res.curtree;
            console.log(vnodetree);
            let newvnodetree = this.paiping(vnodetree);
            console.log(newvnodetree);
            res.curtree = newvnodetree;
        }
        return {
            vnodetree: res.curtree,
            errorimg
        };
    }
    getvnodetree(parent, curtree, saveimgPool) {
        var self = this;
        if (!parent || parent.length == 0) {
            return;
        }
        var ismutilBoard = false;
        if (!curtree) {
            curtree = [{
                view: "container",
                childrens: []
            }];
            //需要保存的图片
            saveimgPool = [];
            var psdtree = parent;
            curtree[0].styles = {
                width: psdtree.get("width"),
                height: psdtree.get("height"),
                x: 0,
                position: "relative",
                y: 0,
                background: "none"
            };
            this.getvnodetree(parent, curtree[0], saveimgPool);
        } else {
            var children = parent.children();
            let curnode, curview, imgname, artboard, curjson;
            for (var i in children) {
                curnode = children[i];
                
                
                curview = {};
                //当前组是否是一个画布
                if (!!curnode.layer.artboard) {
                    if (!ismutilBoard) {
                        ismutilBoard = true;
                    }
                    artboard = curnode.layer.artboard().export().coords;
                    artboard.width = artboard.right - artboard.left;
                    artboard.height = artboard.bottom - artboard.top;
                    curnode.artboard = artboard;
                } else {
                    artboard = null;
                }
                //设置当前节点的类名
                curview.props = {
                    className: this.isChina(curnode.name) ? "" : curnode.name
                };
                //设置当前节点的样式
                curview.styles = {
                    width: artboard ? artboard.width : curnode.get("width"),
                    height: artboard ? artboard.height : curnode.get("height"),
                    x: artboard ?
                        0 : curnode.get("left") -
                        (typeof curnode.parent.artboard != "undefined" ?
                            curnode.parent.artboard.left :
                            curnode.parent.get("left")),
                    y: artboard ?
                        0 : curnode.get("top") -
                        (typeof curnode.parent.artboard != "undefined" ?
                            curnode.parent.artboard.top :
                            curnode.parent.get("top")),
                    position: artboard ? "relative" : "absolute",
                    background: "none"
                };
                curjson = curnode.export();
                //判断当前节点对应前端的哪个组件
                if (curnode.type == "group") {
                    if (curnode.name.indexOf("button") > -1) {
                        curview.view = "my-button";
                    } else {
                        curview.view = "container";
                    }
                    if (!!curnode.children()) {
                        curview.childrens = [];
                        this.getvnodetree(curnode, curview, saveimgPool);
                    }
                } else if (curnode.type == "layer") {
                    
                    if (
                        !!curjson.text &&
                        !!curjson.text.font &&
                        self.isSystemFont(curjson.text.font.name)
                    ) {
                        //是文字节点
                        let font = curjson.text.font;
                        curview.props.text = curjson.text.value
                            .replace(/↵/g, "<br/>")
                            .replace(/\n|\r/g, "<br/>");
                        if (curnode.name.indexOf("button") > -1) {
                            curview.view = "my-button";
                        } else {
                            if (curnode.name.indexOf("title") > -1) {
                                curview.props.istitle = true;
                            }
                            curview.view = "text";
                        }
                        let fontstyle = {};
                        if (!!font.sizes && font.sizes.length > 0) {
                            fontstyle.fontSize = font.sizes[0] + "px";
                        }
                        if (!!font.colors && font.colors.length > 0) {
                            fontstyle.color = this.colorRGB2Hex(font.colors[0]);
                        }
                        Object.assign(curview.styles, fontstyle);
                    } else {
                        curview.view = "image";
                        if(curnode.get("width")*curnode.get("height")<self.pixelMax){
                            imgname = curnode.path().replace(/\//g, "_");
                            saveimgPool.push({
                                image: curnode.layer.image,
                                path: path.resolve(this.imgdir, imgname + ".png")
                            });
                            // if (curnode.name == 'bg') {
                            //     //是父级的背景；
                            //     curtree.styles.backgroundImage = 'url(file:///'+path.resolve(this.imgdir, imgname + ".png").replace(/\\/g,'/')+')'
                            //     curtree.styles.backgroundSize = ''
                            //     continue;
                            // } else {
                            curview.props.img =
                                this.asseturl + "/" + imgname + ".png";
                        }
                        else{
                            curview.props.img = "";
                        }
                        // }
                    }
                }
                if (!curnode.layer.visible) {
                    curview.styles.display = "none";
                }
                curtree.childrens.push(curview);
                if (ismutilBoard) {
                    curtree.styles.width = "100%";
                    curtree.styles.height = "auto";
                    curtree.styles.postion = "relative";
                }
            }
        }

        return {
            curtree,
            saveimgPool
        };
    }
    paiping(vnodetree, yiweitree, relativeheight, parent) {
        if (!yiweitree) {
            yiweitree = [];
            relativeheight = 0;
        }
        let curvnode;
        var isallRealtive = true;
        for (var i in vnodetree) {
            if (
                !!vnodetree[i].styles &&
                !!vnodetree[i].styles.position != "relative"
            ) {
                isallRealtive = false;
                break;
            }
        }
        if (!isallRealtive) {
            vnodetree = vnodetree.reverse();
        }
        for (var i in vnodetree) {
            curvnode = vnodetree[i];
            if (!!parent) {
                curvnode.styles.x += parent.styles.x;
                curvnode.styles.y += parent.styles.y;
                if (parent.styles.display == "none") {
                    curvnode.styles.display = "none";
                }
            }
            if (!!curvnode.childrens && curvnode.childrens.length > 0) {
                // if (curvnode.styles.position != 'relative') {
                //     curvnode.childrens = curvnode.childrens.reverse();
                // }
                this.paiping(
                    curvnode.childrens,
                    yiweitree,
                    relativeheight,
                    curvnode
                );

                if (curvnode.styles.position == "relative") {
                    relativeheight += curvnode.styles.height;
                }
            } else {
                if (curvnode.view == "my-button") {
                    if (!!curvnode.props.text) {
                        curvnode.view = "text";
                    }
                }
                curvnode.styles.y += relativeheight;
                yiweitree.push(curvnode);
            }
        }
        // console.log(yiweitree);
        return yiweitree;
    }
    saveOneimg(img, callback) {
        
        img['image']
            .saveAsPng(img['path'])
            .then(function () {
                callback(true);
            })
            .catch(function (err) {
                callback(false,error)
            });
    }
    saveimg(pool, callback, onsuccess, onerror) {
        // for (var i in pool) {
        //     pool[i]["image"].saveAsPng(pool[i]["path"]);
        // }
        // return;

        var self = this;
        var n = pool.length;
        
        function saveNextImg(i) {
            if (i >= n) {
                callback(true);
                return;
            }
            self.saveOneimg(pool[i], function (res,error) {
                if(!!res){
                    if(typeof onsuccess =='function'){
                        onsuccess(res);
                    }
                }
                else{
                    if(typeof onerror =='function'){
                        onerror(error);
                    }
                }
                saveNextImg(i + 1);
            });
        }
        saveNextImg(0);

        return;
        setTimeout(function () {
            if (!!pool) {
                pool[i]["image"]
                    .saveAsPng(pool[i]["path"])
                    .then(function () {
                        pool[i]["image"] = null;
                        if (!!onsuccess) {
                            onsuccess(i);
                        }
                        if (i >= pool.length - 1) {
                            callback(true);
                        } else {
                            i++;
                            self.saveimg(pool, i, callback);
                        }
                    })
                    .catch(function (err) {
                        if (!!onerror) {
                            onerror(pool[i]);
                            throw err;
                        }
                        if (i >= pool.length - 1) {
                            callback(true);
                        } else {
                            i++;
                            self.saveimg(pool, i, callback);
                        }
                    });
            }
        }, 500);

        return true;
    }
    isSystemFont(fontname) {
        if (!fontname) {
            return false;
        }
        for (var i in systemFont) {
            if (systemFont[i].toLowerCase() == fontname.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
    colorRGB2Hex(rgb) {
        var r = parseInt(rgb[0]);
        var g = parseInt(rgb[1]);
        var b = parseInt(rgb[2]);
        var hex =
            "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }
    isChina(s) {
        var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
        if (!patrn.exec(s)) {
            return false;
        } else {
            return true;
        }
    }
}
module.exports = PSD;