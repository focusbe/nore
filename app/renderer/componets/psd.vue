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
			<Button shape="circle" type="text" icon="md-aperture"></Button>
		</Upload>

		<Modal
		 v-model="isparse"
		 title="PSD解析中"
		 :mask-closable="false"
		 :closable="false"
		>
			<Progress :percent="percent.value" />
			<p>{{percent.msg}}</p>
			<div slot="footer">
				<!-- <Button type="default" size="large">取消</Button> -->
			</div>
		</Modal>
		<Modal
		 v-model="isloading"
		 title="正在检测PSD"
		 :mask-closable="false"
		 :closable="false"
		>
			<div class="center">
				<Spin size="large"></Spin><span></span>
			</div>

			<div slot="footer">
				<!-- <Button type="default" size="large">取消</Button> -->
			</div>
		</Modal>
		<Modal
		 v-model="errorshow"
		 title="提示"
		 :mask-closable="false"
		 :closable="true"
		>
			<Alert
			 type="warning"
			 show-icon
			>
				下面图层为完成合并
				<template slot="desc">如果继续保存将会忽略这些图层，最终呈现效果可能与psd有较大的差异</template>
			</Alert>
			<ul class="error_list">
				<li>
					<p v-for="item in errorarr">{{item}}</p>
				</li>
			</ul>
			<div slot="footer">
				<Button
				 type="text"
				 size="large"
				 @click="errorshow=false"
				>取消</Button>
				<Button
				 type="warning"
				 size="large"
				 @click="parse"
				>忽略并解析</Button>
			</div>
		</Modal>
	</div>
</template>
<style lang="scss" scoped>

.error_list{
	max-height: 200px;
	overflow: auto;
	li{
		padding: 5px 10px;
	}
}
.psduploader {
	display: inline-block;
	vertical-align: middle;
}
.center {
	text-align: center;
	width: 100%;
}
.ivu-spin {
	text-align: center;
	display: inline-block;
	// width: 100px;
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
import Util from "../../libs/util";

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
			isloading: false,
			errorshow: false,
			errorarr: [],
			isparse: false,
			mypsd: null
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
			this.isloading = true;
			this.uploadpath = path.join(
				Configs.getItem("workshop"),
				this.actname,
				"src/images/" + this.pagename
			);
			var self = this;
			let mypsd = new PSD(
				file.path,
				this.uploadpath,
				"images/" + this.pagename,
				this.device == "phone"
			);
			this.mypsd = mypsd;
			this.errorarr = [];
			let errorarr = await mypsd.getErrorLayer();
			if (!!errorarr) {
				this.errorarr = errorarr;
				this.isloading = false;
				this.errorshow = true;
			} else {
				this.isloading = false;
				this.parse();
			}
			// return false;
		},
		async parse() {
			if (this.isparse) {
				return;
			}
			var self = this;
			this.isloading = false;
			this.errorshow = false;
			this.isparse = true;

			try {
				//console.log(this.uploadpath);
				let res = await this.mypsd.parse(
					false,
					(state, percent, msg) => {
						if (!!state) {
							if (percent == 100) {
								this.isparse = false;
							}
							this.percent = { value: percent, msg: msg };
						}
					}
				);
				// res = null;
				// mypsd = null;
				self.$emit("finish", res.vNode);
				this.mypsd = null;
				res = null;
				Util.gc();
			} catch (error) {
				console;
				this.isparse = false;
				alert("解析失败请检查PSD是否符合上传标准");
				Util.gc();
			}
		}
	}
};
</script>


