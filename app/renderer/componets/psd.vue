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
const PSD = require("psd");
import path from "path";

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
			// try {
			var psd = await PSD.open(file.path);
			var res = await Files.createdirAsync(this.savepath);
			if (res) {
				await psd.image.saveAsPng(
					path.resolve(this.savepath, "./design.png")
				);
				await this.$emit('savedesign');
				var psdtree = psd.tree();
				window.psdtree = psdtree;
				var vnodetree = [{ view: "container", childrens: [] }];
				vnodetree[0].styles = {
					width: psdtree.get("width"),
					height: psdtree.get("height"),
					x: 0,
					y: 0
				};
				psdtree.styles = vnodetree[0].styles;
				var saveimgPool = [];
				console.log(vnodetree);
				function savetoimg(children, curtree) {
					let curnode, curview, imgname;
					for (var i in children) {
						curnode = children[i];
						curview = {};
						if (!curnode || !curnode.visible()) {
							continue;
						}
						curview.styles = {
							width: curnode.get("width"),
							height: curnode.get("height"),
							x: curnode.get("left") - curnode.parent.styles.x,
							y: curnode.get("top") - curnode.parent.styles.y,
							position:'absolute'
						};
						
						curview.name = curnode.name;
						curnode.styles = curview.styles;
						if (curnode.type == "group") {
							curview.view = "container";
							if (!!curnode.children()) {
								curview.childrens = [];
								savetoimg(
									curnode.children(),
									curview.childrens
								);
							}
						} else if (curnode.type == "layer") {
							curview.view = "image";
							imgname = curnode.path().replace(/\//g, "_");
							saveimgPool.push({
								image: curnode.layer.image,
								path: path.resolve(
									self.uploadpath,
									imgname + ".png"
								)
							});
							curview.props = {img:path.resolve(
									self.uploadpath,
									imgname + ".png")}
						}
						curtree.push(curview);
					}
				}
				savetoimg(psdtree.children(), vnodetree[0]["childrens"]);
				console.log(vnodetree);
				// await this.$emit('vnodetreefrompsd',vnodetree);
				function saveimg(i, callback, onsuccess, onerror) {
					if (!!saveimgPool) {
						saveimgPool[i]["image"]
							.saveAsPng(saveimgPool[i]["path"])
							.then(function() {
								if (!!onsuccess) {
									onsuccess(i);
								}

								if (i >= saveimgPool.length - 1) {
									callback(true);
								} else {
									i++;
									saveimg(i, callback);
								}
							})
							.catch(function() {
								// console.log(saveimgPool[i]["path"]+'保存失败');
								if (!!onerror) {
									onerror(i);
								}
								if (i >= saveimgPool.length - 1) {
									callback(true);
								} else {
									saveimg(i++, callback);
								}
							});
					}
					return true;
				}
				self.$emit('finish',vnodetree);
				// saveimg(0, function(res) {
				// 	self.$emit('finish',vnodetree);
				// });
			}
			// } catch (error) {
			// 	console.error(error);
			// 	// var msg;
			// 	// if (typeof error == "object") {
			// 	// 	msg = error.msg | error.message | "未知错误";
			// 	// }
			// 	// msg = error;
			// 	// alert(msg);
			// }
			return false;
		}
	}
};
</script>


