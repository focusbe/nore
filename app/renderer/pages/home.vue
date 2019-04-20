<template id="template">
	<div class="page_wrap">
		<ul class="project_list">
			<li
			 v-for="(item) in projectList"
			 v-bind:key="item.actname"
			 v-contextmenu:contextmenu
			>
				<a @click="projectEdit(item.actname)" >
					<div v-if="item.preview" :style="{background:'url('+item.preview+') no-repeat top center/100% auto'}"></div>
					<p>{{item.game}}-{{item.actname}}</p>
					
				</a>
			</li>
			<li>
				<Button
				 type="primary"
				 @click="showprojectadd"
				>
					<Icon
					 type="ios-add-circle"
					 :size="30"
					/>
				</Button>
			</li>
		</ul>
		<newproject
		 ref="projectForm"
		 @ok="newprojectok"
		></newproject>
		<v-contextmenu
		 ref="contextmenu"
		 @contextmenu="onContextMenu"
		>
			<v-contextmenu-item @click="deleProject">删除</v-contextmenu-item>
			<v-contextmenu-item @click="openinVscode">在VSCODE打开</v-contextmenu-item>
			<v-contextmenu-item @click="openinFolder">在文件夹中显示</v-contextmenu-item>
		</v-contextmenu>
	</div>

</template>
<script>
import Vue from "vue";
import newproject from "../componets/newproject.vue";
import editconfig from "../componets/editconfig.vue";
const { Projects, Project, Files } = require("../../libs/project.ts");
import Configs from "../../libs/configs";
import mySocket from "../utli/mysocket";
Vue.component("newproject", newproject);
Vue.component("editconfig", editconfig);
const path = require('path');
export default {
	name: "home",
	data() {
		return {
			projectList: {},
			curcontextVnode: null
		};
	},
	mounted() {
		if (!Configs.getItem("workshop")) {
			this.showEditConfig();
		} else {
			this.getProjects();
		}
		var self = this;
	},
	created: function() {
		mySocket.on('getlist',()=>{
			this.getProjects();
		})
	},
	methods: {
		onContextMenu(vnode) {
			this.curcontextVnode = vnode;
		},
		deleProject() {
			var actname = this.curcontextVnode.key;
			var self = this;
			this.$Modal.confirm({
				title: "确认",
				content: "<p>确定删除" + actname + "</p>",
				onOk: () => {
					var res = Projects.delete(actname)
						.then(function() {
							self.getProjects();
						})
						.catch(function(error) {
							self.$Message.error(error);
						});
				},
				onCancel: () => {}
			});
		},
		async openinVscode() {
			if(!Configs.getItem('vscodePath')){
				alert('请先设置VSCODE的安装目录');
				return;
			}
			var actname = this.curcontextVnode.key;
			try {
				var res = await Projects.openWithIed(actname);
				// if (res == -1) {
				// 	this.$Message.warning("请先配置VSCODE路径");
				// 	this.showEditConfig();
				// } else if (res == -2) {
				// 	this.$Message.warning("项目不存在");
				// } else {
				// 	// self.$Message.success('删除成功！');
				// }
			} catch (error) {
				//console.log(error);
				alert(error.message);
			}
		},
		openinFolder() {
			var actname = this.curcontextVnode.key;
			var shell = require("electron").shell;
			//const os = require("os");
			shell.showItemInFolder(path.resolve(Configs.getItem("workshop"),actname+'/data'));
		},
		getProjects: async function() {
			var self = this;
			var res = await Projects.getlist();
			console.log(res);
			if (res) {
				self.projectList = res;
			} else {
				alert("获取项目列表失败");
			}
		},
		newprojectok: function() {
			//return false;
			this.getProjects();
		},
		showEditConfig() {
			mySocket.sendTo("MAIN", "open", {
				width: 500,
				height: 460,
				tag: "config_edit",
				hash: "#/configs/edit"
			});
		},
		editconfigok() {},
		showprojectadd: function() {
			this.$refs.projectForm.show();
		},
		projectEdit: function(id) {
			mySocket.sendTo("MAIN", "open", {
				tag: "project_edit_" + id,
				hash: "#/project/edit?actname=" + id
			});
		}
	}
};
</script>
