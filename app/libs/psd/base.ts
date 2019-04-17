import Sharp from "sharp";
var Pinyin = require("pinyin");
const fse = require("fs-extra");
import Util from "../util";
import Files from "../files";
const path = require("path");
//点
class Point {
    public x: number = 0;
    public y: number = 0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    public addSize(size: Size) {
        var newPoint = new Point(this.x + size.width, this.y + size.height);
        return newPoint;
    }
    public static relative(point1: Point, point2: Point) {
        var newPoint = new Point(point1.x - point2.x, point1.y - point2.y);
        return newPoint;
    }
    public static getSize(point1: Point, point2: Point) {
        var size = new Size(point2.x - point1.x, point2.y - point1.y);
        return size;
    }
    public static min(point1: Point, point2: Point) {
        let tempoint = new Point(Math.min(point1.x, point2.x), Math.min(point1.y, point2.y));
        return tempoint;
    }
    public static max(point1: Point, point2: Point) {
        let tempoint = new Point(Math.max(point1.x, point2.x), Math.max(point1.y, point2.y));
        return tempoint;
    }
}
//矩形的尺寸
class Size {
    public width: number = 0;
    public height: number = 0;
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}
//矩形
class Rectangle {
    public startPoint: Point;
    public size: Size;
    public endPoint: Point;
    constructor(x, y = null, width = null, height = null) {
        if (typeof x == "object" && !y) {
            //从样式初始化
            this.startPoint = new Point(x.left, x.top);
            this.size = new Size(x.width, x.height);
            this.endPoint = this.startPoint.addSize(this.size);
        } else if (x instanceof Point && y instanceof Point) {
            //从初始位置和结束位置初始化
            this.size = Point.getSize(x, y);
            this.startPoint = x;
            this.endPoint = y;
        } else if (x instanceof Point && y instanceof Size) {
            //从初始位置和大小
            this.size = y;
            this.startPoint = x;
            this.endPoint = this.startPoint.addSize(y);
        } else {
            //从初始位置和大小
            this.startPoint = new Point(x, y);
            this.size = new Size(width, height);
            this.endPoint = this.startPoint.addSize(this.size);
        }
    }
    public toStyles() {
        return {
            width: this.size.width,
            height: this.size.height,
            left: this.startPoint.x,
            top: this.startPoint.y
        };
    }
    public static hasIntersection(rec1: Rectangle, rec2: Rectangle) {
        let newrec = this.intersection(rec1, rec2);
        if (newrec.size.width < 0 || newrec.size.height < 0) {
            return false;
        }
        return true;
    }
    public static intersection(rec1: Rectangle, rec2: Rectangle) {
        let start = Point.max(rec1.startPoint, rec2.startPoint);
        let end = Point.min(rec1.endPoint, rec2.endPoint);
        let newrec = new Rectangle(start, end);
        return newrec;
    }
    public static isBefore(rec1: Rectangle, rec2: Rectangle) {
        if (rec1.endPoint.y < rec2.startPoint.y) {
            return true;
        } else if (rec1.endPoint.x < rec2.startPoint.x) {
            if (rec2.endPoint.y > rec1.startPoint.y) {
                return true;
            }
            return false;
        }
        return false;
    }
}
//图片相关
class Image {
    private outputdir;
    private nametip;
    private layerimg;
    private area;
    private usewebp;
    private status = 0;
    private outputname;
    private outCallback;
    private static namePool = {};
    private fullpath;
    constructor(outputdir, nametip, layerimg, outCallback, area = null, usewebp = false) {
        this.outputdir = outputdir;
        this.nametip = nametip;
        this.layerimg = layerimg;
        this.area = area;
        this.usewebp = usewebp;
        this.outputname = Image.getImgName(this.nametip);
        this.fullpath = path.resolve(this.outputdir, this.outputname + ".png");
        this.outCallback = outCallback;
    }
    public save(cb) {
        let self = this;
        this.layerimg
            .saveAsPng(this.fullpath)
            .then(
                function() {
                    let position = this.area;
                    if (!!position) {
                        var areasharp = Sharp(this.fullpath).extract(position);
                        function saveEnd(bool, imgurl = "") {
                            if (!!bool) {
                                imgurl = path.relative(this.outputdir, imgurl);
                                this.outCallback(imgurl);
                                cb(true, imgurl);
                            } else {
                                this.outCallback("");
                                cb(false, "");
                            }
                        }
                        let saveEndFun = saveEnd.bind(this);
                        if (this.usewebp) {
                            let webpFile = path.resolve(this.outputdir, this.outputname + ".webp");
                            areasharp.webp().toFile(webpFile, (err, info) => {
                                if (!!err) {
                                    saveEndFun(false);
                                    return;
                                } else {
                                    saveEndFun(true, webpFile);
                                }
                            });
                        } else {
                            let tempfile = path.resolve(this.outputdir, this.outputname + ".temp.webp");
                            areasharp.webp().toFile(tempfile, (err, info) => {
                                if (!!err) {
                                    saveEndFun(false);
                                    // try {
                                    //     fse.unlink(this.fullpath);
                                    // } catch (error) {}
                                    // try {
                                    //     console.log('unlink');
                                    //     fse.unlink(tempfile);
                                    // } catch (error) {
                                    //     //console.log(error);
                                    // }
                                    Files.delFile(this.fullpath);
                                    Files.delFile(tempfile);
                                    return;
                                }
                                areasharp = null;
                                let tempSharp = Sharp(tempfile);

                                tempSharp.metadata().then(metadata => {
                                    // stats contains the channel-wise statistics array and the isOpaque value
                                    let realImgurl;
                                    if (!!metadata && metadata.channels == 3) {
                                        realImgurl = path.resolve(this.outputdir, this.outputname + ".jpg");
                                        tempSharp
                                            .jpeg({
                                                quality: 60
                                            })
                                            .toFile(realImgurl, (err, info) => {
                                                if (!!err) {
                                                    saveEndFun(false, "");
                                                } else {
                                                    saveEndFun(true, realImgurl);
                                                }
                                                Files.delFile(tempfile);
                                                Files.delFile(this.fullpath);
                                            });
                                    } else {
                                        realImgurl = path.resolve(this.outputdir, this.outputname + ".tmp.png");
                                        tempSharp.png().toFile(realImgurl, (err, info) => {
                                            if (!!err) {
                                                saveEndFun(false, "");
                                            } else {
                                                Files.delFile(this.fullpath).then(res => {
                                                    if (!res) {
                                                        saveEnd.bind(this)(false, "");
                                                    } else {
                                                        fse.rename(realImgurl, this.fullpath, err => {
                                                            if (err) {
                                                                saveEndFun(false, "");
                                                                return;
                                                            }
                                                            saveEndFun(true, this.fullpath);
                                                        });
                                                    }
                                                });
                                            }
                                            Files.delFile(tempfile);
                                        });
                                    }
                                    // saveEndFun(true, realImgurl);
                                });
                            });
                        }
                    } else {
                        cb(true);
                    }
                }.bind(this)
            )
            .catch(function(err) {
                cb(false, err);
            });
    }
    public getStatus() {
        return this.status;
    }
    public getOutputName() {
        if (!this.status || !this.outputname) {
            return false;
        } else {
            return this.outputname;
        }
    }
    public getFullPath() {
        if (!this.status || !this.outputname) {
            return false;
        } else {
            return this.outputdir + this.outputname;
        }
    }

    static getImgName(imgname, num = 0) {
        //获取唯一的文件名；
        if (num == 0) {
            imgname = imgname.replace(/(^\s*)|(\s*$)/g, "");
            let temp = imgname.split("/");
            if (imgname.length == 1) {
                imgname = temp[0];
                imgname = imgname.split(" ");
                imgname = imgname[0].replace(/ /g, "");
            } else {
                let temp1 = temp[0].split(" ");
                temp1 = temp1[0].replace(/ /g, "");
                temp1 = PsdUtli.Pinyin(temp1);
                let temp2 = temp[temp.length - 1].split(" ");
                temp2 = temp2[0].replace(/ /g, "");
                temp2 = PsdUtli.Pinyin(temp2);
                imgname = temp1 + "_" + temp2;
            }
            let length = PsdUtli.getByteLen(imgname);
            let maxLength = PsdUtli.isChina(imgname) ? 10 : 20;
            if (length > maxLength) {
                //字符也太长了吧显然不是名称呀
                return Util.createId();
            } else if (PsdUtli.isChina(imgname)) {
                imgname = PsdUtli.Pinyin(imgname);
            }
            if (!PsdUtli.isGoodName(imgname)) {
                return Util.createId();
            }
        }
        let res = imgname;
        if (!!num) {
            res = imgname + "" + num;
        }
        if (!!this.namePool[res]) {
            num++;
            res = this.getImgName(imgname, num);
        }
        this.namePool[res] = 1;
        return res;
    }
}

class ImagePool {
    public pool = [];
    private status = 0;
    private changeListener = null;
    public push(img: Image) {
        this.pool.push(img);
    }
    private saveNextImg(i) {
        let self = this;
        if (i >= this.pool.length) {
            if (typeof this.changeListener == "function") {
                this.changeListener("finish", true);
            }
            this.status = 0;
            this.changeListener = null;
            return;
        }
        if (!this.pool[i]) {
            this.pool[i] = null;
            self.saveNextImg(i + 1);
            return;
        }
        this.pool[i].save(function(bool, error) {
            if (typeof self.changeListener == "function") {
                if (!!bool) {
                    self.changeListener("change", i);
                } else {
                    self.changeListener("error", i);
                }
            }
            self.saveNextImg(i + 1);
        });
    }
    public start(cb) {
        if (!!this.status || this.pool.length == 0) {
            return false;
        }
        this.status = 1;
        this.changeListener = cb;
        this.saveNextImg(0);
        return true;
    }
    public getImage(index: number) {
        if (!!this.pool[index]) {
            return this.pool[index];
        }
        return false;
    }
    public getLength() {}
}
//psd解析相关的其他方法
class PsdUtli {
    private static systemFont = ["Microsoft YaHei", "微软雅黑", "SimHei", "KaiTi", "Arial"];
    static isSystemFont(font) {
        var fontname;
        if (!!font.name) {
            fontname = font.name;
        } else if (!!font.names) {
            fontname = font.names;
        } else {
            return false;
        }
        if (!fontname) {
            return false;
        }
        if (typeof fontname == "string") {
            fontname = [fontname];
        }
        for (var j in fontname) {
            for (var i in this.systemFont) {
                if (
                    fontname[j]
                        .replace(/ /g, "")
                        .toLowerCase()
                        .indexOf(this.systemFont[i].replace(/ /g, "").toLowerCase()) > -1
                ) {
                    return this.systemFont[i];
                }
            }
        }
        return false;
    }
    static colorRGB2Hex(rgb) {
        let r = parseInt(rgb[0]);
        let g = parseInt(rgb[1]);
        let b = parseInt(rgb[2]);
        let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }
    static isChina(s) {
        let patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
        if (!patrn.exec(s)) {
            return false;
        } else {
            return true;
        }
    }
    static trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
    static isGoodName(t) {
        if (!t || PsdUtli.isChina(t)) {
            return false;
        }
        var szMsg = "[#%&'\",;:=!^]";
        for (var i = 1; i < szMsg.length + 1; i++) {
            if (t.indexOf(szMsg.substring(i - 1, i)) > -1) {
                return false;
            }
        }
        return true;
    }
    static Pinyin(str) {
        if (this.isChina(str)) {
            var res = Pinyin(str, {
                style: Pinyin.STYLE_NORMAL, // 设置拼音风格
                heteronym: false
            });
            var resstr = "";
            for (var i in res) {
                if (!!res[i] && res[i][0]) resstr += res[i][0];
            }
            return resstr;
        }
        return str;
    }
    static getByteLen(val) {
        var len = 0;
        for (var i = 0; i < val.length; i++) {
            var length = val.charCodeAt(i);
            if (length >= 0 && length <= 128) {
                len += 1;
            } else {
                len += 2;
            }
        }
        return len;
    }
    static getClassName(str) {
        str = this.trim(str);
        if (str.length > 100) {
            return "";
        }
        str = this.Pinyin(str);
        return str;
    }
    static isButtonName(curclassname) {
        return curclassname.indexOf("_btn") > -1 || curclassname.indexOf("button") > -1 || curclassname.indexOf("anniu") > -1;
    }
}
export { Point, Size, Rectangle, Image, PsdUtli, ImagePool };
