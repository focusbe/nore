<template>
	<div class="page_wrap">
		<div class="left_options">
			<div class="options_section">
				<h2>元素</h2>
				<ul class="element_list">
					<li v-for="item in viewList" v-bind:key="item.name" v-if="!item.hidden">
						<a @click="addView(item)" href="javascript:void(0)">
							<Icon :type="item.icon" size="24" color/>
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
				<my-psd :actname="actname" @savedesign="savedesign" @finish="psdfinish"></my-psd>
			</div>
			<div class="options_section">
				<h2>节点数</h2>
				<ul class="element_list"></ul>
			</div>
			<Button @click="clearCanvas">清空画布</Button>
		</div>
		<div class="top_options_bar">
			<Button @click="changeDevice('pc')" type="primary">
				<Icon type="ios-laptop" size="30" color/>
			</Button>
			<!-- <Button @click="changeDevice('pad')" type="primary">
				<Icon type="ipad" size="30" color/>
			</Button> -->
			<Button @click="changeDevice('phone')" type="primary">
				<Icon type="ios-phone-portrait" size="30" color/>
			</Button>

			<Button @click="preview" type="primary">
				<Icon type="arrow-right-b" size="30" color/>
			</Button>
		</div>
		<div class="canvas_outer">
			<div class="canvas" @keydown.delete="deletecur" v-bind:style="designeSize[curdevice]">
				<my-canvas ref="canvas" @onChange="onCanvasChange"></my-canvas>
			</div>
		</div>
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
		<div v-show="dragover" class="dragover"></div>
	</div>
</template>
<style>
</style>

<script>
import Vue from "vue";
import viewList from "../../elements/list.js";
import Canvas from "../../componets/canvas.vue";
import Options from "../../componets/options.vue";
import stylesPanels from "../../componets/panels/styles.vue";
import { Project } from "../../../libs/project";
import Assets from "../../componets/assets";
import PSD from "../../componets/psd";
Vue.component("my-options", Options);
Vue.component("styles-panel", stylesPanels);
Vue.component("my-canvas", Canvas);
Vue.component("assets", Assets);
Vue.component("my-psd", PSD);
export default {
	name: "project_edit",
	data() {
		return {
			prejectInfo: {},
			serverpath: null,
			actname: "",
			viewList: viewList,
			styleOptions: {},
			curStyles: {},
			curdevice: "phone",
			propOptions: {},
			curProps: {},
			canvasData: null,
			dragover: false,
			designeSize: {
				pc: {
					width: "1920px",
					height: "1080px"
				},
				phone: {
					width: "750px",
					height: "90%"
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
		var self = this;
		//console.log(this.$route);
		this.actname = this.$route.query.actname;
		var project = new Project(this.actname);
		this.project = project;
		// Server.start(function(res) {
		//   if (
		//     !!res &&
		//     !!res.instance &&
		//     !!res.instance.server &&
		//     !!res.instance.server._connectionKey
		//   ) {
		//     var port = res.instance.server._connectionKey;
		//     port = port.split(":");
		//     port = port[port.length - 1];
		//     self.serverpath = "http://localhost:" + port + "/" + self.actname;
		//   } else {
		//   }
		// });
		project.getinfo(function(res) {
			self.prejectInfo = res;
		});
		var body = document.getElementsByTagName("body")[0];
		body.ondrop = function(event) {
			event.preventDefault();
			self.dragover = false;
			console.log(event);
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
			console.log(event.target.className);
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
	},

	methods: {
		psdfinish(vnodetree){
			this.$refs.canvas.initFromTree(vnodetree);
		},
		savedesign(){

		},
		clearCanvas(){
			this.$refs.canvas.clearCanvas();
		},
		onCanvasChange: function(event, params) {
			switch (event) {
				case "root":
					this.canvasData = params;
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
			if (this.serverpath) {
				this.$refs.canvas.renderToServer(this.project, function(res) {
					if (res) {
						Socket.sendTo("MAIN", "open", {
							tag: "preview_" + self.actname,
							url: self.serverpath
						});
					} else {
						alert("预览失败");
					}
				});
				//window.open(this.serverpath);
			} else {
				alert("本地服务器启动失败");
			}
		},
		addView: function(viewData) {
			console.log(viewData);
			this.$refs.canvas.addVnode(viewData);
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
			this.propOptions = curView.props;
			console.log(this.propOptions);
			this.curStyles = vnode.styles;
			this.curProps = vnode.props;
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
