define(function(require, exports, module){
	var $ = require('jquery');
	var LOADER = require('loader');
	var UTILS = require('utils');

	var CONFIG = require('./config');

	var win = window;
	var doc = document;

	var POPUP = (function(){
		var
			$maskbg = $('#J_maskbg'),
			$popup = $('#J_popup'),
			$popupClose = $('.J_popup_close'), // 关闭按钮

			$popupWrap = $('.J_popup_wrap'),
			$popupSign = $('#J_popup_sign'), // 签到弹层
			
			$popupCreate = $('#J_popup_create'), // 角色创建
			$popupAccount = $('.J_popup_account'), // 角色名
			$roleServ = $('.J_role_serv'), // 角色服务器
			$popupBtnNext = $('.J_popup_btn_next'), // 下一步
			$popupServIsed = $('#J_serv_ised'), // 已选服务器名
			$popupReselect = $('.J_popup_reselect'), // 返回重选
			$popupBtnRole = $('.J_popup_btn_role'), // 角色选定
			$popupBtnPGet = $('.J_popup_btn_pget'), // 角色绑定成功

			$roleSel = $('.J_role_sel'), // 角色列表
			$popupCreateRole = $('#J_popup_create_role'), // 角色创建: 角色
			$popupCreateFail = $('#popup_create_fail'), // 角色创建: 失败

			$popupMap = $('#J_popup_map'), // 点亮中国
			$popupLightArea = $('#J_popup_ligth_area'), // 点亮显示区域
			$popupLightBtn = $('.J_popup_btn_mapget'), // 点亮弹层按钮

			$popupPackage = $('#J_popup_package'), // 获得礼包

			$popupInvite = $('#J_popup_invite'), // 邀请好友
			$popupShareUrl = $('#J_popup_shareUrl'), // 分享URL
			$popupBtnShare = $('.J_popup_btn_share'), // 分享按钮

			$btnSidebar = $('.J_btn_sidebar'), // 侧边栏按钮
			$sidebarCont = $('.J_sidebar_cont'), // 侧边栏
			$register = $('#register'), // 注册框
			$sidebarDownload = $('.J_sidebar_download'); // 侧边栏下载

		return {
			init: function(){
				// M站判断
				if( UTILS.device().any() ) win.location.href = './m/?fromid=' + (UTILS.getStr('fromid') || '');

				// 事件绑定
				this.bindEvent();
			},

			// 事件绑定
			bindEvent: function(){
				var self = this;

				// 关闭
				$popupClose.off().on('click', function(){
					self.hide();
				});

				// 侧边栏开启关闭
				$btnSidebar.off().on('click', function(e){
					var _this = $(this),
						_parent = _this.closest('.sidebar'),
						_status = _parent.hasClass('close');

					var w;
					if( _status ){
						w = 281;
						_parent.removeClass('close');
					} else {
						w = 0;
						_parent.addClass('close');
					}

					$sidebarCont.stop().animate({
						width: w
					}, 200);
				});
				$btnSidebar.click();

				// 侧边栏游戏下载
				$sidebarDownload.on('click', function(e){
					console.log('游戏下载');
				});

				// 侧边栏注册
				$register.attr('src', CONFIG.Register);


				// 复制按钮
				$popupBtnShare.off().on('click', function(e){
					console.log('复制');
				});
				
				if( CONFIG.IE7 == false || CONFIG.IE8 ){
					var clipboard = (CONFIG.IE7 == false || CONFIG.IE8) && new Clipboard('.btn_share');
				    (CONFIG.IE7 == false || CONFIG.IE8) && clipboard.off().on('success', function(e) {
				        alert('链接复制成功！请将链接发送给好友！');
				    });
				    (CONFIG.IE7 == false || CONFIG.IE8) && clipboard.off().on('error', function(e) {
				        console.log(e);
				    });
				}
			},

			// 签到弹层
			sign: function(){
				$maskbg.show();
				$popup.show();
				$popupSign.show();
			},

			// 邀请好友
			invite: function( obj ){
				var shareUrl = 'http://' + win.location.hostname + '/act/croles/?fromid=' + obj.fromid;

				if( window.ended ){
					alert('活动结束！');
					return;
				}

				$maskbg.show();
				$popup.show();
				$popupInvite.show();

				$popupShareUrl.val( shareUrl );
				$popupShareUrl.off().on('hover', function(e){
					$(this).select();
				});
			},

			// 点亮中国
			light: function(obj){
				var self = this;

				$maskbg.show();
				$popup.show();
				$popupMap.show();
				$popupLightArea.html( obj.province + '省 ' + obj.city + '市 ' + obj.dist + '区/县' );
				$('#J_have_light').show().html('您已成为 '+ obj.province +'省 '+ obj.city +' '+ obj.dist +'盟主，并已领取盟主礼包');

				$popupLightBtn.off().on('click', function(e){
					self.hide();
				});
			},

			// 创建角色
			role: function( obj ){
				var self = this,
					_isServID, // 已选服务器
					_isRoleID;  // 已选角色

				if( window.ended ){
					alert('活动结束！');
					return;
				}

				$maskbg.show();
				$popup.show();
				$popupCreate.show();
				
				$popupAccount.html( obj.name );
				LOADER(CONFIG.API, {
					a: 'servers'
				}, function(d){
					if( d && d.status && d.status == 1 ){
						if( !d.data ) return;
						var _pushHtml = [];
						for( var _i = 0, _len = d.data.length; _i < _len; ++_i ){
							_pushHtml.push('<option value="'+ d.data[_i].zoneid +'">'+ d.data[_i].zonename +'</option>');
						}
						$roleServ.html( _pushHtml.join('') );				
					}
				});

				// 下一步
				$popupBtnNext.off().on('click', function(e){
					_isServID = $roleServ.val();

					$popupServIsed.html( $roleServ.find('option:selected').text() );
					$popupCreate.hide();
					$popupCreateRole.show();
					$roleSel.html('');

					LOADER(CONFIG.API, {
						a: 'roles',
						serverid: _isServID
					}, function(d){
						if( d && d.status && d.status == 1 ){
							if( !d.data ) return;
							var _pushHtml = [];
							for( var _i = 0, _len = d.data.length; _i < _len; ++_i ){
								_pushHtml.push('<option value="'+ d.data[_i].charid +'">'+ d.data[_i].name +'</option>');
							}
							$roleSel.html( _pushHtml.join('') );
						}
					});
				});

				// 返回重选
				$popupReselect.off().on('click', function(e){
					$popupCreate.show();
					$popupCreateRole.hide();
				});

				// 角色选定
				$popupBtnRole.off().on('click', function(e){
					_isRoleID = $roleSel.val();

					LOADER(CONFIG.API, {
						a: 'bind',
						serverid: _isServID,
						roleid: _isRoleID
					}, function(d){
						if( d && d.status && d.status == 1 ){
							$popupCreateRole.hide();
							$popupPackage.show();
							$('.J_btn_package').addClass('yet'); // 已领取标记

							$popupClose.off().on('click', function(e){
								win.location.reload();
							});
						} else {
							d.msg && alert(d.msg);
						}
					});
				});

				// 角色绑定成功
				$popupBtnPGet.off().on('click', function(e){
					alert('领取成功！');
					win.location.reload();
					// self.hide();
				});
			},

			// 无角色
			norole: function(){
				if( window.ended ){
					alert('活动结束！');
					return;
				}

				$maskbg.show();
				$popup.show();
				$popupCreateFail.show();
			},

			// 登录
			login: function(){
				if (!window.gLogin){
				    $.getScript('http://login.ztgame.com/v2/default/js/scripts/gLogin.js', function(){
				        gLogin.show({url: CONFIG.API + '?a=login'});
				    });
				    return;
				}
				gLogin.show({url: CONFIG.API + '?a=login'});
			},

			// 关闭弹层
			hide: function(){
				$maskbg.hide();
				$popup.hide();
				$popupWrap.hide();
			}
		}
	})();

	$(function(){
		POPUP.init();
	});

	module.exports = POPUP;
});