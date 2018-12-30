/**
 * @note 	征途2手游 《猜巨星》
 * @authors Xiayu Chen (chenxiayu@ztgame.com)
 * @date    2017-09-01
 */
define(function(require, exports, module){
	var $ = require('jquery');
	var UTILS = require('utils');
	var LOADER = require('loader');

	var win = window;
	var doc = document;

	var API = 'http://act.zt2m.ztgame.com/preorder/';
	var API_COUNT = 'http://zt2m.ztgame.com/act/gs/count.php';
	var MEDIA_AUDIO = 'http://videogame.ztgame.com.cn/zt2m/20170623/alayubiubiubiu.mp3';
				
	// M站判断
	if( UTILS.device().any() ) win.location.href = './m';

	var MAIN = (function(){
		var
			$video = $('#video'),

			$btnShareWeibo = $('#btn_share_weibo'), // 微博分享
			$btnHomeurl = $('#btn_homeurl'), // 进入首页
			$btnSubscribe = $('#J_btn_subscribe'), // 我要猜巨星
			$page = $('.J_page'), // 页面
			$btnUnlock = $('.J_btn_unlock'), // 解锁按钮

			$audio = $('#audio'),
			$btnAudio = $('#J_btn_audio'), // 音频按钮

			$maskbg = $('#maskbg'),
			$popup = $('#popup'),
			$popupMsg = $('#popup_msg'),
			$popupClose = $('#J_popup_close'),

			$input_mob = $('#input_mob'), // 手机号
			$input_code_img = $('#input_code_img'), // 图片验证码
			$input_code_sms = $('#input_code_sms'), // 短信验证码
			$btn_code_img = $('#btn_code_img'),
			$btn_code_sms = $('#btn_code_sms'),
			$popup_btn_subscribe = $('#btn_subscribe'),

			setMobCode_flag = true, //防止获取验证码重复点击
			exp_mobile = /^1[3|4|5|7|8]\d{9}$/,

			popupMsgTimer = null,
			PT = '';

		return {
			init: function(){
				// video
				this.video();

				// 页面装置
				this.computed();

				// 事件绑定
				this.bindEvent();
			},

			// video
			video: function(){
				var self = this;
				var playerUrl = 'http://sapi.ztgame.com/site/js/gplayer/gplayer.swf';
				// var videoUrl = 'http://act.zt2m.web.ztgame.com/newbie/assets/video.mp4';
				// var videoUrl = 'http://zt2m.web.ztgame.com/act/gs/video.mp4';
				var videoUrl = 'https://videogame.ztgame.com.cn/zt2m/20170905/daiyanren-150458316963.mp4';

				initVideo();
				function initVideo(){
					var pushHTML;
					var h5HTML = '<video id="playerVideo" preload="preload" loop="loop"><source src="'+ videoUrl +'" type="video/mp4"></video>';
					var flashlHTML ='<OBJECT id=GPLAYER_video0 codeBase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" classid=clsid:d27cdb6e-ae6d-11cf-96b8-444553540000 width=100% align=middle height=100%>\
										<PARAM NAME="_cx" VALUE="25188">\
										<PARAM NAME="_cy" VALUE="14049">\
										<PARAM NAME="FlashVars" VALUE="isDebugShow=false&videoUrl='+ videoUrl +'&getUserComplete=playEnd&flashComplete=playStart&toolbar=false">\
										<PARAM NAME="Movie" VALUE="'+ playerUrl +'">\
										<PARAM NAME="Src" VALUE="'+ playerUrl +'">\
										<PARAM NAME="WMode" VALUE="Opaque">\
										<PARAM NAME="Play" VALUE="0">\
										<PARAM NAME="Loop" VALUE="1">\
										<PARAM NAME="Quality" VALUE="High">\
										<PARAM NAME="SAlign" VALUE="LT">\
										<PARAM NAME="Menu" VALUE="-1">\
										<PARAM NAME="Base" VALUE="">\
										<PARAM NAME="AllowScriptAccess" VALUE="always">\
										<PARAM NAME="Scale" VALUE="NoScale">\
										<PARAM NAME="DeviceFont" VALUE="0">\
										<PARAM NAME="EmbedMovie" VALUE="0">\
										<PARAM NAME="SWRemote" VALUE="">\
										<PARAM NAME="MovieData" VALUE="">\
										<PARAM NAME="SeamlessTabbing" VALUE="1">\
										<PARAM NAME="Profile" VALUE="0">\
										<PARAM NAME="ProfileAddress" VALUE="">\
										<PARAM NAME="ProfilePort" VALUE="0">\
										<PARAM NAME="AllowNetworking" VALUE="all">\
										<PARAM NAME="AllowFullScreen" VALUE="true">\
										<PARAM NAME="AllowFullScreenInteractive" VALUE="false">\
										<PARAM NAME="IsDependent" VALUE="0">\
										<PARAM NAME="BrowserZoom" VALUE="scale">\
										<embed id="GPLAYER_video0" flashvars="setContainerSize=setContainerSize&toolbar=false&videoUrl='+ videoUrl +'&getUserComplete=playEnd&flashComplete=playStart" src="'+ playerUrl +'" quality="high" width="100%" height="100%" name="flashResize" wmode="Opaque" align="middle" allowscriptaccess="always" allowfullscreen="true" type="application/x-shockwave-flash" pluginspage="http://www.adobe.com/go/getflashplayer_cn">\
									</OBJECT>';

					if( self.checkVideo() ){
						if( navigator.appName == "Microsoft Internet Explorer" ){
							pushHTML = flashlHTML;
						} else {
							pushHTML = h5HTML;
							h5Player();
						}
					} else {
						pushHTML = flashlHTML;
					}

					$video.html( pushHTML );
				}

				function h5Player(){
					playVideo(function(){
						doc.getElementById('playerVideo').play();
					});
				}

				function playVideo(callback){
					(function(){
						var arg = arguments;
						try{
							callback && callback();
						}catch(ex){
							setTimeout(function(){
								arg.callee();
							}, 100);
						}
					})();
				}


				// 供AS调用方法
				win['setContainerSize'] = function(){
				}

				win['playStart'] = function(){
					playVideo(function(){
						doc.getElementById('GPLAYER_video0').resumeVideo();
					});
				}

				win['playEnd'] = function(){
					setTimeout(function(){
						playVideo(function(){
							doc.getElementById('GPLAYER_video0').resumeVideo();
						});
					}, 100);
				}
			},

			// 页面装置
			computed: function(){
				var self = this;

				// 广告来源
				if( UTILS.getStr('utm_source') ){
					self.setCookie('pt', UTILS.getStr('utm_source') + '_' + (UTILS.getStr('utm_medium')|| ''))
				}

				// 获取猜想人数
				LOADER(API_COUNT, {}, function(d){
					if( d && d.ret && d.ret == 1 ){
						$('#haveNum').html( d.count );
					}
				});

				// 
			},

			// 事件绑定
			bindEvent: function(){
				var self = this,
					_checkmob = true;
				
				function checkMob(){
					if( !$.trim($input_mob.val()) ){
						alert('请输入手机号!');
						_checkmob = false;
						return;
					}

					if( !exp_mobile.test($.trim($input_mob.val())) ){
						alert('请输入正确手机号!');
						_checkmob = false;
						return;
					}

					if( !$.trim($input_code_img.val()) ){
						alert('请输入图片验证码!');
						_checkmob = false;
						return;
					}

					_checkmob = true;
				}

				$btn_code_img.on('click', function(e){
					$(this).attr('src', API + 'captchas.php?t='+ (new Date().getTime()));
				});

				// 获取短信
				$btn_code_sms.on('click', function(e){
					var _this = $(this),
						reClick = null, //定时器
						reClick_time = 60, //秒
						reClick_index = 1; //

					checkMob();
					if( !_checkmob ) return;

					//重复点击标记
					if (!setMobCode_flag) return;

					//发送手机验证码
					setMobCode_flag = false;
					LOADER(API + 'get_code.php', {
						mobile: $.trim($input_mob.val()),
						captcha: $.trim($input_code_img.val())
					}, function(d){
						if( d && d.status && d.status == 1 ){
							d.msg && alert(d.msg);
							//规定时间内发送手机验证码
							reClick = setInterval(function() {
								if (reClick_index >= reClick_time) {
									setMobCode_flag = true; //可重复发送手机验证码
									_this.html('重新获取');
									clearInterval(reClick);
									return;
								}
								setMobCode_flag = false;
								_this.html((reClick_time - reClick_index) + '秒后重复发送');
								reClick_index++;
							}, 1000);
						} else {
							setMobCode_flag = true;
							d.msg && alert(d.msg);
							return;
						}
					});
				});

				// 提交
				$popup_btn_subscribe.on('click', function(e){
					checkMob();
					if( !_checkmob ) return;

					if( !$.trim($input_code_sms.val()) ){
						alert('请输入短信验证码');
						return;
					}

					LOADER(API + 'submit_v2.php', {
						mobile: $.trim($input_mob.val()),
						code: $.trim($input_code_sms.val()),
						ps: 'zt2m_star',
						pt: self.getCookie('pt'),
						d: ''
					}, function(d){
						if( d && d.status && d.status == 1 ){
							ga('send', 'event', '代言人猜想', '预约成功');
							d.msg_title && alert(d.msg_title);
							$popupClose.click();
						} else {
							d.msg && alert(d.msg);
						}
					});
				});

				// 预约按钮
				$btnSubscribe.on('click', function(e){
					$maskbg.show();
					$popup.show();
					$btn_code_img.attr('src', API + 'captchas.php?t='+ (new Date().getTime()));
				});

				// 微博分享
				$btnShareWeibo.on('click', function(e){
					var title = encodeURIComponent('#征途2手游代言人#情报升级！当红小生代言12经典IP，一个完全不一样的“他”即将亮相！');
					win.open('http://service.weibo.com/share/share.php?url=http://zt2m.ztgame.com/act/gs/&title='+ title +'&appkey=1343713053&searchPic=true');
				});

				// 关闭弹层
				$popupClose.on('click', function(e){
					closePopup();
				});
				$maskbg.on('click', function(e){
					closePopup();
				});

				// 解锁
				$btnUnlock.on('click', function(e){
					var _this = $(this),
						_i = _this.index(),
						_lock = _this.attr('data-lock');

					stopAudio();
					if( _lock ){
						$maskbg.show();
						$popupMsg.show();

						// 2秒自动关闭
						if( popupMsgTimer ) clearTimeout(popupMsgTimer);
						popupMsgTimer = setTimeout(function(){
							$maskbg.hide();
							$popupMsg.hide();
						}, 1000 * 2);

						return;
					}

					$btnUnlock.removeClass('on');
					_this.addClass('on');
					$page.fadeOut(100);
					$page.eq(_i).fadeIn(700);

					$('.w .btn .txt').removeClass('oth_txt');
					switch(_i){
						case 1:
							$('#PlayerID').html('<a href="javascript:;" class="video_btn" id="J_step2_video_btn"></a>');
							break;
						case 2:
							$('.w .btn .txt').addClass('oth_txt');
							break;
					}
				});
				$btnUnlock.eq(2).click();


				function closePopup(){
					if( popupMsgTimer ) clearTimeout(popupMsgTimer);
					$maskbg.hide();
					$popup.hide();
					$popupMsg.hide();
				}


				// step2 视频按钮
				$('body').on('click', '#J_step2_video_btn', function(e){
					var _vUlr = 'https://videogame.ztgame.com.cn/zt2m/20170914/daiyanren2-15053510674.mp4';

					if( self.checkVideo() ){
						$('#PlayerID').html('<video width="100%" height="100%" controls="controls" src="'+_vUlr+'" autoplay="autoplay"></video>');
					} else {
						var ply = new SWFObject('images/player.swf', 'step2video', '100%', '100%', '6.0.65', '#000000');
						ply.addParam('allowfullscreen', 'true');
						ply.addParam('allowscriptaccess', 'always');
						ply.addParam('wmode', 'opaque');
						ply.addParam('quality', 'high');
						ply.addParam('salign', 'lt');

						//片源地址,多个视频用'|'分割
						ply.addVariable('file', _vUlr);
						
						//默认海报图片
						// ply.addVariable('img', 'start.jpg');

						//自动播放
						ply.addVariable('autoplay', 'true'); 

						//播放器容器ID
						ply.write('PlayerID');
					}
				});


				// step3 音频按钮
				var setAudio = self.player({
						dom: $audio,
						src: MEDIA_AUDIO
					}),
					_t = null;

				// 播放按钮
				$btnAudio.on('click', function(e){
					var _this = $(this),
						_play = _this.attr('data-play');

					if( _play ){
						_t && clearInterval(_t);
						_this.attr('data-play', '');
						stopAudio();
					}

					else {
						var _i = 1;
						_t = setInterval(function(){
							if( _i > 3 ) _i = 1;
							_this.find('.ico').removeClass('ico1').removeClass('ico2').removeClass('ico3');
							_this.find('.ico').addClass('ico'+_i);
							_i++;
						}, 240);
						_this.attr('data-play', 'true');
						setAudio[0].play();
					}
				});

				// 播放完毕
				setAudio && setAudio.bind('timeupdate', function(){
					if( (setAudio[0].currentTime / setAudio[0].duration) == 1 ){
						stopAudio();
					}
				});

				// 停止播放
				function stopAudio(){
					setAudio && setAudio[0].pause();
					$btnAudio.attr('data-play', '');
					$btnAudio.find('.ico').removeClass('ico1').removeClass('ico2').removeClass('ico3');
					_t && clearInterval(_t);
				}
			},

			//获取cookie	
			getCookie: function(name) {
				var str = "; " + document.cookie + "; ",
					index = str.indexOf("; " + name + "=");
				if (index != -1) {
					var tempStr = str.substring(index + name.length + 3, str.length),
						target = tempStr.substring(0, tempStr.indexOf("; "));

					return decodeURIComponent(target);
				}
				return null;
			},

			/*
			 * set cookie
			 * @params : cookie name, value, time
			 */
			setCookie: function(c_name, value, expiredays) {
				var exdate = new Date();
				exdate.setDate(exdate.getDate() + expiredays);
				document.cookie =  c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + ';path=/';
			},

			// 检测HTML VIDEO
			checkVideo: function(){
	            if (!!document.createElement('video').canPlayType) {
	                var vidTest = document.createElement("video");
	                var oggTest = vidTest.canPlayType('video/ogg; codecs="theora, vorbis"');
	                if (!oggTest) {
	                    var h264Test = vidTest.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	                    if (!h264Test) {
	                        return false;
	                    } else {
	                        if (h264Test == "probably") {
	                            return true;
	                        } else {
	                            return false;
	                        }
	                    }
	                } else {
	                    if (oggTest == "probably") {
	                        return true;
	                    } else {
	                        return false;
	                    }
	                }
	            } else {
	                return false;
	            }
			},

			// player
			player: function( obj ){
				var navigator = win.navigator,
					obj = obj || {},
					playID = 'player_' + (new Date().getTime());

				// IE内核浏览器
				if ( navigator.userAgent.indexOf('MSIE') >= 0 ){
					var str = '<embed id="'+ playID +'" src="'+ obj['src'] +'" type="audio/mp3" autostart="false" loop="true" hidden="true"></embed>';
					if ( obj['dom'].find('embed').length <= 0 ) obj['dom'].append( str );
					doc.getElementById(playID).volume = 100;
				}

				// 非IE内核浏览器
				else {
					var strAudio = '<audio id="'+ playID +'" src="'+ obj['src'] +'" hidden="true">';
					if ( obj['dom'].find('audio').length <= 0 ) obj['dom'].append( strAudio );
				}

				return $('#' + playID);
			}
		}
	})();

	$(function(){
		MAIN.init();
	});
});