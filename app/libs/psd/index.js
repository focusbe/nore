const psdjs = require("psdpaser");
const fse = require("fs-extra");
const path = require("path");
import Util from "../util";
console.log(Util);
import Files from "../files"
console.log(Files);
//识别的系统字；
const systemFont = ["MicrosoftYaHei", "SimSun", "SimHei", "KaiTi", "YouYuan"];
//显示内存占用
function showMem(log) {
    //开启--exprose-gc时显示内存占用
    if (typeof global.gc == "function") {
        console.log("手动gc一次");
        global.gc();
    }
    let rss = parseInt(process.memoryUsage().rss / 1024 / 1024);
    let memused = parseInt(process.memoryUsage().heapUsed / 1024 / 1024);
    console.log('rss":' + rss + "M");
    console.log('memused":' + memused + "M");
    memused = null;
}

class PSD {
    constructor(psdpath, imgdir, asseturl, pixelMax) {
        if (!pixelMax) {
            pixelMax = 10000 * 10000;
        }
        this.pixelMax = pixelMax;
        this.psdpath = psdpath;
        this.imgdir = imgdir;
        this.asseturl = asseturl;
    }
    async parse(istree, debug) {
        var self = this;
        //判断文件是否存在，保存图片的目录是否存在
        let exists = await fse.exists(this.psdpath);
        if (!exists) {
            throw new Error("psd文件不存在");
        }
        await new Promise(function (result, reject) {
            Files.createdir(self.imgdir, function (res) {
                console.log(res);
                if (!!res) result(true);
                else reject('创建图片保存路径失败');
            });
        });
        let psd = await psdjs.open(this.psdpath);
        let psdtree = psd.tree();
        psd = null;
        let res = this.getvnodetree(psdtree, null, null, istree);
        let errorimg = null;
        if (!debug) {
            await new Promise(function (result, reject) {
                self.saveimg(
                    res.imgPool,
                    function (saveresult) {
                        psdtree = null;
                        // res = null;
                        res.imgPool = null;
                        result(saveresult);
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
        return {
            vNode: res.vNode,
            errorimg
        };
    }
    checkLayer(layer){

    }
    getImgName(imgname,num){
        if(!num){
            num = 0;
        }
        if(!this.namePool){
            this.namePool = {};
        }
        imgname = imgname.split(' ');
        imgname = imgname[0].replace(/ /g,'');
        if(this.isChina(imgname)){
            return Util.createId();
        }
        var temp = imgname.split('/');
        if(imgname.length>1){
            imgname = temp[temp.length-1];
        }
        else{
            imgname = temp[0]+'_'+temp[temp.length-1];
        }
        
        let res = imgname;
        if(!!num){
            res = imgname+''+num;
        }
        if(!!this.namePool[res]){
            num++
            res =  this.getImgName(imgname,num);
        }
        this.namePool[res] = 1;
        return res;
    }
    getvnodetree(psdNode, vNode, imgPool, istree) {
        //params psdNode:psd中的节点
        //vNode:虚拟节点
        //vNode:待保存的图片数组
        //istree：最终生成树形结构还是一维数组
        let self = this;
        if (!psdNode) {
            return;
        }
        if (!vNode) {
            //生成根节点
            vNode = {
                view: "container",
                childrens: []
            };
            //需要保存的图片
            imgPool = [];
            this.getvnodetree(psdNode, vNode, imgPool, istree);
            let pageSize;
            if (!!psdNode.hasArtboard) {
                //多个画布高度是画布的和，宽度是第一个画布的宽度；
                let totalHeight = 0;
                let perWidth;
                let psdChildren = psdNode.children();
                for (var i in psdChildren) {
                    if (!psdChildren[i].artboard) {
                        continue;
                    }
                    totalHeight += psdChildren[i].artboard.height;
                    if (!perWidth) {
                        perWidth = psdChildren[i].artboard.width;
                    }
                }
                pageSize = {
                    width: perWidth,
                    height: totalHeight
                };
            } else {
                pageSize = {
                    width: psdNode.get("width"),
                    height: psdNode.get("height")
                };
            }
            vNode.styles = Object.assign(pageSize, {
                x: 0,
                position: "relative",
                y: 0,
                background: "none",
                overflow: "hidden"
            });
            return {
                vNode,
                imgPool
            };
        } else {
            let childrenLayers = psdNode.children();
            let curLayer, curVNode, imgname, artboard, curLayerJson;
            let artRealTop = 0;
            if (!psdNode.offsetY) {
                psdNode.offsetY = 0;
            }
            for (let i in childrenLayers) {
                curLayer = childrenLayers[i];
                curVNode = {};
                artboard = null;
                curLayerJson = null;
                //当前组是否是一个画布
                if (!!curLayer.layer.artboard) {
                    curVNode.isArtboard = true;
                    vNode.hasArtboard = true;
                    artboard = curLayer.layer.artboard().export().coords;
                    artboard.width = artboard.right - artboard.left;
                    artboard.height = artboard.bottom - artboard.top;
                    //记录一下实际拼接后 画布所处位置；
                    curLayer.offsetY = artRealTop;
                    artboard.realTop = artRealTop;
                    artRealTop += artboard.height;
                    curLayer.artboard = artboard;
                    if (!psdNode.hasArtboard) {
                        psdNode.hasArtboard = true;
                    }
                } else {
                    curLayer.offsetY = !!psdNode.offsetY ? psdNode.offsetY : 0;
                }

                //设置当前节点的类名,需要判断是否包含中文
                curVNode.props = {
                    class: this.isChina(curLayer.name) ? "" : curLayer.name
                };

                //父级的绝对位置；如果是树形结构会用到
                let parentAbsPos = {
                    left: istree ? (!!psdNode.artboard ? psdNode.artboard.left : psdNode.get("left")) : (!!psdNode.artboard ? psdNode.artboard.left : 0),
                    top: istree ? (!!psdNode.artboard ? psdNode.artboard.top : psdNode.get("top")) : (!!psdNode.artboard ? (psdNode.artboard.top - psdNode.offsetY) : -psdNode.offsetY)
                };
                //设置样式

                if ((!(!istree && curLayer.type == "group"))) {
                    let curStyles = {};
                    if (!curLayer.layer.visible) {
                        curStyles.display = "none";
                    }
                    curStyles.background = 'none';
                    if (!!artboard) {
                        //当前节点是一个画布 采用相对布局的方式
                        Object.assign(curStyles, {
                            x: 0,
                            y: 0,
                            width: artboard.width,
                            height: artboard.height,
                            position: "relative"
                        });
                        vNode.childrens.push(curVNode);
                    } else {
                        //当前节点不是一个画布采用绝对定位
                        if (!!istree) {
                            Object.assign(curStyles, {
                                width: curLayer.get("width"),
                                height: curLayer.get("height"),
                                x: curLayer.get("left") - parentAbsPos.left,
                                y: curLayer.get("top") - parentAbsPos.top,
                                position: "absolute"
                            });
                        } else {
                            Object.assign(curStyles, {
                                width: curLayer.get("width"),
                                height: curLayer.get("height"),
                                x: curLayer.get("left") - parentAbsPos.left,
                                y: curLayer.get("top") - parentAbsPos.top,
                                position: "absolute"
                            });
                        }
                        
                        vNode.childrens.splice(0, 0, curVNode);
                    }
                    curVNode.styles = curStyles;

                }

                curLayerJson = curLayer.export();
                //判断当前节点对应前端的哪个组件
                if (curLayer.type == "group") {
                    if (curLayer.name.indexOf("button") > -1) {
                        curVNode.view = "button";
                    } else {
                        curVNode.view = "container";
                    }

                    if (!!curLayer.children()) {
                        if (!istree) {
                            //生成一维数组；
                            this.getvnodetree(curLayer, vNode, imgPool, istree);
                        } else {
                            //生成多维数组；
                            curVNode.childrens = [];
                            this.getvnodetree(
                                curLayer,
                                curVNode,
                                imgPool,
                                istree
                            );
                        }
                    }

                } else if (curLayer.type == "layer") {
                    if (
                        !!curLayerJson.text &&
                        !!curLayerJson.text.font &&
                        self.isSystemFont(curLayerJson.text.font.name)
                    ) {
                        //是文字节点
                        let font = curLayerJson.text.font;
                        curVNode.props.text = curLayerJson.text.value
                            .replace(/↵/g, "<br/>")
                            .replace(/\n|\r/g, "<br/>");
                        if (curLayer.name.indexOf("button") > -1) {
                            curVNode.view = "button";
                        } else {
                            if (curLayer.name.indexOf("title") > -1) {
                                curVNode.props.istitle = true;
                            }
                            curVNode.view = "text";
                        }
                        let fontstyle = {};
                        if (!!font.sizes && font.sizes.length > 0) {
                            fontstyle.fontSize = font.sizes[0] + "px";
                        }
                        if (!!font.colors && font.colors.length > 0) {
                            fontstyle.color = this.colorRGB2Hex(font.colors[0]);
                        }
                        Object.assign(curVNode.styles, fontstyle);
                        fontstyle = null;
                    } else {
                        curVNode.view = "image";
                        if (
                            curLayer.get("width") * curLayer.get("height") <
                            self.pixelMax
                        ) {
                            imgname = this.getImgName(curLayer.path());
                            
                            imgPool.push({
                                image: curLayer.layer.image,
                                path: path.resolve(
                                    this.imgdir,
                                    imgname + ".png"
                                )
                            });
                            curVNode.props.img =
                                this.asseturl + "/" + imgname + ".png";
                        } else {
                            curVNode.props.img = "";
                        }
                    }
                }
            }
        }
    }

    saveOneimg(img, callback) {
        img["image"]
            .saveAsPng(img["path"])
            .then(function () {
                callback(true);
                img["image"] = null;
                // delete img['image'];
                showMem();
            })
            .catch(function (err) {
                callback(false, err);
                showMem();
            });
    }
    saveimg(pool, callback, onsuccess, onerror) {
        let self = this;

        function saveNextImg(i) {
            if (!pool[i]) {
                pool[i] = null;
            }
            self.saveOneimg(pool[i], function (res, error) {
                if (!!res) {
                    if (typeof onsuccess == "function") {
                        onsuccess(res);
                    }
                } else {
                    if (typeof onerror == "function") {
                        onerror(error);
                    }
                }
                pool[i] = null;
                pool.splice(i, 1);
            });
        }
        let oldlentgh = pool.length;
        let clock = setInterval(function () {
            if (pool.length == 0) {
                callback(true);
                clearInterval(clock);
                clock = null;
            }
            if (oldlentgh != pool.length && pool.length > 0) {
                saveNextImg(0);
            }
            oldlentgh = pool.length;
        }, 100);
        saveNextImg(0);
        return;
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
        let r = parseInt(rgb[0]);
        let g = parseInt(rgb[1]);
        let b = parseInt(rgb[2]);
        let hex =
            "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }
    isChina(s) {
        let patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
        if (!patrn.exec(s)) {
            return false;
        } else {
            return true;
        }
    }
}
export default PSD;