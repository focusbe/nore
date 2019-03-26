<script>
import test2 from "./test2";
import Vue from "vue";
Vue.component("test2", test2);
export default {
	data: function() {
		return {
			chils: [1, 2]
		}
    },
    created(){
        this.chils = [3, 4]
    },
	render(c) {
		var _this = this;
		return c(
			"div",
			{
				style: {
					color: "red",
					fontSize: "14px"
				},
				// 普通的 HTML 特性
				attrs: {
					id: "foo"
				},
				// 组件 props
				props: {
					myProp: "bar"
				}
			},
			_this.chils.map(function(currentValue, index, arr) {
				return c("test2", {
					props: {
						thekey: currentValue
					}
				});
			})
		);
	}
};
</script>
