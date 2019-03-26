<template>
	<div class="asset_wrap">
		<my-tree
		 class="filelist"
		 :list="list"
		></my-tree>
		<div class="upload_btns">
			<Upload
			 multiple
			 :show-upload-list="false"
			 type="drag"
			 accept="image/gif, image/jpeg, image/png,video/*,audio/mpeg"
			 :before-upload="upload"
			 action="javascript:void(0)"
			>
				<div>
					上传图片，视频，音频
				</div>
			</Upload>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.asset_wrap{
	position: relative;
}
.filelist {
	overflow: auto;
	padding-bottom: 30px;
	li {

	}
}
.upload_btns {
	position: absolute;
	bottom: 0;
	width: 100%;
	line-height: 30px;
}
</style>
<script>
import Assets from "libs/assets";
import Tree from "./tree";
import Vue from "vue";
Vue.component("my-tree", Tree);
export default {
	name: "assets",
	computed: {},
	props: {
		actname: String
	},
	data() {
		return {
			list: {}
		};
	},
	created() {
		this.assets = new Assets(this.actname);
		this.getList();
	},
	methods: {
		async getList() {
			var list = await this.assets.getList();
			// console.log('获取list');
			console.log(list);
			this.list = list;
		},
		async upload(file) {
			try {
				var res = await this.assets.upload(file.path);
				if (res) {
					alert("上传成功");
				}
				await this.getList();
			} catch (error) {
				var msg;
				if (typeof error == "object") {
					msg = error.msg | error.message | "未知错误";
				}
				msg = error;
				alert(msg);
			}
			return false;
		},
		async uploadVideo() {}
	}
};
</script>


