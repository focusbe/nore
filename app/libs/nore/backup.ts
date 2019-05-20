import Configs from "../configs";
import path from "path";
import Files from '../files';
import fs from 'fs-extra';
import Util from '../util'
class Extension {
    private static instance: Extension;
    private extensiondir;
    constructor() {
        this.extensiondir = path.resolve(__dirname, "../../../extension");
    }
    static getInstance(): Extension {
        if (!Extension.instance) {
            Extension.instance = new Extension();
        }
        return this.instance;
    }
    async createEntry() {
        //创建extension进入页面，包含1、默认extension目录中的所有组件
        try {
            let entryjsStr = await fs.readFile(path.resolve(__dirname,'./entry.js'), "utf8");
            entryjsStr = entryjsStr.replace('__ExtensionDir__',this.extensiondir);
            entryjsStr = entryjsStr.replace('__ModuleId__','extension');
            
        } catch (error) {
            
        }
        
    }
    pack() {}
}
const config = Extension.getInstance();
export default config;
