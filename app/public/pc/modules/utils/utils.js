define('utils', function(require, exports, module){
	module.exports = (function(){
		var win = window;
		var doc = document;
		
		return {
			getStr: function( params ){
	            var reg = new RegExp("(^|&)" + params + "=([^&]*)(&|$)");
	            var r = win.location.search.substr(1).match(reg);
	            if (r != null) return decodeURIComponent(r[2]);
	            return null;
			},

			//设备判断
			device: function(){
				return {
					Android: function(){
						return navigator.userAgent.match(/Android/i) ? true : false;  
					},

					BlackBerry: function(){
						return navigator.userAgent.match(/BlackBerry/i) ? true : false;
					},

					iOS: function(){
						return navigator.userAgent.match(/iPad|iPod|iPhone/i) ? true : false;
					},

					iphone: function(){
						return navigator.userAgent.match(/iPhone/i) ? true : false;
					},

					Windows: function(){
						return navigator.userAgent.match(/IEMobile/i) ? true : false;
					},

					any: function(){
						return (this.Android() || this.BlackBerry()  || this.Windows() || this.iOS());
					}
				}
			}
		}
	})();
});