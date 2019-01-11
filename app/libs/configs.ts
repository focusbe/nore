

import path from 'path';
// const Configs = {
//     gameList(){
//         var configfile = path.resolve(__dirname,'../../config/games.json');
//         return jsonfile.readFileSync(configfile);
//     }
// }

const fs = require('fs');
var jsonfile = require('jsonfile');

class Config {
    private file: string = '';
    private static instance: Config;
    private config;
    private defaultConfig = {
        devpath: {
            name: "测试目录",
            value: ''
        },
        workshop: {
            name: "工作区目录",
            value: ''
        },
        svnFolders: {
            name: "svn代码目录",
            value: ''
        },
        gitFolders: {
            name: "git代码目录",
            value: ''
        },
        svnClient: {
            name: "乌龟SVN安装目录",
            value: ''
        }
    }

    static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config()
        }
        return this.instance
    }
    private gameList() {
        var configfile = path.resolve(__dirname, '../../config/games.json');
        return jsonfile.readFileSync(configfile);
    }
    private constructor() {
        this.file = path.join(__dirname, '../../config/config.json');
        var isexist = fs.existsSync(this.file);
        if (!isexist) {
            this.save(this.defaultConfig);
        }
        else{
            this.config = jsonfile.readFileSync(this.file);
        }

    }
    save(obj = null) {
        if (!obj) {
            obj = this.config;
        }
        this.config = obj;
        jsonfile.writeFileSync(this.file, obj, { spaces: 2, EOL: '\r\n' })
    }
    getList() {
        return this.config;
    }
    getItem(key) {
        if (!!this.config && !!this.config[key]) {
            return this.config[key]['value'] || '';
        }
        return false;
    }
    setItem(key, value, desc) {
        if (!!this.config) {
            if (!this.config[key]) {
                // if(!desc){
                //     return false;
                // }
                this.config[key] = {
                    name: desc,
                    value: value
                }
                this.save();
                return true;
            }
            else {
                this.config[key]['value'] = value;
                this.save();
                return true;
            }
        }
        return false;
    }
}
const config = Config.getInstance();
export default config