<template id="template">
	<div class="page_wrap">
		<ul class="project_list">
			<li
			 v-for="(item,key) in projectList"
			 v-bind:key="key"
			 v-contextmenu:contextmenu
			>
				<a @click="projectEdit(key)">
					<img
					 src="../images/bg.jpg"
					 alt
					>
					<p>{{key}}</p>
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
		<editconfig
		 ref="configform"
		 @ok="editconfigok"
		></editconfig>
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
const { Projects, Project, Files } = require("../../libs/project");
import Configs from "../../libs/configs";
import mySocket from "../utli/mysocket";
Vue.component("newproject", newproject);
Vue.component("editconfig", editconfig);

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
	created: function() {},
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
					Projects.delete(actname, function(res) {
						if (res) {
							self.$Message.success("删除成功！");
							self.getProjects();
						}
					});
				},
				onCancel: () => {}
			});
		},
		openinVscode() {
			var actname = this.curcontextVnode.key;
			try {
				var res = Projects.openWithIed(actname);
				if (res == -1) {
					this.$Message.warning("请先配置VSCODE路径");
					this.showEditConfig();
				} else if (res == -2) {
					this.$Message.warning("项目不存在");
				} else {
					// self.$Message.success('删除成功！');
				}
			} catch (error) {
				console.log(error);
				alert("打开失败");
			}
		},
		openinFolder() {
			var actname = this.curcontextVnode.key;
		},
		getProjects: function() {
			var self = this;
			Projects.getlist(function(res) {
				if (res) {
					self.projectList = res;
				} else {
					alert("获取项目列表失败");
				}
			});
		},
		newprojectok: function() {
			//return false;
			this.getProjects();
		},
		showEditConfig() {
			this.$refs.configform.show();
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
