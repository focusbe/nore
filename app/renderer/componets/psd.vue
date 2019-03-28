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
			<Button>
				PSD
			</Button>
		</Upload>
	</div>
</template>
<style lang="scss" scoped>
.psduploader{
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
import PSD  from "libs/psd/index";
import path from "path";
import aRemote from "libs/aremote";

export default {
	name: "my-psd",
	computed: {},
	props: {
		actname: String,
		pagename: String
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
	},
	updated() {

	},
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
			try {
				console.log(this.uploadpath);
				var mypsd = new PSD(
					file.path,
					this.uploadpath,
					"src/images/" + this.pagename
				);
				var res = await mypsd.parse(true, false);
				console.log(res);
				// res = null;
				// mypsd = null;
				self.$emit("finish", res.vNode);
				mypsd = null;
				res = null;
			} catch (error) {
				console.error(error);
			}

			return false;
		}
	}
};
</script>


