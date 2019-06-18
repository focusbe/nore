<template>
	<div class="psduploader">
		<Upload
			multiple
			:show-upload-list="false"
			type="drag"
			:format="['psd']"
			:before-upload="upload"
			action="javascript:void(0)"
		>
			<Button>PSD</Button>
		</Upload>

		<Modal v-model="isparse" title="PSD解析中" :mask-closable="false" :closable="false">
			<Progress :percent="percent.value"/>
			<p>{{percent.msg}}</p>
			<div slot="footer">
				<!-- <Button type="default" size="large">取消</Button> -->
			</div>
		</Modal>
	</div>
</template>
<style lang="scss" scoped>
.psduploader {
	display: inline-block;
	vertical-align: middle;
}
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
import PSD from "libs/psd/index";
import path from "path";
import aRemote from "libs/aremote";
import Util from '../../libs/util';

export default {
	name: "my-psd",
	computed: {},
	props: {
		actname: String,
		pagename: String,
		device: String
	},
	data() {
		return {
			filepath: "",
			savepath: "",
			percent: {
				value: 0,
				msg: ""
			},
			isparse: false
		};
	},
	created() {
		this.savepath = path.join(
			Configs.getItem("workshop"),
			this.actname,
			"psd"
		);
	},
	updated() {},
	methods: {
		async getList() {
			var list = await this.assets.getList();
			this.list = list;
		},
		async upload(file) {
			this.uploadpath = path.join(
				Configs.getItem("workshop"),
				this.actname,
				"src/images/" + this.pagename
			);
			var self = this;
			this.isparse = true;
			try {
				//console.log(this.uploadpath);
				let mypsd = new PSD(
					file.path,
					this.uploadpath,
					"images/" + this.pagename,
					false
				);
				let res = await mypsd.parse(false, (state, percent, msg) => {
					if (!!state) {
						if(percent==100){
							this.isparse = false;
						}
						this.percent = { value: percent, msg: msg };
					}
					else{
						this.isparse = false;
						this.percent = { value: percent, msg: msg };
						alert(msg);
					}
				});
				// res = null;
				// mypsd = null;
				self.$emit("finish", res.vNode);
				mypsd = null;
				res = null;
				Util.gc();
			} catch (error) {
				this.isparse = false;
				alert('解析失败请检查PSD是否符合上传标准');
				Util.gc();
			}

			return false;
		}
	}
};
</script>


