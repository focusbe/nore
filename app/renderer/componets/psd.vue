<template>
	<div>
		<Upload
		 multiple
		 :show-upload-list="false"
		 type="drag"
		 :format="['psd']"
		 :before-upload="upload"
		 action="javascript:void(0)"
		>
			<div style="padding: 20px 0">
				<Icon
				 type="ios-cloud-upload"
				 size="52"
				 style="color: #3399ff"
				></Icon>
				<p>点击或将PSD拖拽到这里上传</p>
			</div>
		</Upload>
	</div>
</template>
<style lang="scss" scoped>
.filelist {
	li {
	}
}
</style>
<script>
import Assets from "libs/assets";
import Tree from "./tree";
import Vue from "vue";
import Configs from "libs/configs";
import Files from "libs/files";
const PSD = require("libs/psd");
import path from "path";
import aRemote from "libs/aremote";
// console.log(aRemote);
// aRemote.require(path.resolve(__dirname,'../../libs/psd.js'));
export default {
	name: "my-psd",
	computed: {},
	props: {
		actname: String
	},
	data() {
		return {
			filepath: "",
			savepath: ""
		};
	},
	created() {
		this.savepath = path.join(
			Configs.getItem("workshop"),
			this.actname,
			"psd"
		);
		this.uploadpath = path.join(
			Configs.getItem("workshop"),
			this.actname,
			"uploads"
		);
		// this.upload({
		// 	path: "C:\\Users\\liupeng\\Desktop\\testpsd\\qiuqiu.psd"
		// });
	},
	methods: {
		async getList() {
			var list = await this.assets.getList();
			// console.log('获取list');
			this.list = list;
		},
		async upload(file) {
			var self = this;
			try {
				// console.log(this.uploadpath);
				var mypsd = new PSD(
					file.path,
					this.uploadpath,
					this.uploadpath
				);
				var res = await mypsd.parse(false, true);
				console.log(res);
			} catch (error) {
				console.error(error);
			}
			self.$emit("finish", res.vnodetree);
			return false;
		}
	}
};
</script>


