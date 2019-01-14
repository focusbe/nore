<template>
	<div>
		<Upload multiple :show-upload-list="false" type="drag" :before-upload="upload" action="javascript:void(0)">
			<div style="padding: 20px 0">
				<Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
				<p>点击或将文件拖拽到这里上传</p>
			</div>
		</Upload>
		<my-tree class="filelist" :list="list"></my-tree>
	</div>
</template>
<style lang="scss" scoped>
	.filelist{
		max-height: 200px;
		overflow: auto;
		li{
			
		}
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
			this.list = list;
		},
		async upload(file){
			console.log(file);
			try {
				var res = await this.assets.upload(file.path);
				if(res){
					alert('上传成功');
				}
				await this.getList();
			} catch (error) {
				var msg;
				if(typeof error == 'object'){
					msg = error.msg|error.message|"未知错误"
				}
				msg = error;
				alert(msg);
			}
			return false;
		}
	}
};
</script>


