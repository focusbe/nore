/**
 * @note 	仙侠2 《国风有仙气》
 * @authors Xiayu Chen (chenxiayu@ztgame.com)
 * @date    2017-08-24
 */
define(function(require, exports, module){
	var $ = require('jquery');
	var LOADER = require('loader');
	var UTILS = require('utils');

	var win = window;
	var doc = document;

	// 测试环境
	// var API = 'http://xx2.web.ztgame.com/act/guofeng/api.php';
	// var REGURL = 'http://reg.ztgame.com/fast?alerttype=1&cssurl=f1e80feafceca9e6e32898356009a09b41aa0bb3925990a97b78bf5828ff1ee7b997ed6f48cae24bb3e8217ec8c37bfab5f789a0ab97d98b&jsurl=f1e80feafceca9e6e32898356009a09b41aa0bb3925990a97b78bf5828ff1ee703752fdff4d3ea5465831307515b5f7c9cb069b0d521b236&regtype=normal&source=xx2_site&sign=b292c55857fb5f25fe828a2d12fc8076';

	// 生产环境
	// var API = 'http://xx2.ztgame.com/act/guofeng/api.php';
	// var REGURL = 'http://reg.ztgame.com/fast?alerttype=1&cssurl=f1e80feafceca9e6789e7cdd1fb9d602630db7f52393c42e69c7629735a588f8553cfc489f5739e521ec95d37614af0d&jsurl=f1e80feafceca9e6789e7cdd1fb9d60283ea295aeb6d5c2035630dfe30b9e01e9b47b1ac256a1d451957d2c4e23645cc21ec95d37614af0d&regtype=normal&source=xx2_site&sign=cc8d37acdcf1679b370d7fe8fffa19cc';

	// 新版注册
	var API = 'http://xx2.ztgame.com/act/guofeng/api.php';
	var REGURL = 'http://reg.ztgame.com/fast?alerttype=1&cssurl=f1e80feafceca9e6789e7cdd1fb9d60283ea295aeb6d5c2035630dfe30b9e01ec3eaa383df175ef1616006f80de60b52f5393d6830d181edb5737c6f3ba1961a&jsurl=f1e80feafceca9e6789e7cdd1fb9d60283ea295aeb6d5c2035630dfe30b9e01e9b47b1ac256a1d451957d2c4e23645cc4a80fb0670f35c0b7d2fe1085b5e0860&regtype=account&source=xx2_site&sign=af1fe77a656dad5a0c138329b3e9e78b';

	var MAIN = (function(){
		var
			$btnReg = $('#btn_reg'), // 页面: 注册按钮

			$player = $('#player'), // 参赛者列表
			$playerRefresh = $('#player_refresh'), // 换一批
			$playerPopup = $('#player_popup'), // 查看大图
			$playerPic = $('#player_pic'), // 大图地址
			$playerClose = $('#player_close'), // 关闭查看大图弹层
			$goToTop = $('#gototop'), // 返回顶部

			$maskbg = $('#maskbg'),
			$popup = $('#popup'),
			$regIframe = $('#reg_iframe'),
			$popupReg = $('#popup_reg'), // 弹层: 注册
			$popupSuc = $('#popup_suc'), // 弹层: 注册成功
			$popupAccount = $('#popup_account'), // 弹层: 注册帐号
			$popupBtnClose = $('.J_popup_btn_close'); // 弹层: 关闭

		return {
			init: function(){
				// M站判断
				if( UTILS.device().any() ) win.location.href = './m';

				// 页面装置
				this.computed();

				// 事件绑定
				this.bindEvent();

				// 注册成功
				this.regSuccess();
			},

			// 页面装置
			computed: function(){
				var
					self = this,
					pushHtml = [];

				$.ajax({
					url: API + '?limit=10&callback=cb&t='+ ( new Date().getTime() ),
					type: 'get',
					dataType: 'jsonp',
					success: function(d){
						if( d && d.status && d.status == 1 ){
							for( var _i = 0, _len = d.list.length; _i < _len ; ++_i ){
								pushHtml.push('\
									<li>\
										<span class="photo">\
											<a href="javascript:;" class="J_player_big" data-big="'+ d.list[_i].pic +'" data-id="'+ d.list[_i].id +'" target="_blank">\
												<img src="'+ d.list[_i].img +'" alt="" />\
											</a>\
										</span>\
										<span class="name">\
											<em>'+ d.list[_i].name +'</em> <a href="'+ d.list[_i].wburl +'" target="_blank">'+ d.list[_i].wbname +'</a>\
										</span>\
									</li>\
								');
							}

							$player.html( pushHtml.join('') );						
						} else {
							d.msg && alert(d.msg);
						}
					}
				});

				// LOADER(API, {
				// 	limit: 10
				// }, function(d){

				// });
			},

			// 事件绑定
			bindEvent: function(){
				var self = this;

				// 参赛者查看大图
				$('body').on('click', '.J_player_big', function(e){
					var _this = $(this),
						_id = _this.attr('data-id'),
						_pic = _this.attr('data-big');

					$playerPopup.show();
					$playerPic.attr('src', _pic);
				});

				// 关闭大图弹层
				$playerClose.on('click', function(e){
					$playerPopup.hide();
				});
				$playerPopup.find('.opacity').on('click', function(e){
					$playerPopup.hide();
				});

				// 换一批
				$playerRefresh.on('click', function(e){
					self.computed();
				});

				// 返回顶部
				$goToTop.on('click', function(e){
					$('body,html').stop().animate({ scrollTop: 0 });
				});

				// 注册弹层
				$btnReg.on('click', function(e){
					$maskbg.show();
					$popup.show();
					$popupReg.show();
					$regIframe.attr('src', REGURL);
					$popupSuc.hide();
				});

				// 关闭注册弹层
				$popupBtnClose.on('click', function(e){
					$maskbg.hide();
					$popup.hide();
					$popupReg.hide();
					$popupSuc.hide();
				});
			},

			// 注册成功
			regSuccess: function(){
				win.regsuccess = function(account){
					$maskbg.show();
					$popup.show();
					$popupReg.hide();
					$popupSuc.show();

					$regIframe.attr('src', '');
					account && $popupAccount.html(account);
				};
			}
		}
	})();

	$(function(){
		MAIN.init();
	});
});