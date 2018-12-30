define(function (require, exports, module) {
    var $ = require('jquery');
    var LOADER = require('loader');
    var UTILS = require('utils');
    var POPUP = require('./popup');
    var CONFIG = require('./config');
    var win = window;
    var doc = document;
    var INFO = '';
    var CREATE = (function () {
        var $btnBack = $('#J_btn_back'), // 返回活动首页
        $account = $('#J_account'), // 帐号
        $accountRole = $('#J_account_role'), // 游戏角色
        $accountServer = $('#J_account_server'), // 游戏服务器
        $accountBtn = $('.J_account_btn'), // 申请盟主礼包按钮 
        $btnLogout = $('.J_btn_logout'), // 退出登录
        $signNum = $('#J_sign_num'), // 签到次数
        $accountType = $('#J_account_type'), // 职业
        $btnPackage = $('.J_btn_package'), // 领取礼包
        $btnBox = $('.J_btn_box'), // 签到领取宝箱
        $mypackage = $('#J_mypackage'), // 我的礼包清单
        $creteList = $('.J_crete_list'), // 列表
        $btnInvite = $('.J_btn_invite'), // 邀请好友
        $compliteCreteList = $('#J_complite_crete_list'), // 集齐5件
        $btnMap = $('.J_btn_map'), // 点亮中国
        fromid = UTILS.getStr('fromid') || '';
        return {
            init: function () {
                // 页面装置
                this.computed();
                // 事件绑定
                this.bindEvent();
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
                        // 未登录
                        if (!INFO.showaccount || $.isEmptyObject(INFO.user)) {
                            win.location.href = 'index.html';
                            return;
                        }
                        $signNum.html(d.scount);
                        $account.html(d.user.showaccount);
                        $accountRole.html(d.user.rolename);
                        $accountServer.html(d.user.servername);
                        $accountType.html(d.user.roletypename);
                        // 已领取
                        if (!$.isEmptyObject(INFO.user)) {
                            // 礼包清单
                            $mypackage.find('li:eq(0)').addClass('yet');
                            // 第壹 礼包
                            $btnPackage.addClass('yet');
                        }
                        // 已签到
                        if (INFO.signin) {
                            $btnBox.addClass('yet');
                        }
                        // 已邀请
                        if (INFO.icount != 'undefined' && INFO.icount) {
                            for (var _i = 0, _len = INFO.icount; _i < _len; ++_i) {
                                // 礼包清单
                                $mypackage.find('li:eq(' + (_i + 1) + ')').addClass('yet');
                                // 领取按钮
                                $creteList.eq(_i).find('.btn_get').addClass('yet');
                                // 集齐5件状态
                                $compliteCreteList.find('li:eq(' + (_i + 1) + ')').addClass('yet');
                            }
                            if (INFO.icount >= 4) {
                                // 礼包清单
                                $mypackage.find('li:eq(5)').addClass('yet');
                                // 集齐5件状态
                                $compliteCreteList.find('li:eq(5)').addClass('yet');
                            }
                        }
                        // 已点亮
                        if (INFO.haslight != 'undefined' && INFO.haslight) {
                            // 礼包清单
                            $mypackage.find('li:eq(6)').addClass('yet');
                            $btnMap.addClass('yet');
                        }
                    }
                });
            },
            // 事件绑定
            bindEvent: function () {
                var self = this;
                // 退出登录
                $btnLogout.on('click', function (e) {
                    LOADER(CONFIG.API, {
                        a: 'logout'
                    }, function (d) {
                        if (d && d.status && d.status == 1) {
                            win.location.reload();
                        }
                    });
                });
                // 申请盟主礼包按钮
                $accountBtn.on('click', function (e) {
                    console.log('申请盟主礼包');
                });
                // 返回活动首页
                $btnBack.on('click', function (e) {
                    win.location.href = 'index.html';
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
                    if (_yet) {
                        alert('您今日已经领取了签到奖励，请明日再来！');
                        return;
                    }
                    if (!INFO.showaccount) {
                        POPUP.sign();
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
                            $signNum.html(parseInt($signNum.html()) + 1);
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
                    var _this = $(this), _yet = _this.hasClass('yet');
                    if (!_yet) {
                        POPUP.invite({
                            fromid: INFO.fromid
                        });
                    }
                });
                // 点亮中国
                $btnMap.on('click', function (e) {
                    win.location.href = 'index.html#chinamap';
                });
            }
        };
    })();
    $(function () {
        CREATE.init();
    });
});
