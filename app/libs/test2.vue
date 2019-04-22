<script>
import test2 from "./test2";
import Vue from "vue";
Vue.component("test2", test2);
export default {
	props: {
		thekey: 0
	},
	render(c) {
        var _this = this;
        console.log(_this.thekey);
		return c("div", {
			style: {
				color: "blue",
				fontSize: "14px"
			},
			// 普通的 HTML 特性
			attrs: {
				id: "foo",
				
			},
			domProps: {
				innerHTML: _this.thekey
			},
			// 组件 props
			props: {
				myProp: "bar"
			}
		});
	}
};
</script>
