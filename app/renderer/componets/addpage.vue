<template>
	<Modal
	 v-model="modalshow"
	 title="新建页面"
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
		 :model="pageInfo"
		 label-position="left"
		 :label-width="100"
		 :rules="pageRules"
		>
			<FormItem
			 prop="name"
			 label="名称"
			>
				<Input v-model="pageInfo.name" />
			</FormItem>
			<FormItem
			 prop="title"
			 label="标题"
			>
				<Input v-model="pageInfo.title" />
			</FormItem>
			<FormItem
			 prop="desc"
			 label="描述"
			>
				<Input v-model="pageInfo.desc" />
			</FormItem>

			<FormItem
			 prop="template"
			 label="模板"
			>
				<Select v-model="pageInfo.template">
					<Option
					 v-for="(item, key) in templateList"
					 :value="key"
					 :key="key"
					>{{ key }}</Option>
				</Select>
			</FormItem>
			<FormItem
			 prop="device"
			 label="设备"
			>
				<Select
				 v-model="pageInfo.device"
				>
					<Option value="pc">PC端</Option>
					<Option value="phone">移动端</Option>
				</Select>
			</FormItem>
		</Form>
	</Modal>
</template>
<script>
const { Projects, Project, Files } = require("../../libs/project");
import mySocket from "../utli/mysocket";
import Configs from "../../libs/configs";
export default {
	name: "addpage",
	data() {
		return {
			gameList: {},

			modalshow: false,
			loading: false,
			pageList: {},
			templateList: {},
			pageInfo: {
				title: "",
				name: "",
				desc: "",
				template: "",
				device:""
			},
			pageRules: {
				title: [
					{
						required: true,
						message: "请填写页面标题",
						trigger: "blur"
					}
				],
				desc: [
					{
						required: true,
						message: "请填写页面描述",
						trigger: "blur"
					}
				],
				name: [
					{
						required: true,
						message: "请填写页面名称",
						trigger: "blur"
					},
					{ validator: this.validateName, trigger: "blur" }
				],
				template: [
					{
						required: true,
						message: "请选择模板",
						trigger: "blur"
					}
				],
				device: [
					{
						required: true,
						message: "请选择设备类型",
						trigger: "blur"
					}
				]
			}
		};
	},
	updated() {},
	created: function() {
		var self = this;

		if (!!this.curProject) {
			this.curProject.getPageList(function(res) {
				self.pageList = res;
			});
		}
		this.getTemList();
		this.getGameList();
	},
	// computed: {
	// 	gameList: function() {
	// 		return Configs.gameList();
	// 	}
	// },
	props: {
		curProject: null
	},
	methods: {
		getGameList: async function() {
			this.gameList = await Configs.gameList();
		},

		validateName: function(rule, value, callback) {
			var re = new RegExp("^[a-zA-Z0-9]+$");
			if (!value) {
				return callback(new Error("请填写页面名称"));
			} else if (!re.test(value)) {
				return callback(new Error("页面名称为英文或拼音"));
			} else if (!!this.pageList[value]) {
				return callback(new Error("页面名称已存在"));
			} else {
				callback();
			}
		},
		submitData: function() {
			this.$refs["form"].validate(
				function(valid) {
					if (valid) {
						//this.$Message.success("Success!");
						var id = this.curProject.addPage(this.pageInfo);
						//console.log(id);
						if (id == -1) {
							this.$Message.error("请传入正确的参数");
						} else if (id == -2) {
							this.$Message.error("已经有相同的页面名称了");
						} else if (!!id) {
							this.hide();
							this.$Message.info("创建成功");
							//console.log(id);
							this.$emit("ok", id);
						} else {
							this.$Message.error("保存页面失败");
						}
					} else {
						this.$Message.error("Fail!");
					}
				}.bind(this)
			);
		},
		show: function() {
			this.modalshow = true;
		},
		hide: function() {
			this.modalshow = false;
		},
		async getTemList() {
			try {
				let list = await Projects.getTempList();
				this.templateList = list;
			} catch (error) {
				console.error(error);
			}
		},
		ok() {
			//this.$Message.info("Clicked ok");
			//this.$emit("ok", true);
		},
		cancel() {
			//this.$Message.info("Clicked cancel");
		}
	}
};
</script>

