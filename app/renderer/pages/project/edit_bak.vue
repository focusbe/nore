<template>
	<div class="page_wrap">
		<div class="left_options">
			<div class="options_section">
				<h2>元素</h2>
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
			<br>
			<div class="options_section">
				<h2>素材</h2>
				<assets :actname="actname"></assets>
			</div>
			<br>
			<div class="options_section">
				<h2>PSD</h2>
				<my-psd
				 :actname="actname"
				 :pagename="curpageName"
				 @savedesign="savedesign"
				 @finish="psdfinish"
				></my-psd>
			</div>
			<div class="options_section">
				<h2>节点数</h2>
				<ul class="element_list"></ul>
			</div>
			<Button @click="clearCanvas">清空画布</Button>
			<Button @click="savePage">保存</Button>
			<Button @click="reloadPage">重载</Button>
		</div>
		<div class="center">
			<ul class="page_list">
				<li
				 v-for="(item,key) in pagelist"
				 :class="key==curPage?'cur':''"
				>
					<span @click="changePage(key)">{{item.name}}</span>
					<Icon
					 @click="deletePage(item.name)"
					 size="22"
					 type="ios-close"
					/>
				</li>
				<a>
					<Icon
					 size="22"
					 @click="addPage"
					 type="ios-add"
					/></a>
				<!-- <Tag
				 v-for="(item,key) in pagelist"
				 :color="key==curPage?'blue':'default'"
				 closable
				 v-on:click="changePage(key)"
				 @on-close="deletePage(item.name)"
				>{{item.name}}</Tag>
				<i-button
				 icon="ios-plus-empty"
				 type="dashed"
				 size="small"
				 @click="addPage"
				>添加页面</i-button> -->
			</ul>
			<div class="page_detail">
				<div v-for="(item,key) in canvasDataList" v-show="curPage==key"  :class="'canvas canvas'+key " v-bind:style="designeSize[curdevice]">
					<my-canvas :ref="'canvas'+key" :canvasData="item" @onChange="onCanvasChange"/>
				</div>
			</div>
		</div>

		<!-- <div class="top_options_bar">
			<Button
			 @click="changeDevice('pc')"
			 type="primary"
			>
				<Icon
				 type="ios-laptop"
				 size="30"
				 color
				/>
			</Button>
			<Button
			 @click="changeDevice('phone')"
			 type="primary"
			>
				<Icon
				 type="ios-phone-portrait"
				 size="30"
				 color
				/>
			</Button>

			<Button
			 @click="preview"
			 type="primary"
			>
				<Icon
				 type="logo-chrome"
				 size="30"
				 color
				/>
			</Button>
		</div>
		<div class="canvas_outer">
			<div
			 class="canvas"
			 @keydown.delete="deletecur"
			 v-bind:style="designeSize[curdevice]"
			>
				<my-canvas
				 ref="canvas"
				 @onChange="onCanvasChange"
				></my-canvas>
			</div>
		</div> -->
		<div class="right_area">
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
		<add-page
		 ref="pageForm"
		 :curProject="project"
		 @ok="addPageOk"
		></add-page>
	</div>
</template>
<style lang="scss" scoped>
.page_wrap {
	display: flex;
	flex-direction: row;
}
</style>

<script>
import Vue from "vue";
import viewList from "../../elements/list.js";
import Canvas from "../../componets/canvas.vue";
import Options from "../../componets/options.vue";
import stylesPanels from "../../componets/panels/styles.vue";
import { Project } from "../../../libs/project";
import Files from "../../../libs/files";
import Assets from "../../componets/assets";
import PSD from "../../componets/psd";
import Server from "../../../libs/server";
import addpage from "../../componets/addpage.vue";

Vue.component("my-options", Options);
Vue.component("styles-panel", stylesPanels);
Vue.component("my-canvas", Canvas);
Vue.component("assets", Assets);
Vue.component("my-psd", PSD);
Vue.component("add-page", addpage);
export default {
	name: "project_edit",
	data() {
		return {
			styleOptions: {},
			curStyles: {},
			curdevice: "phone",
			propOptions: {},
			curProps: {},
			canvasData:null,
			canvasDataList:{},
			//以上是cavas相关
			curPage: -1,
			prejectInfo: {},
			serverpath: null,
			actname: "",
			project: null,
			viewList: viewList,
			pagelist: [],
			dragover: false,

			designeSize: {
				pc: {
					width: "1920px",
					height: "1080px"
				},
				phone: {
					width: "750px",
					height: "100%"
				},
				pad: {
					width: "1024px",
					height: "1080px"
				}
			}
		};
	},

	created: function() {
		var self = this;
		let actname = this.$route.query.actname;
		this.actname = this.$route.query.actname;
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
	computed:{
		curCanvas(){
			return this.$refs['canvas'+this.curPage][0];
		},
		curPageInfo(){
			return this.pagelist[this.curPage];
		},
		curpageName(){
			if(!this.pagelist[this.curPage]){
				return '';
			}
			return this.pagelist[this.curPage]['name'];
		}
	},
	methods: {
		reloadFromJsx(){
			this.project.fileToDb(this.curPageInfo.name);
		},
		addPage() {
			this.$refs.pageForm.show();
		},
		getPagelist() {
			this.pagelist = [];
			var pagelist = this.project.getPageList();
			this.pagelist = pagelist;
			var canvasDataList = {};
			for(var i in pagelist){
				canvasDataList[i] = pagelist[i].tree;
			}
			this.canvasDataList = canvasDataList;
		},
		changePage(index) {
			//保存原来的信息
			//切换到页面；
			if(index<0||index>=this.pagelist||index==this.curPage){
				return;
			}
			if (this.curPage > -1) {
				this.saveCurPage();
			}

			if (!!this.pagelist && index >= 0 && index < this.pagelist.length) {
				this.curPage = index;
				this.getPageInfo(index);
			}
		},
		async saveCurPage() {
			this.curCanvas.syncRoot();
			var curCanvasData = this.canvasDataList[this.curPage];

			if (!!curCanvasData) {
				var rootJson = curCanvasData.toJson();
				try {
					var res = await this.project.savePage(this.curPageInfo.name, rootJson);
					if(!!res){
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
			let id = this.pagelist[key].id;
			// if(!this.canvasDataList){
			// 	this.canvasDataList={};
			// }
			// this.canvasData[key] = null;
			// this.curCanvas = this.canvasData[key];
			this.resetEditor();
			//console.log(this.$refs.canvas);
			// this.canvasData = this.curPageInfo.tree;
			this.curCanvas.initFromTree(this.curPageInfo.tree);
		},
		deletePage(key) {
			this.$Modal.confirm({
				title: "确认",
				content: "<p>确定删除" + key + "</p>",
				onOk: function() {
					var res = this.project.delPage(key);
					if (res == -1) {
						this.$Message.error("没有该页面存在");
					} else if (!!res) {
						this.$Message.success("删除成功");
					} else {
						this.$Message.error("删除失败");
					}
					this.getPagelist();
				}.bind(this),
				onCancel: () => {}
			});
		},
		addPageOk() {
			this.getPagelist();
		},
		psdfinish(vnodetree) {
			this.curCanvas.initFromTree(vnodetree);
		},
		savedesign() {},
		clearCanvas() {
			this.curCanvas.clearCanvas();
		},
		async savePage(){
			var result = this.saveCurPage();
			if(result){
				alert('保存成功');
			}
			else{
				alert('保存失败');
			}
		},
		reloadPage(){
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
			
			//console.log(this.propOptions);
			this.curStyles = vnode.styles;
			this.curProps = vnode.props;
			this.propOptions = curView.props;
			//console.log(this.curProps);
		},
		getOptionsValue: function(options) {
			//this.optionsValue = {};
			var optionsvalue = {};
			for (var i in options) {
				optionsvalue[i] = options[i]["default"];
			}
			return optionsvalue;
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
