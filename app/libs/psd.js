const psdjs = require('psd');
const fse = require('fs-extra');
class PSD {
    static async parse(psdpath, imgdir) {
        //判断文件是否存在，保存图片的目录是否存在
        let exists = await fse.exists(psdpath);
        if (!exists) {
            throw new Error("psd文件不存在");
        }
        exists = await fse.exists(imgdir);
        if (!exists) {
            var res = await new Promise(function (result, reject) {
                fse.mkdir(imgdir, function (err) {
                    if (!err)
                        result(true);
                    else
                        reject(err);
                })
            });
        }
        var psd = await psdjs.open(psdpath);
        var psdtree = psd.tree();
        var {
            vnodetree,
            saveimgPool
        } = PSD.getvnodetree(psdtree.children());
        var errorimg = null;
        await new Promise(function (result, reject) {
            PSD.saveimg(saveimgPool, 0, function (res) {
                result(res);
            }, null, function (img) {
                if (!errorimg) {
                    errorimg = [];
                }
                errorimg.push(img);
            });
        });
        return {
            vnodetree,
            errorimg
        };
    }
    static saveimg(pool, i, callback, onsuccess, onerror) {
        if (!!pool) {
            pool[i]["image"]
                .saveAsPng(pool[i]["path"])
                .then(function () {
                    if (!!onsuccess) {
                        onsuccess(i);
                    }
                    if (i >= saveimgPool.length - 1) {
                        callback(true);
                    } else {
                        i++;
                        PSD.saveimg(pool, i, callback);
                    }
                })
                .catch(function () {
                    if (!!onerror) {
                        onerror(pool[i]);
                        throw new Error("文件" + pool[i]["path"] + "保存失败");
                    }
                    if (i >= saveimgPool.length - 1) {
                        callback(true);
                    } else {
                        saveimg(i++, callback);
                    }
                });
        }
        return true;
    }
    static getvnodetree(children, curtree) {
        if (!curtree) {
            curtree = [{
                view: "container",
                childrens: []
            }];
            //需要保存的图片
            var saveimgPool = [];
            var ismutilBoard = false;
            PSD.getvnodetree(children, curtree[0]["childrens"]);
            curtree[0].styles = {
                width: ismutilBoard ? "100%" : psdtree.get("width"),
                height: ismutilBoard ? "auto" : psdtree.get("height"),
                x: 0,
                position: "relative",
                y: 0,
                background: "none"
            };
        } else {
            let curnode, curview, imgname, artboard;
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
                //设置当前节点的样式
                curview.styles = {
                    width: artboard ?
                        artboard.width : curnode.get("width"),
                    height: artboard ?
                        artboard.height : curnode.get("height"),
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
                //设置当前节点的类名
                curview.props = {
                    className: curnode.name
                };
                //判断当前节点对应前端的哪个组件
                if (curnode.type == "group") {
                    curview.view = "container";
                    if (!!curnode.children()) {
                        curview.childrens = [];
                        PSD.getvnodetree(
                            curnode.children(),
                            curview.childrens
                        );
                    }
                } else if (curnode.type == "layer") {
                    curview.view = "image";
                    imgname = curnode.path().replace(/\//g, "_");
                    saveimgPool.push({
                        image: curnode.layer.image,
                        path: path.resolve(
                            imgname + ".png"
                        )
                    });
                    curview.props.img = path.resolve(
                        imgname + ".png"
                    );
                }
                curtree.push(curview);
            }
        }
        return {
            curtree,
            saveimgPool
        };
    }
}
module.exports = PSD;