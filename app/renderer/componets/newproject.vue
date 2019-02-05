<template>
	<Modal
		v-model="modalshow"
		title="新建项目"
		@on-ok="ok"
		@on-cancel="cancel"
		:loading="loading"
		:footer="''"
	>
		<div slot="footer">
			<Button @click="submitData" type="primary">提交</Button>
		</div>
		<Form
			ref="form"
			:model="projectInfo"
			label-position="left"
			:label-width="100"
			:rules="projectRules"
		>
			<FormItem prop="actname" label="活动名称">
				<Input placeholder="请填写英文或拼音" v-model="projectInfo.actname"/>
			</FormItem>
			<FormItem prop="title" label="标题">
				<Input v-model="projectInfo.title"/>
			</FormItem>
			<FormItem prop="desc" label="描述">
				<Input v-model="projectInfo.desc"/>
			</FormItem>
			<FormItem prop="game" label="游戏">
				<Select v-model="projectInfo.game">
					<Option v-for="(item, key) in gameList" :value="key" :key="key">{{ item.cname }}</Option>
				</Select>
			</FormItem>
			<FormItem prop="template" label="模板">
				<Select v-model="projectInfo.template">
					<Option v-for="(item, key) in templateList" :value="item.path" :key="key">{{ item.name }}</Option>
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
	name: "newproject",
	data() {
		return {
			// gameList:{},
			modalshow: false,
			loading: false,
			ProjectList: {},
			templateList: [
				{
					name: "空白页",
					path: "blank"
				}
			],
			projectInfo: {
				title: "",
				desc: "",
				actname: "",
				game: "",
				template: ""
			},
			projectRules: {
				title: [
					{
						required: true,
						message: "请填写标题",
						trigger: "blur"
					}
				],
				desc: [
					{
						required: true,
						message: "请填写描述",
						trigger: "blur"
					}
				],
				game: [
					{
						required: true,
						message: "请选择游戏项目",
						trigger: "blur"
					}
				],
				actname: [
					{
						required: true,
						message: "请填写项目名称",
						trigger: "blur"
					},
					{ validator: this.validateTitle, trigger: "blur" }
				],
				template: [
					{
						required: true,
						message: "请选择模板",
						trigger: "blur"
					}
				]
			}
		};
	},
	created: function() {
		var self = this;
		Projects.getlist(function(res) {
			self.ProjectList = res;
		});
	},
	computed: {
		gameList: function() {
			console.log(Configs);
			return Configs.gameList();
		}
	},
	props: {},
	methods: {
		validateTitle: function(rule, value, callback) {
			var re = new RegExp("^[a-zA-Z0-9]+$");
			if (!value) {
				return callback(new Error("请填写项目名称"));
			} else if (!re.test(value)) {
				return callback(new Error("项目名称为英文或拼音"));
			} else if (!!this.ProjectList[value]) {
				return callback(new Error("项目名称已存在"));
			} else {
				callback();
			}
		},
		submitData: function() {
			console.log(this.$refs["form"]);
			var self = this;
			this.$refs["form"].validate(valid => {
				if (valid) {
					//this.$Message.success("Success!");
					console.log(self.projectInfo);
					var newproject = new Project(self.projectInfo);
					newproject.create(function() {
						self.hide();
						self.$Message.info("创建成功");
						//let routeData = self.$router.resolve({ path: '/project/edit', query: {  actname: self.projectInfo.actname } });
						mySocket.sendTo("MAIN", "open", {
							tag: "project_edit",
							hash: "#/project/edit",
							search: "?actname=" + self.projectInfo.actname
						});
						// alert(routeData.href);
						// window.open(routeData.href);
						self.ok();
					});
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

