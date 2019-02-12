const fse = require('fs-extra');
const path = require('path');
class Files {
    static copy(src, dst, callback) {
        var _self = this;
        fse.copy(src, dst, err => {
            callback(err);
        });
    }
    static async getAlivpath(filepath, number) {
        if (!number) {
            number = 0;
        }
        let exists = await fse.pathExists(filepath);
        if (exists) {
            let extname = path.extname(filepath);
            let basename = path.basename(filepath, extname);
            let dirname = path.dirname(filepath);
            number++;
            basename = basename + '' + number;
            filepath = path.join(dirname, basename + extname);
            return await this.getAlivpath(filepath, number);
        }
        else {
            return filepath;
        }

    }
    static async createdirAsync(src) {
        let exists = await fse.exists(src);
        if (exists) {
            return true;
        }
        var res = await new Promise(function (result, reject) {
            fse.mkdir(src, function (err) {
                console.log(src);
                if (!err)
                    result(true);

                else
                    reject(err);
            })
        });
        return res;
    }
    static createdir(src, callback) {
        fse.exists(src, function (exists) {
            if (exists) {
                //存在
                callback(src);
            } else {
                //bu存在
                try {
                    fse.mkdir(src, function () {
                        //创建目录
                        callback(src);
                    });
                } catch (error) {
                    callback(false, error);
                }

            }
        });
    }
    static getTree(src, folder) {
        if (!folder) {
            folder = [];
        }
        
        return new Promise(function (result, reject) {
            fse.pathExists(src,function(err,exists){
                if(!!err){
                    reject(err);
                    return;
                }
                if(!exists){
                    result(folder);
                }
                fse.readdir(src, function (err, paths) {
                    if (!err) {
                        var promisArr = [];
                        var length = paths.length;
                        var done = 0;
                        paths.forEach(async function (curpath) {
                            var _src = src + "/" + curpath;
                            var filestat = fse.statSync(_src);
                            if (filestat) {
                                if (filestat.isDirectory()) {
                                    var _folder = { name: curpath, children: [] };
                                    folder.push(_folder);
                                    Files.getTree(_src, _folder['children']).then(function (res) {
                                        done++;
                                        if (done >= length) {
                                            result(folder);
                                        }
                                    }).catch(function () {
                                        done++;
                                        if (done >= length) {
                                            result(folder);
                                        }
                                    });
                                }
                                else {
                                    done++;
                                    folder.push({ 'path': _src, 'name': path.basename(_src) });
                                    if (done >= length) {
                                        result(folder);
                                    }
                                }
                            }
                            else {
                                done++;
                                reject('获取文件状态失败');
                            }
    
                        });
                    }
                    else {
    
                        reject(err);
                    }
                });
            });
            

        });
    }
    static getList(src, hasFile, callback) {
        if (typeof hasFile == "function") {
            callback = hasFile;
            hasFile = [];
        }
        // var fileslist = fse.readdirSync(src);
        // return fileslist;

        fse.readdir(src, function (err, paths) {
            if (!!err || !paths) {
                callback(false);
                return;
            }
            var filestlist = new Object();
            paths.forEach(function (curpath) {
                var _src = src + "/" + curpath;
                var readable;
                var writable;
                var filestat = fse.statSync(_src);
                var issure = true;
                if (filestat && filestat.isDirectory()) {
                    var projectfiles = fse.readdirSync(_src);
                    for (var filename in hasFile) {
                        if (projectfiles.indexOf(filename) < 0) {
                            issure = false;
                            break;
                        }
                    }
                    if (issure) {
                        filestlist[curpath] = _src;
                    }
                }
            });
            callback(filestlist);
        });
    }
    static exists(src, dst, callback) {
        fse.exists(dst, function (exists) {
            if (exists) {
                //不存在
                callback(src, dst);
            } else {
                //存在
                fse.mkdir(dst, function () {
                    //创建目录
                    callback(src, dst);
                });
            }
        });
    }
    static isdir(src, callback) {
        //判断打开的是文件 还是 文件夹
        fse.stat(src, function (err, stat) {
            if (err) {
                console.error(err);
                throw err;
            }
            callback(stat.isDirectory());
        });
    }
}
export default Files;
// module.exports = Files;