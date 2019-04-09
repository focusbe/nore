const psdjs = require("psdpaser");
const fse = require("fs-extra");
const path = require("path");
import Files from "../files";
import { Point, Size, Rectangle, Image, PsdUtli, ImagePool } from "./base";
//识别的系统字；

//显示内存占用
// function showMem() {
//     //开启--exprose-gc时显示内存占用
//     if (typeof global.gc == "function") {
//         console.log("手动gc一次");
//         global.gc();
//     }
//     let rss = parseInt(process.memoryUsage().rss / 1024 / 1024);
//     let memused = parseInt(process.memoryUsage().heapUsed / 1024 / 1024);
//     console.log('rss":' + rss + "M");
//     console.log('memused":' + memused + "M");
//     memused = null;
// }

class PSD {
    private pixelMax;
    private psdpath;
    private imgdir;
    private asseturl;
    constructor(psdpath, imgdir, asseturl, pixelMax) {
        if (!pixelMax) {
            pixelMax = 10000 * 10000;
        }
        this.pixelMax = pixelMax;
        this.psdpath = psdpath;
        this.imgdir = imgdir;
        this.asseturl = asseturl;
    }
    async parse(debug) {
        var self = this;
        //判断文件是否存在，保存图片的目录是否存在
        let exists = await fse.exists(this.psdpath);
        if (!exists) {
            throw new Error("psd文件不存在");
        }
        await new Promise(function(result, reject) {
            Files.createdir(self.imgdir, function(res) {
                if (!!res) result(true);
                else reject("创建图片保存路径失败");
            });
        });
        let psd = await psdjs.open(this.psdpath);
        let psdtree = psd.tree();
        psd = null;
        let res = this.getvnodetree(psdtree);
        let errorimg = null;
        if (!debug) {
            await new Promise(function(result, reject) {
                res.imgPool.start(function(event, data) {
                    switch (event) {
                        case "error":
                            if (!errorimg) {
                                errorimg = [];
                            }
                            errorimg.push(data);
                            break;
                        case "finish":
                            result(data);
                            break;
                    }
                });
            });
        }
        return {
            vNode: res.vNode,
            errorimg
        };
    }
    checkLayer(layer) {}

    positionToPoint(position) {
        if (!position || !position.left || !position.top || !position.width || !position.height) return null;
        return [position.left, position.top, position.left + position.width, position.top + position.height];
    }
    cutInArea(point, area) {
        if (!point || !area) {
            return null;
        }
        let newPoint = [];
        for (var i in point) {
            newPoint[i] = point[i];
            let index = parseInt(i);
            if (point[i] < area[index % 2]) {
                newPoint[i] = area[index % 2];
            }
            if (point[i] > area[index % 2] + 2) {
                newPoint[i] = area[index % 2] + 2;
            }
        }
        return newPoint;
    }
    getvnodetree(psdNode, vNode = null, imgPool = null, curDesignSize = null) {
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
            imgPool = new ImagePool();
            var pageSize;
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
                curDesignSize = {
                    left: 0,
                    top: 0,
                    width: perWidth,
                    height: psdChildren[0].artboard.height
                };
            } else {
                pageSize = {
                    left: 0,
                    top: 0,
                    width: psdNode.get("width"),
                    height: psdNode.get("height")
                };
                curDesignSize = pageSize;
            }
            this.getvnodetree(psdNode, vNode, imgPool, curDesignSize);

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
            let imgArea;
            let curposition;
            for (let i in childrenLayers) {
                curLayer = childrenLayers[i];
                curVNode = {};
                artboard = null;
                curLayerJson = null;
                //当前组是否是一个画布
                if (!!curLayer.layer.artboard) {
                    curVNode.isArtboard = true;
                    vNode.hasArtboard = true;
                    if (!psdNode.hasArtboard) {
                        psdNode.hasArtboard = true;
                    }
                    artboard = curLayer.layer.artboard().export().coords;
                    artboard.width = artboard.right - artboard.left;
                    artboard.height = artboard.bottom - artboard.top;
                    //记录一下实际拼接后 画布所处位置；
                    curLayer.offsetY = artRealTop;
                    artboard.realTop = artRealTop;
                    artRealTop += artboard.height;
                    curLayer.artboard = artboard;
                } else {
                    curLayer.offsetY = !!psdNode.offsetY ? psdNode.offsetY : 0;
                }

                //设置当前节点的类名,需要判断是否包含中文
                curVNode.props = {
                    class: PsdUtli.isChina(curLayer.name) ? "" : curLayer.name
                };

                //父级的绝对位置；如果是树形结构会用到
                let parentAbsPos;
                if (!!psdNode.newPosition) {
                    parentAbsPos = psdNode.newPosition;
                } else {
                    parentAbsPos = {
                        left: !!psdNode.artboard ? psdNode.artboard.left : psdNode.get("left"),
                        top: !!psdNode.artboard ? psdNode.artboard.top : psdNode.get("top")
                    };
                }

                //设置样式
                //记录需要纠正的位置
                imgArea = null;
                curposition = null;
                let curStyles: { [key: string]: any } = {};
                if (!curLayer.layer.visible) {
                    curStyles.display = "none";
                }
                curStyles.background = "none";
                if (!!artboard) {
                    //当前节点是一个画布 采用相对布局的方式
                    curDesignSize = {
                        left: 0,
                        top: 0,
                        width: artboard.width,
                        height: artboard.height
                    };
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
                    curposition = {
                        width: curLayer.get("width"),
                        height: curLayer.get("height"),
                        left: curLayer.get("left"),
                        top: curLayer.get("top")
                    };
                    if (!!curDesignSize) {
                        //只显示在可视区域内的；
                        let designRec = new Rectangle(curDesignSize);
                        let curLayerRec = new Rectangle(curposition);
                        let resRec = Rectangle.intersection(designRec, curLayerRec);
                        curposition = resRec.toStyles();
                        curLayer.newPosition = curposition;
                        let newInOriPoint = Point.relative(resRec.startPoint, curLayerRec.startPoint);
                        imgArea = new Rectangle(newInOriPoint, resRec.size).toStyles();
                    }
                    // console.log(curposition);
                    // console.log(imgArea);

                    Object.assign(curStyles, {
                        width: curposition.width,
                        height: curposition.height,
                        x: parseInt(curposition.left) - parseInt(parentAbsPos.left),
                        y: parseInt(curposition.top) - parseInt(parentAbsPos.top),
                        position: "absolute"
                    });
                    vNode.childrens.splice(0, 0, curVNode);
                }
                curVNode.styles = curStyles;
                curLayerJson = curLayer.export();
                //判断当前节点对应前端的哪个组件
                if (curLayer.type == "group") {
                    if (curLayer.name.indexOf("button") > -1) {
                        curVNode.view = "button";
                    } else {
                        curVNode.view = "container";
                    }

                    if (!!curLayer.children()) {
                        //生成多维数组；
                        curVNode.childrens = [];
                        this.getvnodetree(curLayer, curVNode, imgPool, curDesignSize);
                    }
                } else if (curLayer.type == "layer") {
                    // if(!!curLayerJson.text && !!curLayerJson.text.font){
                    //     console.log(curLayerJson.text);
                    // }
                    if (!!curLayerJson.text &&(curLayerJson.text.value.length>100 || (!!curLayerJson.text.font && PsdUtli.isSystemFont(curLayerJson.text.font)) ) ) {
                        //是文字节点
                        let font = curLayerJson.text.font;
                        curVNode.props.text = curLayerJson.text.value.replace(/↵/g, "<br/>").replace(/\n|\r/g, "<br/>");
                        if (curLayer.name.indexOf("button") > -1) {
                            curVNode.view = "button";
                        } else {
                            if (curLayer.name.indexOf("title") > -1) {
                                curVNode.props.istitle = true;
                            }
                            curVNode.view = "text";
                        }
                        let fontstyle: { [key: string]: any } = {};
                        if (!!font.sizes && font.sizes.length > 0) {
                            fontstyle.fontSize = font.sizes[0] + "px";
                        }
                        if (!!font.colors && font.colors.length > 0) {
                            fontstyle.color = PsdUtli.colorRGB2Hex(font.colors[0]);
                        }
                        Object.assign(curVNode.styles, fontstyle);
                        fontstyle = null;
                    } else {
                        curVNode.view = "image";
                        if (curposition.width * curposition.height < self.pixelMax) {
                            imgPool.push(new Image(this.imgdir, curLayer.path(), curLayer.layer.image, { obj: curVNode.props, key: "img" }, imgArea));
                            // curVNode.props.img = imgPool.pool.length;
                        } else {
                            curVNode.props.img = "";
                        }
                    }
                }
            }
        }
    }
}
export default PSD;
