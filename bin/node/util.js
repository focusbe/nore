var fs = require('fs');
var co = require('co');
var prompt = require('co-prompt');
var makeDir = require('make-dir');

var Util = function(){
    createObj:function(options){
        var defaultOptions ={
            projectname:'',
            buildtool:'',
            gosid:'',
            gamename:''
        }
        options = Object.assign(options,defaultOptions);
        if( !options.projectname || !options.gamename || !options.buildtool|| !options.gosid){
    		return {false,'缺少参数'}
    	}

    	path = 'src/' + options.gamename+'/'+options.projectname;
    	makeDir(path).then(() => {
    		makeDir(path + '/css').then();
    		makeDir(path + '/images').then();
    		makeDir(path + '/js').then();

    		// 写入配置文件
    		fs.writeFile(path + '/config.json', JSON.stringify({ "name": project, "developer": developer }), (err) => {
    			if(err) throw err;
    		});
    	});
    }
}
