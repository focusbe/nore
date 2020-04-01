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
			<Button
				@click="submitData"
				type="primary"
			>提交</Button>
		</div>
		<Form
			ref="form"
			:model="projectInfo"
			label-position="left"
			:label-width="100"
			:rules="projectRules"
		>
			<FormItem
				prop="actname"
				label="活动名称"
			>
				<Input
					placeholder="请填写英文或拼音"
					v-model="projectInfo.actname"
				/>
			</FormItem>
			<FormItem
				prop="title"
				label="标题"
			>
				<Input v-model="projectInfo.title" />
			</FormItem>
			<FormItem
				prop="desc"
				label="描述"
			>
				<Input v-model="projectInfo.desc" />
			</FormItem>
			<FormItem
				prop="game"
				label="游戏"
			>
				<Select v-model="projectInfo.game">
					<Option
						v-for="(item, key) in gameList"
						:value="key"
						:key="key"
					>{{ item.cname }}</Option>
				</Select>
			</FormItem>
			<!-- <FormItem prop="scaffold" label="脚手架">
				<Select v-model="projectInfo.scaffold">
					<Option v-for="(item, key) in scaList" :value="key" :key="key">{{ key }}</Option>
				</Select>
			</FormItem> -->
			<FormItem
				prop="folder"
				label="保存路径"
			>
				<Input
					placeholder
					v-model="projectInfo.folder"
				/>
				<!-- <span class="" type="text">{{projectInfo.actname}}</span> -->
				<Icon
					class="foldericon"
					@click="selectFolder"
					type="ios-folder-open"
					:size="30"
				/>
				<!-- <input
					class="fileinput"
					name="folder"
					@change="fileChange"
					type="file"
					webkitdirectory
					directory
				/>-->
			</FormItem>
			<!-- <FormItem
			 prop="template"
			 label="模板"
			>
				<Select v-model="projectInfo.template">
					<Option
					 v-for="(item, key) in templateList"
					 :value="item.path"
					 :key="key"
					>{{ item.name }}</Option>
				</Select>
			</FormItem>-->
		</Form>
	</Modal>
</template>
<script>
const { dialog } = require("electron").remote;
const { Projects, Project, Files } = require("../../libs/project.ts");
import mySocket from "../utli/mysocket";
import Configs from "../../libs/configs";
export default {
	data() {
		return {
			gameList: {},
			scaList: {},
			modalshow: false,
			loading: false,
			ProjectList: {},
			// templateList: [
			// 	{
			// 		name: "空白页",
			// 		path: "blank"
			// 	}
			// ],
			scaffoldList: [],
			projectInfo: {
				title: "",
				desc: "",
				actname: "",
				game: "",
				template: "",
				scaffold: "gulp",
				folder:
					localStorage.getItem("projectFolder") ||
					process.env.HOME ||
					"/"
			},
			projectRules: {
				// title: [
				// 	{
				// 		required: true,
				// 		message: "请填写项目标题",
				// 		trigger: "blur"
				// 	}
				// ],
				desc: [
					{
						required: false,
						message: "请填写项目描述",
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
				// scaffold: [
				// 	{
				// 		required: true,
				// 		message: "请选择脚手架",
				// 		trigger: "blur"
				// 	}
				// ],
				actname: [
					{
						required: true,
						message: "请填写项目名称",
						trigger: "blur"
					},
					{ validator: this.validateTitle, trigger: "blur" }
				],
				folder: [
					{
						required: true,
						message: "保存路径",
						trigger: "blur"
					},
					{ trigger: "blur" }
				]
				// template: [
				// 	{
				// 		required: true,
				// 		message: "请选择模板",
				// 		trigger: "blur"
				// 	}
				// ]
			}
		};
	},
	created: function() {
		var self = this;
		Projects.getlist(function(res) {
			self.ProjectList = res;
		});
		this.getGameList();
		this.getScalList();
	},
	// computed: {
	// 	gameList: function() {
	// 		return Configs.gameList();
	// 	}
	// },
	props: {},
	methods: {
		selectFolder() {
			dialog
				.showOpenDialog({
					defaultPath: this.projectInfo.folder,
					properties: ["openDirectory"]
				})
				.then(res => {
					if (
						!res.canceled &&
						!!res.filePaths &&
						res.filePaths.length > 0
					) {
						var folder = res.filePaths[0];
						this.$set(this.projectInfo, "folder", folder);
						localStorage.setItem("projectFolder", folder);
					} else {
					}
				});
		},

		getGameList: async function() {
			this.gameList = await Configs.gameList();
			this.gameList["other"] = {
				cname: "其他"
			};
		},
		async getScalList() {
			this.scaList = await Projects.getScaList();
			//console.log(this.scaList);
		},
		validateTitle: function(rule, value, callback) {
			var re = new RegExp("^[a-zA-Z0-9-_]+$");
			if (!value) {
				return callback(new Error("请填写项目名称"));
			} else if (!re.test(value)) {
				return callback(new Error("项目名称为英文或拼音"));
			}
			// else if (!!this.ProjectList[value]) {
			// 	return callback(new Error("项目名称已存在"));
			// }
			else {
				callback();
			}
		},
		hasProject(actname) {},
		submitData: function() {
			var self = this;
			this.$refs["form"].validate(valid => {
				if (valid) {
					//this.$Message.success("Success!");
					// console.log(self.projectInfo);

					// 	Projects.add();
					// 	// var newproject = new Project(self.projectInfo);
					// 	// console.log(newproject);
					// 	// newproject.create(function() {
					// 	// 	self.hide();
					// 	// 	self.$Message.info("创建成功");
					// 	// 	//let routeData = self.$router.resolve({ path: '/project/edit', query: {  actname: self.projectInfo.actname } });
					// 	// 	mySocket.sendTo("MAIN", "open", {
					// 	// 		tag: "project_edit",
					// 	// 		hash: "#/project/edit"+"?actname=" + self.projectInfo.actname
					// 	// 	});
					// 	// 	// alert(routeData.href);
					// 	// 	// window.open(routeData.href);
					// 	// 	self.ok();
					// 	// });
					Projects.add(self.projectInfo)
						.then(function(res) {
							console.log(res);
							if (!!res && !!res.id) {
								self.hide();
								self.$Message.info("创建成功");
								mySocket.sendTo("MAIN", "open", {
									tag: "project_edit_" + id,
									hash: "#/project/edit" + "?id=" + id
								});
								self.ok();
							} else {
								self.$Message.error("保存数据库失败");
							}
						})
						.catch(function(error) {
							console.log(error);
							self.$Message.error(error);
						});
				} else {
					this.$Message.error("验证失败");
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
<style lang="scss">
.fileinput,
.foldericon {
	position: absolute;
	right: 10px;
	top: 2px;
	// opacity: 0;
	// width: 100%;
	z-index: 1;
}
</style>
