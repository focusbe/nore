const fse = require("fs-extra");
const path = require("path");
const shelljs = require("shelljs");
var sudo = require("sudo-prompt");
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
            basename = basename + "" + number;
            filepath = path.join(dirname, basename + extname);
            return await this.getAlivpath(filepath, number);
        } else {
            return filepath;
        }
    }
    static async createdirAsync(src) {
        let exists = await fse.exists(src);
        if (exists) {
            return true;
        }
        var res = await new Promise((result, reject) => {
            // fse.mkdir(src, function(err) {
            //     if (!err) result(true);
            //     else reject(err);
            // });
            this.createdir(src, success => {
                if (!!success) {
                    result(success);
                } else {
                    reject("创建文件失败");
                }
            });
        });
        return res;
    }
    static async getMtime(file) {
        console.log(file);
        let exists = await fse.exists(file);
        if (exists) {
            try {
                var stats = await fse.stat(file);
            } catch (error) {
                return false;
            }
            if (!!stats && !!stats.mtime) {
                console.log(stats.mtime);
                return stats.mtime;
            }
            return false;
        }
        return false;
    }
    static async writeFile(src, content) {
        var res = await new Promise((resolve, reject) => {
            this.createdir(path.dirname(src), function(bool) {
                if (!bool) {
                    reject("创建目录失败");
                    return;
                }
                fse.writeFile(src, content, function(err) {
                    if (err) reject(err);
                    else {
                        resolve(true);
                    }
                });
            });
        });
        return res;
    }
    static async writeJson(src, json) {
        var res = await new Promise((resolve, reject) => {
            this.createdir(path.dirname(src), function(bool) {
                if (!bool) {
                    reject("创建目录失败");
                    return;
                }
                fse.writeJson(src, json, { spaces: 4, EOL: "\n" }, function(err) {
                    if (err) reject(err);
                    else {
                        resolve(true);
                    }
                });
            });
        });
        return res;
    }
    static createdir(src, callback) {
        let parentdir = path.dirname(src);
        fse.exists(parentdir, function(exists) {
            if (!exists) {
                Files.createdir(parentdir, function() {
                    try {
                        fse.mkdir(src, function() {
                            //创建目录
                            callback(src);
                        });
                    } catch (error) {
                        callback(false, error);
                    }
                });
            } else {
                // console.log(src);
                fse.exists(src, function(exists) {
                    if (exists) {
                        //存在
                        callback(src);
                    } else {
                        //bu存在
                        try {
                            fse.mkdir(src, function() {
                                //创建目录
                                callback(src);
                            });
                        } catch (error) {
                            callback(false, error);
                        }
                    }
                });
            }
        });
    }
    static getTree(src, istree, folder) {
        if (!folder) {
            folder = [];
        }
        if (typeof istree == "undefined") {
            istree = true;
        }
        return new Promise(function(result, reject) {
            fse.pathExists(src, function(err, exists) {
                if (!!err) {
                    reject(err);
                    return;
                }
                if (!exists) {
                    result(folder);
                }
                fse.readdir(src, function(err, paths) {
                    if (!err) {
                        var promisArr = [];
                        var length = paths.length;
                        var done = 0;
                        paths.forEach(async function(curpath) {
                            var _src = src + "/" + curpath;
                            var filestat = fse.statSync(_src);
                            if (filestat) {
                                if (filestat.isDirectory()) {
                                    var saveArr = folder;
                                    if (istree) {
                                        var _folder = {
                                            name: curpath,
                                            children: []
                                        };
                                        folder.push(_folder);
                                        saveArr = _folder["children"];
                                    }

                                    Files.getTree(_src, istree, saveArr)
                                        .then(function(res) {
                                            done++;
                                            if (done >= length) {
                                                result(folder);
                                            }
                                        })
                                        .catch(function() {
                                            done++;
                                            if (done >= length) {
                                                result(folder);
                                            }
                                        });
                                } else {
                                    done++;
                                    folder.push({
                                        path: _src,
                                        name: path.basename(_src)
                                    });
                                    if (done >= length) {
                                        result(folder);
                                    }
                                }
                            } else {
                                done++;
                                reject("获取文件状态失败");
                            }
                        });
                    } else {
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

        fse.readdir(src, function(err, paths) {
            if (!!err || !paths) {
                callback(false);
                return;
            }
            var filestlist = new Object();
            paths.forEach(function(curpath) {
                var _src = path.resolve(src, curpath);
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
        fse.exists(dst, function(exists) {
            if (exists) {
                //不存在
                callback(src, dst);
            } else {
                //存在
                fse.mkdir(dst, function() {
                    //创建目录
                    callback(src, dst);
                });
            }
        });
    }
    static isdir(src, callback) {
        //判断打开的是文件 还是 文件夹
        fse.stat(src, function(err, stat) {
            if (err) {
                console.error(err);
                throw err;
            }
            callback(stat.isDirectory());
        });
    }
    static async delFile(filepath, times) {
        if (!times) {
            times = 0;
        }
        let exists = await fse.pathExists(filepath);
        if (exists) {
            var res = await new Promise(function(resolve, reject) {
                fse.unlink(filepath, function(err) {
                    if (err) {
                        if (times < 5) {
                            setTimeout(async () => {
                                times++;
                                var res = await Files.delFile(filepath, times);
                                resolve(false);
                            }, 300);
                        } else {
                            resolve(false);
                        }
                    } else {
                        resolve(true);
                    }
                });
            });
            return res;
        } else {
            return true;
        }
    }
    static async createLn(src, target) {
        if (!src || !target) {
            return false;
        }
        let exists1 = await fse.pathExists(src);
        if (!exists1) {
            return false;
        }
        var targetPath = target + path.basename(src);
        let exists = await fse.pathExists(target);
        if (!!exists) {
            return true;
        }
        let res = await new Promise((resolve, reject) => {
            let sh;
            console.log(process.platform);
            if (process.platform == "darwin" || process.platform == "linux") {
                sh = "ln -s " + src + " " + target;
            } else if (process.platform == "win32") {
                sh = "mklink /D " + target + " " + src;
            } else {
                reject("该平台不支持创建软连接");
            }
            sudo.exec(
                sh,
                {
                    name: "Nore",
                    icns: path.resolve(__dirname, "../../assets/norecode.icns")
                },
                function(code, stdout, stderr) {
                    console.log(code);
                    console.log(stdout);
                    console.log(stderr);
                    if (!!stderr) {
                        reject(stderr);
                    } else {
                        resolve(true);
                    }
                }
            );
        });
        return res;
    }
}
export default Files;
// module.exports = Files;
