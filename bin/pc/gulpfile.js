var gulp = require('gulp'),
	cwd = require('cwd'),
	rd = require('rd'),
	readJsonSync = require('read-json-sync'),
	fileRead = require('file-read'),
	scss = require('gulp-scss'),
	cssmin = require('gulp-minify-css'),
	imagemin = require('gulp-imagemin'), // 图片压缩
	requirejsOptimize = require('gulp-requirejs-optimize'),
	connect = require('gulp-connect'), // hot refresh
	cache = require('gulp-cache'),
	del = require('del'), // 删除文件
	opn = require('opn'),
	clean = require('gulp-clean');


const src = 'src'; //开发目录
const dist = 'dist'; //产出目录
const cfile = 'config.json'; //配置文件
var CONFIG = []; //项目配置


// 遍历目录读取配置文件
rd.eachSync(src, (path, prop) => {
	if( path.indexOf(cfile) > -1 ){
		var item = readJsonSync(path);
		var arr = path.split('\\'+ src +'\\');
		var _src = src +'\\'+ arr[1].replace(cfile, '');
		var _dist = dist +'\\'+ arr[1].replace(cfile, '');

		item['dir'] = arr[0];
		item['src'] = item.src ? item.src : _src;
		item['dist'] = item.dist ? item.dist : _dist;

		// console.log(item);
		CONFIG.push(item);
	}
});



// image匹配规则
let imgArr = function(type){
	return [ `${type}**/*.png`, `${type}**/*.jpg`, `${type}**/*.jpeg`, `${type}**/*.gif` ];
};


// 配置注册项目任务
CONFIG.forEach((i) => {
	var name = i.name;
	var _dir = i.dir;
	var _src = i.src;
	var _dist = i.dist;


	// scss预处理
	gulp.task(`${name}:css`, () => {
		gulp.src(`${_src}css/*.scss`)
			.pipe(scss())
			.pipe(cssmin())
			.pipe(connect.reload())
			.pipe(gulp.dest(`${_dist}css`));
	});


	// js: requirejs模块依赖、合并、压缩
	gulp.task(`${name}:js`, () => {
		var configPath = {};
		fileRead(cwd() + '/requirejs.config.js', {
			size: '100000', //字节
			flag: 'r', //读取
			encoding: 'utf8',
			tail: false //尾部读取
		}, (err, res) => {
			if( err ){
				console.error(err);
				return;
			}

			configPath = res.replace(/[\s|\n|\r]*/g, '').match(/(?:['"]?paths['"]?:)(\{[^\}]+\})/)[1];
			configPath = JSON.parse(configPath);
			for( let k in configPath){
				configPath[k] = cwd() + configPath[k];
			}

			gulp.src(`${_src}js/**/*.js`)
				.pipe(connect.reload())
				.pipe(requirejsOptimize({
					paths: configPath
				}))
				.pipe(gulp.dest(`${_dist}js/`));
		});
	});


	// 清除images
	gulp.task(`${name}:delete`, () => {
		del(imgArr(_dist));
	});
	// images add OR update
	gulp.task(`${name}:img`, () => {
		gulp.src(imgArr(_src))
			// .pipe(imagemin())
			.pipe(connect.reload())
			.pipe(gulp.dest(_dist));
	});


	// html
	gulp.task(`${name}:html`, () => {
		gulp.src(_src + '*.html')
			.pipe(connect.reload())
			.pipe(gulp.dest(_dist));
	});


	// hot refresh
	gulp.task(`${name}:connect`, () => {
		let setPort = gulp.env.port;
		let port = parseInt(9999 * Math.random()); // 随机端口号

		// hot refresh listen
		connect.server({
			// root: 'dist/', // 产出根目录
			root: _dist, // 当前项目产出目录
			port: setPort ? setPort : port,
			livereload: true,
			debug: true
		});

		// open dev
		(!setPort) && setTimeout(()=>{
			opn(`http://localhost:${port}`);
		}, 1000 * 3);
	});


	// 加入watch
	gulp.task(
		`${name}:watch`, () => {
			gulp.watch(`${_src}css/*.scss`, [`${name}:css`]);
			gulp.watch(`${_src}js/**/*.js`, [`${name}:js`]);
			gulp.watch(imgArr(_src), [`${name}:img`]);
			gulp.watch(imgArr(_src), [`${name}:delete`]);
			gulp.watch(`${_src}*.html`, [`${name}:html`]);
		}
	);


	// 注册项目task
	gulp.task(
		name, [
			`${name}:css`,
			`${name}:js`,
			`${name}:img`,
			`${name}:delete`,
			`${name}:html`,

			`${name}:watch`,
			`${name}:connect`
		]
	);
});


// 默认任务
gulp.task('default', () => {
	console.log('nothing task...');
});