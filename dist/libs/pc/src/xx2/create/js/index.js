define(function (require, exports, module) {
    var $ = require('jquery');
    var LOADER = require('loader');
    var vectorMap = require('vectorMap');
    var vectorZh = require('vectorZh');
    var UTILS = require('utils');
    var areaThree = require('areaThree');
    var POPUP = require('./popup');
    var CONFIG = require('./config');
    var win = window;
    var doc = document;
    var INFO = '';
    var INDEX = (function () {
        var $btnPagestatus = $('.J_btn_pagestatus'), // 顶部登录、领取奖励
        $btnPackage = $('.J_btn_package'), // 登录领奖励
        $btnBox = $('.J_btn_box'), // 签到领取宝箱
        $pageShareUrl = $('#pageShareUrl'), // 分享地址
        $btnInvite = $('.J_btn_invite'), // 邀请好友
        $inviteList = $('.J_invite_list'), // 邀请好友列表
        $chinaMap = $('#chinamap'), // 地图容器
        $btnMap = $('.J_btn_map'), // 点亮中国按钮
        $haveLightNum = $('#J_have_light_num'), // 点亮总人数
        $yetLight = $('.J_yet_light'), // 已点亮需隐藏
        // 已登录
        $login = $('#J_login'), $loginNickname = $('#J_login_nickname'), $logout = $('#J_logout'), fromid = UTILS.getStr('fromid') || '';
        return {
            init: function () {
                // 页面装置
                this.computed();
                // 事件绑定
                this.bindEvent();
                // chinamap
                this.chinamap();
            },
            // 页面装置
            computed: function () {
                var self = this;
                LOADER(CONFIG.API, {
                    fromid: fromid
                }, function (d) {
                    window.ended = d.ended;
                    if (d && d.status && d.status == 1) {
                        INFO = d;
                        // 顶部已登录
                        if (INFO.showaccount) {
                            $btnPagestatus.addClass('yet');
                            $login.show();
                            $loginNickname.html(INFO.showaccount);
                            if (INFO.hasrole != 'undefined' && !INFO.hasrole && $.isEmptyObject(INFO.user)) {
                                POPUP.norole();
                            }
                        }
                        // 已领取
                        if (!$.isEmptyObject(INFO.user)) {
                            $btnPackage.addClass('yet');
                        }
                        // 已签到
                        if (INFO.signin) {
                            $btnBox.addClass('yet');
                        }
                        // 已邀请
                        if (INFO.icount != 'undefined' && INFO.icount) {
                            for (var _i = 1, _len = INFO.icount; _i <= _len; ++_i) {
                                $inviteList.find('.item:eq(' + (_i - 1) + ')').addClass('yet');
                            }
                        }
                        // 已点亮
                        if (INFO.haslight != 'undefined' && INFO.haslight) {
                            $yetLight.hide();
                            $btnMap.addClass('yet');
                            $('#J_have_light').show().html('您已成为 ' + INFO.user.province + '省 ' + INFO.user.city + ' ' + INFO.user.dist + '盟主，并已领取盟主礼包');
                        }
                        // 自发弹绑定
                        if (INFO.showaccount && INFO.hasrole != 'undefined' && INFO.hasrole && $.isEmptyObject(INFO.user)) {
                            POPUP.role({
                                name: INFO.showaccount
                            });
                        }
                        // 邀请好友4弹层
                        if (!$.isEmptyObject(INFO.awards)) {
                            for (var t = 0, len = INFO.awards.length; t < len; ++t) {
                                $('#J_maskbg').show();
                                $('.J_popup_invite_package[data-pw="' + INFO.awards[t] + '"]').show().find('.J_popup_invite_get, .J_popup_invite_close').attr('data-mask', t);
                            }
                            // 确认领取并关闭
                            $('.J_popup_invite_get').on('click', function (e) {
                                var _this = $(this), _tid = _this.attr('data-id'), _ismask = _this.attr('data-mask');
                                // 通知领取
                                LOADER(CONFIG.API, {
                                    a: 'award',
                                    id: _tid
                                }, function (d) {
                                    if (d && d.status && d.status == 1) {
                                        (_ismask == 0) && $('#J_maskbg').hide();
                                        $('.J_popup_invite_package[data-pw="' + _tid + '"]').hide();
                                    }
                                });
                            });
                            // 关闭
                            $('.J_popup_invite_close').on('click', function (e) {
                                var _this = $(this), _tid = _this.attr('data-id'), _ismask = _this.attr('data-mask');
                                (_ismask == 0) && $('#J_maskbg').hide();
                                $('.J_popup_invite_package[data-pw="' + _tid + '"]').hide();
                            });
                        }
                        // 配置页面分享链接
                        $pageShareUrl.val('http://xx2.ztgame.com/act/croles/' + (INFO.fromid ? '?fromid=' + INFO.fromid : ''));
                        $pageShareUrl.off().on('hover', function (e) {
                            $(this).select();
                        });
                        if (CONFIG.IE7 == false || CONFIG.IE8) {
                            var clipboard = (CONFIG.IE7 == false || CONFIG.IE8) && new Clipboard('.J_page_btn');
                            (CONFIG.IE7 == false || CONFIG.IE8) && clipboard.off().on('success', function (e) {
                                alert('链接复制成功！请将链接发送给好友！');
                            });
                            (CONFIG.IE7 == false || CONFIG.IE8) && clipboard.off().on('error', function (e) {
                                console.log(e);
                            });
                        }
                        if (INFO.showaccount && !$.isEmptyObject(INFO.user)) {
                            $('.copy_info').show();
                        }
                    }
                });
            },
            // 事件绑定
            bindEvent: function () {
                var self = this;
                // 顶部登录、领取奖励
                $btnPagestatus.on('click', function (e) {
                    var _this = $(this), _yet = _this.hasClass('yet');
                    if (!_yet) {
                        POPUP.login();
                        return;
                    }
                    if ($.isEmptyObject(INFO.user)) {
                        if (!INFO.hasrole) {
                            POPUP.norole();
                            return;
                        }
                        POPUP.role({
                            name: INFO.showaccount
                        });
                        return;
                    }
                    win.location.href = 'create.html?fromid=' + fromid;
                });
                // 退出登录
                $logout.off().on('click', function (e) {
                    LOADER(CONFIG.API, {
                        a: 'logout',
                        t: (new Date().getTime())
                    }, function (d) {
                        if (d && d.status && d.status == 1) {
                            win.location.reload();
                        }
                    });
                });
                // 登录领奖励
                $btnPackage.on('click', function (e) {
                    var _this = $(this), _yet = _this.hasClass('yet');
                    if (_yet)
                        return;
                    if (!INFO.showaccount) {
                        POPUP.login();
                        return;
                    }
                    if ($.isEmptyObject(INFO.user)) {
                        if (!INFO.hasrole) {
                            POPUP.norole();
                            return;
                        }
                        POPUP.role({
                            name: INFO.showaccount
                        });
                        return;
                    }
                });
                // 签到领取宝箱
                $btnBox.on('click', function (e) {
                    var _this = $(this), _yet = _this.hasClass('yet');
                    if (_yet)
                        return;
                    if (!INFO.showaccount) {
                        POPUP.login();
                        return;
                    }
                    if ($.isEmptyObject(INFO.user)) {
                        if (!INFO.hasrole) {
                            POPUP.norole();
                            return;
                        }
                        POPUP.role({
                            name: INFO.showaccount
                        });
                        return;
                    }
                    LOADER(CONFIG.API, {
                        a: 'signin'
                    }, function (d) {
                        if (d && d.status && d.status == 1) {
                            _this.addClass('yet');
                            POPUP.sign();
                        }
                        else if (d.status == -9) {
                            POPUP.login();
                        }
                        else {
                            d.msg && alert(d.msg);
                        }
                    });
                });
                // 邀请好友
                $btnInvite.on('click', function (e) {
                    var _this = $(this), _yet = _this.closest('li').hasClass('yet');
                    if (!INFO.showaccount) {
                        POPUP.login();
                        return;
                    }
                    if (!_yet) {
                        POPUP.invite({
                            fromid: INFO.fromid || ''
                        });
                    }
                });
                // 点亮中国按钮
                $btnMap.on('click', function (e) {
                    var _this = $(this), _yet = _this.hasClass('yet'), _province = $('#cmbProvince'), _city = $('#cmbCity'), _dist = $('#cmbArea');
                    if (!INFO.showaccount) {
                        POPUP.login();
                        return;
                    }
                    if (_yet)
                        return;
                    LOADER(CONFIG.API, {
                        a: 'light',
                        province: _province.val(),
                        city: _city.val(),
                        dist: _dist.val()
                    }, function (d) {
                        if (d && d.status && d.status == 1) {
                            _this.addClass('yet');
                            $yetLight.hide();
                            POPUP.light({
                                province: _province.val(),
                                city: _city.val(),
                                dist: _dist.val()
                            });
                        }
                        else {
                            d.msg && alert(d.msg);
                        }
                    });
                });
            },
            // chinamap
            chinamap: function () {
                var bgArr = ['#F7A1C6', '#F377AC', '#EA4F91', '#EE2078'];
                var dataStatus = [
                    { cha: 'HKG', name: '香港' },
                    { cha: 'HAI', name: '海南' },
                    { cha: 'YUN', name: '云南' },
                    { cha: 'BEJ', name: '北京' },
                    { cha: 'TAJ', name: '天津' },
                    { cha: 'XIN', name: '新疆' },
                    { cha: 'TIB', name: '西藏' },
                    { cha: 'QIH', name: '青海' },
                    { cha: 'GAN', name: '甘肃' },
                    { cha: 'NMG', name: '内蒙古' },
                    { cha: 'NXA', name: '宁夏' },
                    { cha: 'SHX', name: '山西' },
                    { cha: 'LIA', name: '辽宁' },
                    { cha: 'JIL', name: '吉林' },
                    { cha: 'HLJ', name: '黑龙江' },
                    { cha: 'HEB', name: '河北' },
                    { cha: 'SHD', name: '山东' },
                    { cha: 'HEN', name: '河南' },
                    { cha: 'SHA', name: '陕西' },
                    { cha: 'SCH', name: '四川' },
                    { cha: 'CHQ', name: '重庆' },
                    { cha: 'HUB', name: '湖北' },
                    { cha: 'ANH', name: '安徽' },
                    { cha: 'JSU', name: '江苏' },
                    { cha: 'SHH', name: '上海' },
                    { cha: 'ZHJ', name: '浙江' },
                    { cha: 'FUJ', name: '福建' },
                    { cha: 'TAI', name: '台湾' },
                    { cha: 'JXI', name: '江西' },
                    { cha: 'HUN', name: '湖南' },
                    { cha: 'GUI', name: '贵州' },
                    { cha: 'GXI', name: '广西' },
                    { cha: 'GUD', name: '广东' },
                    { cha: 'MAC', name: '澳门' }
                ];
                // 读取全国各地数据
                LOADER(CONFIG.API, {
                    a: 'lcount'
                }, function (d) {
                    if (d && d.status && d.status == 1) {
                        // 总人数
                        var _ln = d.total || 0;
                        var _lhPush = [];
                        _ln = (_ln.toString()).split("");
                        for (var _i = 0, _len = _ln.length; _i < _len; ++_i) {
                            _lhPush.push('<em class="num">' + _ln[_i] + '</em>');
                        }
                        $haveLightNum.html(_lhPush.join(''));
                        for (var _i = 0, _len = d.data.length; _i < _len; ++_i) {
                            for (var _j = 0, _jlen = dataStatus.length; _j < _jlen; ++_j) {
                                if (d.data[_i].prov == dataStatus[_j].name) {
                                    dataStatus[_j].count = d.data[_i].count;
                                    dataStatus[_j].level = d.data[_i].level;
                                    dataStatus[_j].prompt = '已有' + d.data[_i].count + '位玩家成为盟主';
                                }
                            }
                        }
                        // 地图初始化
                        $chinaMap.vectorMap({
                            map: 'china_zh',
                            // 地图颜色
                            color: '#FEF9E0',
                            // 动态显示内容
                            onLabelShow: function (event, label, code) {
                                $.each(dataStatus, function (i, items) {
                                    if (code == items.cha) {
                                        var pushHtml = '<em class="area">' + items.name + '</em><p class="line"></p><p class="p_txt">' + items.prompt + '</p><i class="arr"></i>';
                                        label.html(pushHtml);
                                    }
                                });
                            }
                        });
                        // 地图分量显示
                        $.each(dataStatus, function (i, items) {
                            if (items.level) {
                                var setStr = '{"' + items.cha + '":"' + bgArr[items.level - 1] + '"}';
                                $chinaMap.vectorMap('set', 'colors', eval('(' + setStr + ')'));
                            }
                        });
                        // $('circle').bind('mousemove', function(e){
                        //     $('.jvectormap-label').show().css({
                        //         left: e.clientX,
                        //         top: e.clientY
                        //     }).html($(this).attr('data-cnname'))
                        // });
                    }
                });
                // 三级城市初始化
                LOADER(CONFIG.API, {
                    a: 'ip2area'
                }, function (d) {
                    if (d && d.status && d.status == 1) {
                        areaThree('cmbProvince', 'cmbCity', 'cmbArea', d.province, d.city, d.district);
                    }
                });
            }
        };
    })();
    $(function () {
        INDEX.init();
    });
});
