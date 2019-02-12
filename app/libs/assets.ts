import Configs from './configs';
import path from 'path';
import Files from './files';
const fse = require('fs-extra');
class Assets {
    private actname: string
    private assetsdir: string
    private actdir: string
    constructor(actname) {
        console.log(actname);
        this.actname = actname;
        this.actdir = path.resolve(Configs.getItem('workshop'), this.actname);
        this.assetsdir = path.resolve(this.actdir, 'uploads');
    }
    async upload(filePath) {
        let exists = await fse.exists(this.actdir);
        if (!exists) {
            throw new Error('项目文件夹不存在');
        }
        var res = await Files.createdirAsync(this.assetsdir);
        let extname = path.extname(filePath);
        let basename = path.basename(filePath, extname);
        let resfilepath = path.resolve(this.assetsdir, basename + extname);
        resfilepath = await Files.getAlivpath(resfilepath);
        await fse.copy(filePath,resfilepath);
        return resfilepath;
    }
    getList() {
        return Files.getTree(this.assetsdir);
    }
}
export default Assets;