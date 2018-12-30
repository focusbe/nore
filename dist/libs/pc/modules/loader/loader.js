/*
* @note: loader加载器
* @author: xiayu chen
* @date: 2017-08-17
*/
define('loader', function (require, exports, module) {
    var $ = require('jquery');
    var LOADER = function (url, params, callback, errcallback) {
        var errcallback = errcallback || $.noop, setting = {
            url: url + "?" + $.param(params),
            cache: false,
            dataType: "jsonp",
            jsonp: params.cb || "callback",
            timeout: 3e4,
            success: function () {
                if (callback && typeof callback == "function") {
                    callback.apply(null, arguments);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                window.console && console.log && console.log(textStatus);
                errcallback();
            }
        };
        $.ajax(setting);
    };
    module.exports = LOADER;
});
