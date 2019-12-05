import path from "path";
import Files from "./files";
// const Configs = {
//     gameList(){
//         var configfile = path.resolve(__dirname,'../../config/games.json');
//         return jsonfile.readFileSync(configfile);
//     }
// }

const fs = require("fs");
var jsonfile = require("jsonfile");
const axios = require("axios");
import { inarar, DEBUG, isproduct } from "./env";
class Config {
	private file: string = "";
	private static instance: Config;
	private config;
	private defaultConfig = {
		// devpath: {
		//     name: "测试目录",
		//     type: "directory"
		// },
		// workshop: {
		//     name: "默认保存目录",
		//     type: "directory"
		// },
		// svnFolder: {
		//     name: "svn代码目录",
		//     type: "directory"
		// },
		// gitFolder: {
		//     name: "git代码目录",
		//     type: "directory"
		// }
		// svnClient: {
		//     name: "乌龟SVN安装目录",
		//     type: "directory"
		// },
		// vscodePath: {
		//     name: "vsCode路径",
		//     type: ".exe"
		// }
	};

	static getInstance(): Config {
		if (!Config.instance) {
			Config.instance = new Config();
		}
		return this.instance;
	}
	private async gameList() {
		let response = await axios.get("http://nore.focusbe.com/api/games.json");
		if (!!response && !!response.data) {
			return response.data;
		}
		return {};
		// var configfile = path.resolve(__dirname, "../../config/games.json");
		// return jsonfile.readFileSync(configfile);
	}
	private getConfigJson(configs) {
		var res = {};
		for (var i in configs) {
			if (!!configs[i]["values"]) {
				res[i] = configs[i]["values"];
			} else {
				res[i] = "";
			}
		}
		return res;
	}
	private constructor() {
		let homepath = process.env.HOME || "/";
		let configFiles = inarar ? ".norecode" : ".norecode_dev";

		this.file = path.join(homepath, configFiles + "/config.json");
		var isexist = fs.existsSync(this.file);
		if (!isexist) {
			this.save(this.getConfigJson(this.defaultConfig));
		} else {
			this.config = jsonfile.readFileSync(this.file);
		}
	}
	save(obj = null) {
		if (!obj) {
			obj = this.config;
		}
		this.config = obj;
		Files.writeJson(this.file, obj);
		//jsonfile.writeFileSync(this.file, obj, { spaces: 2, EOL: "\r\n" });
	}
	getConfigDesc() {
		return this.defaultConfig;
	}
	getConfigData() {
		return this.config;
	}
	getList() {
		return this.config;
	}
	getItem(key) {
		if (!!this.config && !!this.config[key]) {
			return this.config[key] || "";
		}
		return false;
	}
	setItem(key, value) {
		if (!!this.config) {
			this.config[key] = value;
			this.save();
			return true;
		}
		return false;
	}
}
const config = Config.getInstance();
export default config;
