var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require('fs');
var co = require('co');
var prompt = require('co-prompt');
var makeDir = require('make-dir');
co(function () {
    var project, path, developer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('\n\
============================================================\n\
-- 创建项目说明:\n\
-- Project name: 项目文件夹、Gulp Task任务名\n\
-- Path: 目录src起始\n\
-- Developer: 开发者\n\
============================================================\n');
                return [4 /*yield*/, prompt('Project name: ')];
            case 1:
                project = _a.sent();
                return [4 /*yield*/, prompt('Path: ')];
            case 2:
                path = _a.sent();
                return [4 /*yield*/, prompt('Developer: ')];
            case 3:
                developer = _a.sent();
                console.log('\n');
                if (!project || !path) {
                    console.log('创建失败......');
                    process.stdin.pause();
                    return [2 /*return*/];
                }
                path = 'src/' + path;
                makeDir(path).then(function () {
                    makeDir(path + '/css').then();
                    makeDir(path + '/images').then();
                    makeDir(path + '/js').then();
                    // 写入配置文件
                    fs.writeFile(path + '/config.json', JSON.stringify({ "name": project, "developer": developer }), function (err) {
                        if (err)
                            throw err;
                    });
                });
                console.log('创建成功......');
                process.stdin.pause();
                return [2 /*return*/];
        }
    });
});
