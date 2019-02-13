<template>
	<Modal
	 v-model="modalshow"
	 title="新建页面"
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
					 :value="item.path"
					 :key="key"
					>{{ item.name }}</Option>
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
			// gameList:{},
			modalshow: false,
			loading: false,
			pageList: {},
			templateList: [],
			pageInfo: {
				title: "",
				name: "",
				desc: "",
				template: ""
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
				]
			}
		};
    },
    updated(){
        console.log(this.curProject);
    },
	created: function() {
        var self = this;
        console.log(this.curProject);
		if (!!this.curProject) {
			this.curProject.getPageList(function(res) {
				self.pageList = res;
			});
		}
	},
	computed: {
		gameList: function() {
			console.log(Configs);
			return Configs.gameList();
		}
	},
	props: {
		curProject: null
	},
	methods: {
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
			console.log(this.$refs["form"]);
			var self = this;
			this.$refs["form"].validate(valid => {
				if (valid) {
					//this.$Message.success("Success!");
					try {
						// var newpage = new page(self.pageInfo);
						// console.log(newpage);
						// newpage.create(function() {
						// 	self.hide();
						// 	self.$Message.info("创建成功");
						// 	//let routeData = self.$router.resolve({ path: '/page/edit', query: {  actname: self.pageInfo.actname } });
						// 	mySocket.sendTo("MAIN", "open", {
						// 		tag: "page_edit",
						// 		hash:
						// 			"#/page/edit" +
						// 			"?actname=" +
						// 			self.pageInfo.actname
						// 	});
						// 	// alert(routeData.href);
						// 	// window.open(routeData.href);
						// 	self.ok();
						// });
					} catch (error) {
						console.log(error);
					}
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

