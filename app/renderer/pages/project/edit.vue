<template>
	<div class="page_wrap">
		<div class="left_options">
			<pagemanage
			 :project="project"
			 @openPage="openPage"
			></pagemanage>
			<div class="options_section">
				<h2>素材</h2>
				<assets :actname="actname"></assets>
			</div>
		</div>
		<div class="center">
			<ul class="page_list">
				<li
				 v-for="(item,key) in pagelist"
				 :class="item.name==curPage?'cur':''"
				>
					<span @click="changePage(item.name)">{{item.name}}</span>
					<Icon
					 @click="closePage(key)"
					 size="22"
					 type="ios-close"
					/>
				</li>
			</ul>

			<div class="page_detail">
				<div
				 class="top_options_bar"
				 v-if="curPage"
				>
					<Button
					 type="primary"
					 @click="clearCanvas"
					 title="清空"
					>
						<Icon
						 type="md-trash"
						 size="20"
						/>
					</Button>
					<Button
					 type="primary"
					 @click="savePage"
					 title="保存"
					>
						<Icon
						 type="md-sync"
						 size="20"
						/>
					</Button>
					<Button
					 @click="buildPage"
					 type="primary"
					 title="构建"
					>
						<Icon
						 type="md-build"
						 size="20"
						 color
						/>
					</Button>
					<Button
					 @click="preview"
					 type="primary"
					 title="预览"
					>
						<Icon
						 type="logo-chrome"
						 size="20"
						 color
						/>
					</Button>
					<Select
					 v-model="curdevice"
					 slot="prepend"
					 style="width: 80px"
					>
						<Option value="pc">PC端</Option>
						<Option value="phone">移动端</Option>
					</Select>
					<my-psd
					 :actname="actname"
					 :pagename="curPage"
					 @savedesign="savedesign"
					 @finish="psdfinish"
					 title="上传PSD"
					></my-psd>
				</div>
				<div
				 v-for="(item,key) in pagelist"
				 v-show="curPage==item.name"
				 :class="'canvas canvas'+item.name "
				 v-bind:style="designeSize[curdevice]"
				>
					<my-canvas
					 :ref="'canvas'+item.name"
					 :canvasData="item"
					 :pagename="item.name"
					 :projectname="actname"
					 @onChange="onCanvasChange"
					/>
				</div>
			</div>
		</div>
		<div class="right_area">
			<div class="options_section">
				<h2>组件</h2>
				<ul class="element_list">
					<li
					 v-for="item in viewList"
					 v-bind:key="item.name"
					 v-if="!item.hidden"
					>
						<a
						 @click="addView(item)"
						 href="javascript:void(0)"
						>
							<Icon
							 :type="item.icon"
							 size="24"
							 color
							/>
							<p>{{item.label}}</p>
						</a>
					</li>
				</ul>
			</div>
			<styles-panel
			 @onChange="onCurStylesChange"
			 v-if="styleOptions"
			 :options="styleOptions"
			 :optionsValue="curStyles"
			 title="样式布局"
			></styles-panel>
			<br>
			<my-options
			 @onChange="onCurPropsChange"
			 v-if="propOptions"
			 :options="propOptions"
			 :optionsValue="curProps"
			 title="组件参数"
			></my-options>
			<br>
		</div>
		<div
		 v-show="dragover"
		 class="dragover"
		></div>
	</div>
</template>
<style lang="scss" scoped>
.page_wrap {
	display: flex;
	flex-direction: row;
}
</style>

<script>
import PSD from "../../componets/psd";
import Server from "../../../libs/server";
import { Project } from "../../../libs/project";
import Files from "../../../libs/files";

import Vue from "vue";
import viewList from "../../elements/list.js";
import Canvas from "../../componets/canvas.vue";
import Options from "../../componets/options.vue";
import stylesPanels from "../../componets/panels/styles.vue";
import Assets from "../../componets/assets";
import addpage from "../../componets/addpage.vue";
import pagemanage from "../../componets/pagemanage.vue";

Vue.component("my-options", Options);
Vue.component("styles-panel", stylesPanels);
Vue.component("my-canvas", Canvas);
Vue.component("assets", Assets);
Vue.component("my-psd", PSD);
Vue.component("add-page", addpage);
Vue.component("pagemanage", pagemanage);

export default {
	name: "project_edit",
	data() {
		return {
			styleOptions: {}, //当前样式的配置信息
			curStyles: {}, //当前样式的数组
			curdevice: "phone", //当前设备类型
			propOptions: {}, //当前组建配置信息
			curProps: {}, //当前组件的参数
			// canvasDataList: {},
			//以上是cavas相关
			curPage: "",
			prejectInfo: {}, //该项目的信息
			serverpath: null, //预览服务器的地址
			actname: "", //当前项目的名称
			project: null, //当前项目的对象，可以用于获取项目信息，添加删除页面等；
			viewList: viewList, //组件列表
			pagelist: null, //当前新项目的所有页面信息 {name：{}}
			dragover: false,
			designeSize: {
				pc: {
					width: "100%",
					height: "100%"
				},
				phone: {
					width: "750px",
					height: "100%"
				}
			}
		};
	},

	created: function() {
		//初始化组件
		var self = this;
		let actname = this.$route.query.actname;
		this.actname = actname;
		var project = new Project(actname);
		this.project = project;
		this.getPagelist();

		// Server.start(function(res) {
		// 	if (
		// 		!!res &&
		// 		!!res.instance &&
		// 		!!res.instance.server &&
		// 		!!res.instance.server._connectionKey
		// 	) {
		// 		var port = res.instance.server._connectionKey;
		// 		port = port.split(":");
		// 		port = port[port.length - 1];
		// 		self.serverpath =
		// 			"http://localhost:" + port + "/" + self.actname;
		// 	} else {
		// 	}
		// });
		// project.getinfo(function(res) {

		// 	self.prejectInfo = res;
		// });
	},
	getProjectInfo: function() {},
	mounted: function() {
		var self = this;
		document.onkeydown = function(e) {
			//对整个页面文档监听
			// var keyNum=window.event ? e.keyCode :e.which;
			// if(keyNum==8){
			//     self.deletecurElement();
			// }
		};
		this.changePage(0);
	},
	computed: {
		curCanvas() {
			return this.$refs["canvas" + this.curPage][0];
		},
		curPageInfo() {
			return this.pagelist[this.curPage];
		},
		curpageName() {
			var curpage = null;
			let tmppage = null;
			for (var i in this.pagelist) {
				tmppage = this.pagelist[i];
				if (
					!!tmppage &&
					!!tmppage["name"] &&
					tmppage["name"] == this.curPage
				) {
					return;
				}
			}
			return curpage;
			if (!this.pagelist[this.curPage]) {
				return "";
			}

			return this.pagelist[this.curPage]["name"];
		}
	},
	methods: {
		bindDrag() {
			//监听把文件拖到窗口
			var body = document.getElementsByTagName("body")[0];
			body.ondrop = function(event) {
				event.preventDefault();
				self.dragover = false;

				var efile = event.dataTransfer.files;
				for (var i = 0; i < efile.length; i++) {
					Files.isdir(efile[i].path, function(bool) {
						// if(bool){
						// }
						// else{
						// }
					});
				}
			};
			body.ondragenter = body.ondragover = function(event) {
				// 重写ondragover 和 ondragenter 使其可放置
				event.preventDefault();
				self.dragover = true;
			};
			body.addEventListener("dragleave", function(event) {
				event.preventDefault();
				if (event.target.className == "dragover") {
					self.dragover = false;
				}
			});
		},
		reloadFromJsx() {
			this.project.fileToDb(this.curPageInfo.name);
		},
		openPage(pageinfo) {
			var name = pageinfo.name;
			for (var i in this.pagelist) {
				if (name == this.pagelist[i].name) {
					this.changePage(name);
					return;
				}
			}
			this.pagelist.push(pageinfo);
			this.changePage(pageinfo.name);
		},
		getPagelist() {
			this.pagelist = [];
			var pagelist = this.project.getPageList();
			for (var i in pagelist) {
				this.pagelist.push(pagelist[i]);
			}
			var canvasDataList = {};
			for (var i in pagelist) {
				canvasDataList[pagelist[i]["name"]] = pagelist[i];
			}
			this.canvasDataList = canvasDataList;
		},
		changePage(pagename) {
			//保存原来的信息
			//切换到页面；
			if (!pagename || pagename == this.curPage) {
				return;
			}
			if (!!this.curPage) {
				this.saveCurPage();
			}

			if (!!this.pagelist && !!pagename) {
				this.curPage = pagename;
				//this.getPageInfo(index);
			}
		},

		async saveCurPage() {
			this.curCanvas.syncRoot();
			var curCanvasData = this.canvasDataList[this.curPage];

			if (!!curCanvasData) {
				var rootJson = curCanvasData.toJson();
				try {
					var res = await this.project.savePage(
						this.curPage,
						rootJson
					);
					if (!!res) {
						return true;
					}
				} catch (error) {
					return false;
				}
			}
			return true;
		},
		resetEditor() {
			this.styleOptions = {};
			this.curStyles = {};
			this.propOptions = {};
			this.curProps = {};
		},
		getPageInfo(key) {
			// let id = this.pagelist[key].id;
			// if(!this.canvasDataList){
			// 	this.canvasDataList={};
			// }
			// this.canvasData[key] = null;
			// this.curCanvas = this.canvasData[key];
			// this.resetEditor();
			//console.log(this.$refs.canvas);
			// this.canvasData = this.curPageInfo.tree;
			//this.curCanvas.initFromTree(this.curPageInfo.tree);
		},
		closePage(key) {
			// this.$Modal.confirm({
			// 	title: "确认",
			// 	content: "<p>确定删除" + key + "</p>",
			// 	onOk: function() {
			// 		var res = this.project.delPage(key);
			// 		if (res == -1) {
			// 			this.$Message.error("没有该页面存在");
			// 		} else if (!!res) {
			// 			this.$Message.success("删除成功");
			// 		} else {
			// 			this.$Message.error("删除失败");
			// 		}
			// 		this.getPagelist();
			// 	}.bind(this),
			// 	onCancel: () => {}
			// });
			this.pagelist.splice(key, 1);
		},
		// addPageOk() {
		// 	this.getPagelist();
		// },
		psdfinish(vnodetree) {
			this.curCanvas.initFromTree(vnodetree);
		},
		savedesign() {},
		clearCanvas() {
			this.curCanvas.clearCanvas();
		},
		async savePage() {
			var result = this.saveCurPage();
			if (result) {
				alert("保存成功");
			} else {
				alert("保存失败");
			}
		},
		async buildPage() {
			var res = await this.project.buildPage(this.curPage);
			if (res) {
				alert("构建成功");
			} else {
				alert("构建失败");
			}
		},
		reloadPage() {
			this.project.fileToDb(this.curPageInfo.name);
		},
		onCanvasChange: function(event, params) {
			switch (event) {
				case "root":
					this.canvasDataList[this.curPage] = params;
					break;
				case "curvnode":
					//console.log(params);
					this.setPanles(params);
			}
		},
		// beforeupload(file) {
		// 	alert(1);
		// 	console.log(file);
		// 	return false;
		// },
		addAssets() {},
		changeDevice: function(device) {
			this.curdevice = device;
		},
		preview: function() {
			var self = this;
			//if (this.serverpath) {
			this.curCanvas.renderToString();
			//window.open(this.serverpath);
			// } else {
			// 	alert("本地服务器启动失败");
			// }
		},
		addView: function(viewData) {
			//console.log(viewData);
			this.curCanvas.addVnode(viewData);
		},

		onCurStylesChange: function(styles) {
			this.curStyles = styles;
		},
		onCurPropsChange: function(props) {
			this.curProps = props;
		},
		setPanles: function(vnode) {
			var curView = viewList[vnode.name];
			this.styleOptions = curView.styles;

			console.log(this.propOptions);
			this.curStyles = vnode.styles;
			this.curProps = vnode.props;
			this.propOptions = curView.props;
			console.log(this.curProps);
		},
		getOptionsValue: function(options) {
			//this.optionsValue = {};
			var optionsvalue = {};
			for (var i in options) {
				optionsvalue[i] = options[i]["default"];
			}
			return optionsvalue;
			ze;
		},
		changeCurProps: function() {
			if (!!this.curElement) {
				var props = Object.assign({}, this.curProps);
				this.$set(this.curElement, "props", styles);
			}
		}
	}
};
</script>
