<template id="template">
	<div class="page_wrap">
		<ul class="project_list">
			<li
			 v-for="(item) in projectList"
			 v-bind:key="item.actname"
			 v-contextmenu:contextmenu
			>
				<a @click="projectEdit(item.actname)">
					<div
					 v-if="item.preview"
					 :style="{background:'url('+item.preview+') no-repeat top center/100% auto'}"
					></div>
					<p>{{item.actname}}</p>
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
		<div><Button>Default</Button>
			<Button type="primary">Primary</Button>
			<Button type="dashed">Dashed</Button>
			<Button type="text">Text</Button>
			<br><br>
			<Button type="info">Info</Button>
			<Button type="success">Success</Button>
			<Button type="warning">Warning</Button>
			<Button type="error">Error</Button></div>
		<div>
			<Card style="width:350px">
				<p slot="title">
					<Icon type="ios-film-outline"></Icon>
					Classic film
				</p>
				<a
				 href="#"
				 slot="extra"
				 @click.prevent="changeLimit"
				>
					<Icon type="ios-loop-strong"></Icon>
					Change
				</a>
				<ul>
					<li v-for="item in randomMovieList">
						<a
						 :href="item.url"
						 target="_blank"
						>{{ item.name }}</a>
						<span>
							<Icon
							 type="ios-star"
							 v-for="n in 4"
							 :key="n"
							></Icon>
							<Icon
							 type="ios-star"
							 v-if="item.rate >= 9.5"
							></Icon>
							<Icon
							 type="ios-star-half"
							 v-else
							></Icon>
							{{ item.rate }}
						</span>
					</li>
				</ul>
			</Card>
		</div>
		<div>
			<Collapse v-model="value1">
				<Panel name="1">
					史蒂夫·乔布斯
					<p slot="content">史蒂夫·乔布斯（Steve Jobs），1955年2月24日生于美国加利福尼亚州旧金山，美国发明家、企业家、美国苹果公司联合创办人。</p>
				</Panel>
				<Panel name="2">
					斯蒂夫·盖瑞·沃兹尼亚克
					<p slot="content">斯蒂夫·盖瑞·沃兹尼亚克（Stephen Gary Wozniak），美国电脑工程师，曾与史蒂夫·乔布斯合伙创立苹果电脑（今之苹果公司）。斯蒂夫·盖瑞·沃兹尼亚克曾就读于美国科罗拉多大学，后转学入美国著名高等学府加州大学伯克利分校（UC Berkeley）并获得电机工程及计算机（EECS）本科学位（1987年）。</p>
				</Panel>
				<Panel name="3">
					乔纳森·伊夫
					<p slot="content">乔纳森·伊夫是一位工业设计师，现任Apple公司设计师兼资深副总裁，英国爵士。他曾参与设计了iPod，iMac，iPhone，iPad等众多苹果产品。除了乔布斯，他是对苹果那些著名的产品最有影响力的人。</p>
				</Panel>
			</Collapse>
		</div>
		<div>
			<p>Steven Paul Jobs was an American entrepreneur and business magnate. He was the chairman, chief executive officer, and a co-founder of Apple Inc.</p>
			<Divider />
			<p>Steven Paul Jobs was an American entrepreneur and business magnate. He was the chairman, chief executive officer, and a co-founder of Apple Inc.</p>
			<Divider>With Text</Divider>
			<p>Steven Paul Jobs was an American entrepreneur and business magnate. He was the chairman, chief executive officer, and a co-founder of Apple Inc.</p>
			<Divider dashed />
			<p>Steven Paul Jobs was an American entrepreneur and business magnate. He was the chairman, chief executive officer, and a co-founder of Apple Inc.</p>
		</div>
		<div>
			<Tabs>
				<TabPane
				 label="macOS"
				 icon="logo-apple"
				>标签一的内容</TabPane>
				<TabPane
				 label="Windows"
				 icon="logo-windows"
				>标签二的内容</TabPane>
				<TabPane
				 label="Linux"
				 icon="logo-tux"
				>标签三的内容</TabPane>
			</Tabs>
		</div>
		<div>
			<Dropdown>
				<a href="javascript:void(0)">
					下拉菜单
					<Icon type="ios-arrow-down"></Icon>
				</a>
				<DropdownMenu slot="list">
					<DropdownItem>驴打滚</DropdownItem>
					<DropdownItem>炸酱面</DropdownItem>
					<DropdownItem disabled>豆汁儿</DropdownItem>
					<DropdownItem>冰糖葫芦</DropdownItem>
					<DropdownItem divided>北京烤鸭</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
		<div>
			<Steps :current="1">
				<Step
				 title="已完成"
				 content="这里是该步骤的描述信息"
				></Step>
				<Step
				 title="进行中"
				 content="这里是该步骤的描述信息"
				></Step>
				<Step
				 title="待进行"
				 content="这里是该步骤的描述信息"
				></Step>
				<Step
				 title="待进行"
				 content="这里是该步骤的描述信息"
				></Step>
			</Steps>
		</div>
	</div>

</template>
<script>
import Vue from "vue";
const { Projects, Project, Files } = require("../../libs/project.ts");
import Configs from "../../libs/configs";
import mySocket from "../utli/mysocket";

const path = require("path");
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
		mySocket.on("getlist", () => {
			this.getProjects();
		});
		mySocket.on("console", data => {
			console.log(data);
		});
		mySocket.on("updateDownloaded", () => {
			this.$Modal.confirm({
				title: "更新",
				content: "<p>发现有新版本是否更新</p>",
				onOk: () => {
					mySocket.sendTo("MAIN", "quitInstall");
				}
			});
		});
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
			if (!Configs.getItem("vscodePath")) {
				alert("请先设置VSCODE的安装目录");
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
			shell.showItemInFolder(
				path.resolve(Configs.getItem("workshop"), actname + "/data")
			);
		},
		getProjects: async function() {
			var self = this;
			var res = await Projects.getlist();
			//console.log(res);
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
				height: 500,
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
