<template>
	<div class="editconfig">
		<h2>配置环境</h2>
		<Form
			ref="form"
			:model="configsData"
			label-position="left"
			:label-width="100"
			:rules="configRules"
		>
			<FormItem v-for="(item,key) in configObj" v-bind:key="key" :prop="key" v-bind:label="item.name">
				<Input placeholder v-model="configsData[key]"/>
				<input
					class="fileinput"
					v-bind:name="key"
					@change="fileChange"
					type="file"
					webkitdirectory
					directory
				>
				<Icon class="foldericon" type="ios-folder-open" :size="30"/>
			</FormItem>
		</Form>
		<div class="footer">
			<Button @click="submitData" type="default">保存</Button>
			<Button @click="cancel" type="primary">取消</Button>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.footer{
	text-align: right;
	button{
		margin: 0 10px;
	}
}
.fileinput,
.foldericon {
	position: absolute;
	right: 0;
	top: 0;
	opacity: 0;
	width: 100px;
	z-index: 1;
}
.foldericon {
	opacity: 1;
	width: auto;
	z-index: 0;
	top: 2px;
}
.editconfig {
	box-sizing: border-box;
	padding: 0px 20px;
	h2{
		font-size: 16px;
		line-height: 2;
	}
}
</style>
<script>
const { Projects, Project, Files } = require("../../libs/project");
import Configs from "../../libs/configs";
export default {
	name: "editconfig",
	data() {
		return {
			modalshow: false,
			loading: false,
			configsData: {},
			configObj: null,
			configRules: {
				workshop: {
					required: true,
					message: "请填写项目保存目录",
					trigger: "blur"
				}
			}
		};
	},
	created: function() {
		var self = this;
		this.configObj = Configs.getConfigDesc();
		this.configsData = Configs.getConfigData();
		this.modalshow = !!this.isShow;
		let rules = {};
		// for (var i in this.configObj) {

		// 	rules[i] = {
		// 		required: true,
		// 		message: "必填",
		// 		trigger: "blur"
		// 	};
		// 	this.configRules = rules;
		// }
	},
	computed: {},
	props: {
		isShow: false
	},
	methods: {
		fileChange(e) {
			let folder = null;
			try {
				name = e.target.name;
				folder = e.target.files[0]["path"];
			} catch (error) {}
			this.$set(this.configsData, name, folder);
			Configs.setItem(name, folder);
		},
		submitData: function() {
			var self = this;
			// this.$refs["form"].validate(valid => {
			// 	if (valid) {

			// 	} else {
			// 		this.$Message.error("Fail!");
			// 	}
			// });
			this.$emit("ok", true);
		},
		show: function() {
			this.modalshow = true;
		},
		hide: function() {
			this.modalshow = false;
		},
		cancel() {
			window.close();
		}
	}
};
</script>

