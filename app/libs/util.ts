const path = require("path");
const shelljs = require("shelljs");
class Util {
    static idcache = {};
    static createId() {
        let id: string = new Date().getTime().toString();
        if (!!this.idcache[id]) {
            this.idcache[id]++;
            //console.log(this.idcache[id]);
            id = id + "" + this.idcache[id];
        } else {
            this.idcache[id] = 1;
        }
        return id;
    }
    static isPath(str) {
        if (typeof str == "string" && str.indexOf("/") > -1 && str.indexOf(".") > -1 && str.indexOf("//") == -1) {
            return true;
        }
        return false;
    }
    static cssUrlChange(cssDir, cssstr, from = null) {
        var regstr = /url\(([^\s\'\"\<\>]*?)\)/gim;
        var cssattr;
        while ((cssattr = regstr.exec(cssstr))) {
            if (!!cssattr[1] && cssattr.indexOf("//") < 0) {
                // cssstr += "#" + htmlattr[1] + "{\n\t" + htmlattr[3].replace(/;/g, ";\n\t") + "\n}\n";
                // htmlstr = htmlstr.replace('style="' + htmlattr[3] + '"', "");
                let resUrl;
                if (!!from) {
                    resUrl = path.relative(from, path.resolve(cssDir, cssattr[1])).replace(/\\/g, "/");
                } else {
                    resUrl = path.resolve(cssDir, cssattr[1]).replace(/\\/g, "/");
                }
                cssstr = cssstr.replace(cssattr[1], resUrl);
            }
        }
        return cssstr;
    }
    static async runSh(sh) {
        return await new Promise((resolve, reject) => {
            shelljs.exec(
                sh,
                {
                    async: true,
                    silent: true
                },
                function(code, stdout, stderr) {
                    if (!!stderr) {
                        console.log(stderr);
                        reject(stderr);
                    } else {
                        resolve(true);
                    }
                }
            );
        });
    }
    static howLong(time) {
        let milliseconds = new Date().getTime() - time;
        let timeSpanStr;
        var dateTime = new Date(time);
        var year = dateTime.getFullYear();
        var month = dateTime.getMonth() + 1;
        var day = dateTime.getDate();
        var hour = dateTime.getHours();
        var minute = dateTime.getMinutes();
        var second = dateTime.getSeconds();
        var now = new Date();
        if (milliseconds <= 1000 * 60 * 1) {
            timeSpanStr = "刚刚";
        } else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
            timeSpanStr = Math.round(milliseconds / (1000 * 60)) + "分钟前";
        } else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
            timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + "小时前";
        } else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 15) {
            timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + "天前";
        } else if (milliseconds > 1000 * 60 * 60 * 24 * 15 && year == now.getFullYear()) {
            timeSpanStr = month + "-" + day + " " + hour + ":" + minute;
        } else {
            timeSpanStr = year + "-" + month + "-" + day + " " + hour + ":" + minute;
        }
        return timeSpanStr;
    }
}
export default Util;
// var fs = require('fs');
// var co = require('co');
// var prompt = require('co-prompt');
// var makeDir = require('make-dir');

// var Util = function(){
//     createObj:function(options){
//         var defaultOptions ={
//             projectname:'',
//             buildtool:'',
//             gosid:'',
//             gamename:''
//         }
//         options = Object.assign(options,defaultOptions);
//         if( !options.projectname || !options.gamename || !options.buildtool|| !options.gosid){
//     		return {false,'缺少参数'}
//     	}

//     	path = 'src/' + options.gamename+'/'+options.projectname;
//     	makeDir(path).then(() => {
//     		makeDir(path + '/css').then();
//     		makeDir(path + '/images').then();
//     		makeDir(path + '/js').then();

//     		// 写入配置文件
//     		fs.writeFile(path + '/config.json', JSON.stringify({ "name": project, "developer": developer }), (err) => {
//     			if(err) throw err;
//     		});
//     	});
//     }
// }
