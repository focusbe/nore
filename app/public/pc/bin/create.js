var fs = require('fs');
var co = require('co');
var prompt = require('co-prompt');
var makeDir = require('make-dir');

co(function*(){

console.log('\n\
============================================================\n\
-- 创建项目说明:\n\
-- Project name: 项目文件夹、Gulp Task任务名\n\
-- Path: 目录src起始\n\
-- Developer: 开发者\n\
============================================================\n');

	var project = yield prompt('Project name: ');
	var path = yield prompt('Path: ');
	var developer = yield prompt('Developer: ');

	console.log('\n');

	if( !project || !path ){
		console.log('创建失败......');
		process.stdin.pause();
		return;
	}

	path = 'src/' + path;
	makeDir(path).then(() => {
		makeDir(path + '/css').then();
		makeDir(path + '/images').then();
		makeDir(path + '/js').then();

		// 写入配置文件
		fs.writeFile(path + '/config.json', JSON.stringify({ "name": project, "developer": developer }), (err) => {
			if(err) throw err;
		});
	});
	console.log('创建成功......');

	process.stdin.pause();
});