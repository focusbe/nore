define(function (require, exports, module) {
    var nav = navigator;
    // 测试环境
    // var api = 'http://xx2.web.ztgame.com/act/croles/api.php';
    // var reg = 'http://reg.ztgame.com/fast?alerttype=1&cssurl=f1e80feafceca9e6e32898356009a09b41aa0bb3925990a98457ed5009a3f48cc3d0d3ea0e01d75b65831307515b5f7c17e9c61c074761ff&jsurl=f1e80feafceca9e6e32898356009a09b41aa0bb3925990a98457ed5009a3f48c6ea3d6a4d2f11abc0104d3e1bf973ac24fb139a452159ac2&regtype=normal&source=xx2_site&sign=b331248a43547de8bc8f7fe792fc458b';
    // 生产环境
    // var api = 'http://xx2.ztgame.com/act/croles/api.php';
    // var reg = 'http://reg.ztgame.com/fast?alerttype=1&cssurl=f1e80feafceca9e6789e7cdd1fb9d60283ea295aeb6d5c205734fe5ce7391fcf2b4a41b8340b030448e03b279748eb35a44bfa554a9b925b&jsurl=f1e80feafceca9e6789e7cdd1fb9d60283ea295aeb6d5c205734fe5ce7391fcfdb88378d37493435c5ab5a588ae13c3c&regtype=normal&source=xx2_site&sign=7eb2b5d2de441888f02b6accb51a20f1';
    // 新版注册
    var api = 'api.php';
    var reg = 'http://reg.ztgame.com/fast?alerttype=1&cssurl=f1e80feafceca9e6789e7cdd1fb9d60283ea295aeb6d5c205734fe5ce7391fcf2b4a41b8340b030448e03b279748eb359614070105742aca5e9386e65a7a44ff&jsurl=f1e80feafceca9e6789e7cdd1fb9d60283ea295aeb6d5c205734fe5ce7391fcfdb88378d374934354a267132badccf48b4391a8f7b720bc270fb1a56afef5358&regtype=account&source=xx2_site&sign=c53be1e082a1b9283cac4870c33bd2a7';
    module.exports = (function () {
        return {
            API: api,
            Register: reg,
            IE7: (function () {
                return (nav.appName == "Microsoft Internet Explorer" && nav.appVersion.match(/7./i) == '7.');
            })(),
            IE8: (function () {
                return (nav.appName == "Microsoft Internet Explorer" && nav.appVersion.match(/8./i) == '8.');
            })()
        };
    })();
});
