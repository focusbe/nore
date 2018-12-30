var Files = /** @class */ (function () {
    function Files() {
    }
    Files.copy = function (src, dst, callback) {
        var _self = this;
        fse.copy(src, dst, function (err) {
            callback(err);
        });
    };
    Files.createdir = function (src, callback) {
        fs.exists(src, function (exists) {
            if (exists) {
                //存在
                callback(src);
            }
            else {
                //bu存在
                fs.mkdir(src, function () {
                    //创建目录
                    callback(src);
                });
            }
        });
    };
    Files.getList = function (src, hasFile, callback) {
        if (typeof hasFile == "function") {
            callback = hasFile;
            hasFile = [];
        }
        // var fileslist = fs.readdirSync(src);
        // return fileslist;
        fs.readdir(src, function (err, paths) {
            var filestlist = new Object();
            paths.forEach(function (path) {
                var _src = src + "/" + path;
                var readable;
                var writable;
                var filestat = fs.statSync(_src);
                var issure = true;
                if (filestat && filestat.isDirectory()) {
                    var projectfiles = fs.readdirSync(_src);
                    for (var filename in hasFile) {
                        if (projectfiles.indexOf(filename) < 0) {
                            issure = false;
                            break;
                        }
                    }
                    if (issure) {
                        filestlist[path] = _src;
                    }
                }
            });
            callback(filestlist);
        });
        // return filestlist;
    };
    Files.exists = function (src, dst, callback) {
        fs.exists(dst, function (exists) {
            if (exists) {
                //不存在
                callback(src, dst);
            }
            else {
                //存在
                fs.mkdir(dst, function () {
                    //创建目录
                    callback(src, dst);
                });
            }
        });
    };
    Files.isdir = function (src, callback) {
        //判断打开的是文件 还是 文件夹
        console.log(src);
        fs.stat(src, function (err, stat) {
            if (err) {
                console.error(err);
                throw err;
            }
            callback(stat.isDirectory());
        });
    };
    return Files;
}());
export default Files;
