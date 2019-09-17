//软件全局数据库类
import path from 'path';
import { configFolder } from './env';
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync"); // 有多种适配器可选择
const lodashId = require("lodash-id");
class DataBase {
    private static instance: DataBase;
    static getInstance(): DataBase {
        if (!DataBase.instance) {
            DataBase.instance = new DataBase();
        }
        return this.instance;
    }
    private defaultTables = {
        projects: [],
        config: {}
    }
    private db;
    private state = 0;
    private readyCbs = [];
    private constructor() {
        let dbjsonpath = path.resolve(configFolder, "db.json");
        let adapter = new FileSync(dbjsonpath); // 申明一个适配器
        this.db = low(adapter);
        this.db._.mixin(lodashId);
        this.db
            .defaults(this.defaultTables)
            .write();
    }
    public getDb() {
        //获取数据库变量，采用异步获取的方法；
        return this.db;
    }
}
const dataBase = DataBase.getInstance();
export default dataBase;