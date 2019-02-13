<template>
	<Modal
	 v-model="modalshow"
	 title="环境配置"
	 @on-ok="ok"
	 @on-cancel="cancel"
	 :loading="loading"
	 :footer="''"
	>
		<div slot="footer">
			<Button
			 @click="submitData"
			 type="primary"
			>提交</Button>
		</div>
		<Form
		 ref="form"
		 :model="configsData"
		 label-position="left"
		 :label-width="100"
		 :rules="configRules"
		>
			<FormItem
			 v-for="(item,key) in configObj"
			 v-bind:key="key"
			 prop="actname"
			 v-bind:label="item.name"
			>
				<Input
				 placeholder
				 v-model="configsData[key]"
				/>
				<input
				 class="fileinput"
				 v-bind:name="key"
				 @change="fileChange"
				 type="file"
				 webkitdirectory
				 directory
				>
				<Icon
				 class="foldericon"
				 type="ios-folder-open"
				 :size="30"
				/>
			</FormItem>
		</Form>
	</Modal>
</template>
<style lang="scss" scoped>
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
			configRules: null
		};
	},
	created: function() {
		var self = this;
		this.configObj = Configs.getConfigDesc();
		this.configsData = Configs.getConfigData();
		for (var i in this.configObj) {
			let rules = {};
			rules[i] = {
				required: true,
				message: "必填",
				trigger: "blur"
			};
			this.configRules = rules;
		}
	},
	computed: {},
	props: {},
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
			this.$refs["form"].validate(valid => {
				if (valid) {
				} else {
					this.$Message.error("Fail!");
				}
			});
		},
		show: function() {
			this.modalshow = true;
		},
		hide: function() {
			this.modalshow = false;
		},
		ok() {
			//this.$Message.info("Clicked ok");
			this.$emit("ok", true);
		},
		cancel() {
			//this.$Message.info("Clicked cancel");
		}
	}
};
</script>

