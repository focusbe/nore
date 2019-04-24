<template>
    <div class="page_wrap editproject_wrap">
        <publish ref="publish" :project="project"></publish>
        <div class="left_options">
            <pagemanage :project="project" @openPage="openPage"></pagemanage>
            <!-- <div class="options_section">
				<h2>活动配置</h2>
				<ul class="form_ul">
					<li><label for="">标题:</label><Input  v-model="projectInfo.title" type="text" size="small"></Input></li>
				</ul>
            </div>-->
        </div>
        <div class="center">
            <ul class="page_list">
                <li v-for="(item,key) in pagelist" :class="item.name==curPage?'cur':''">
                    <span @click="changePage(item.name)">{{item.name}}</span>
                    <Icon @click="closePage(key)" size="22" type="ios-close"/>
                </li>
            </ul>

            <div class="page_detail">
                <div class="top_options_bar" v-if="curPage">
                    <Button type="primary" @click="clearCanvas" title="清空">
                        <Icon type="md-trash" size="20"/>
                    </Button>
                    <Button type="primary" @click="savePage" title="保存">
                        <Icon type="md-sync" size="20"/>
                    </Button>
                    <Button @click="buildPage" type="primary" title="构建">
                        <Icon type="md-build" size="20" color/>
                    </Button>
                    <Button @click="publishCode" type="primary" title="发布">
                        <Icon type="md-cloud-upload" size="20" color/>
                    </Button>
                    <Button @click="showInFolder" type="primary" title="在文件夹中显示">
                        <Icon type="md-folder" size="20" color/>
                    </Button>
                    <my-psd
                        :actname="actname"
                        :pagename="curPage"
                        :device="curdevice"
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
            <editanimate></editanimate>
        </div>
        <div class="right_area">
            <div class="options_section">
                <h2>组件</h2>
                <ul class="element_list">
                    <li v-for="item in viewList" v-bind:key="item.name" v-if="!item.hidden">
                        <a @click="addView(item.name)" href="javascript:void(0)">
                            <Icon :type="item.icon" size="24" color/>
                            <p>{{item.label}}</p>
                        </a>
                    </li>
                </ul>
            </div>
            <panels-styles
                @onChange="onCurStylesChange"
                v-if="styleOptions"
                :options="styleOptions"
                :optionsValue="curStyles"
                title="样式布局"
            ></panels-styles>
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
<style lang="scss" scoped>
.page_wrap {
    display: flex;
    flex-direction: row;
}
</style>

<script>
import Server from "../../../libs/server";
import { Project } from "../../../libs/project";
import Files from "../../../libs/files";
import Vue from "vue";
import viewList from "../../elements/list.js";
import html2canvas from "html2canvas";
import mySocket from "../../utli/mysocket";
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
            },
            animateLine:{}
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
    },
    mounted: function() {
        var self = this;
        document.onkeydown = function(e) {
            //对整个页面文档监听
            // var keyNum=window.event ? e.keyCode :e.which;
            // if(keyNum==8){
            //     self.deletecurElement();
            // }
        };
        //this.changePage();
        // setInterval(async ()=> {
        // 	if(!!this.curPage){
        // 		var res = await this.project.whoIsLatest(this.curPage);
        // 		console.log(res);
        // 	}
        // },3000);
    },
    computed: {
        curCanvas() {
            return this.$refs["canvas" + this.curPage][0];
		},
		curCanvasData(){
			console.log(this.curPage);
			if(!this.curPage){
				return null;
			}
		
			this.curCanvas.syncRoot();
			var curCanvasData = this.canvasDataList[this.curPage];
			return curCanvasData;
		},
        projectInfo() {
            return this.project.getInfo();
        },
        curPageInfo() {
            if (!!this.curPage && !!this.pagelist) {
                for (var i in this.pagelist) {
                    if (this.curPage == this.pagelist[i]["name"]) {
                        return this.pagelist[i];
                    }
                }
            }
            return null;
        }
    },
    methods: {
        async publishCode() {
            this.$refs["publish"].show();
        },
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
                canvasDataList[pagelist[i]["name"]] = null;
            }
            this.canvasDataList = canvasDataList;
            if (!this.curPage && !!pagelist[0]) {
                this.changePage(pagelist[0]["name"]);
            }
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
            //console.log(this.curPageInfo);

            this.changeDevice(this.curPageInfo.device);
			//var curCanvasData = this.canvasDataList[this.curPage];
			//this.saveScreenShot();
			// this.savePage(false);
        },
        showInFolder(){
            Files.openFolder(this.project.datadir);
        },
        async saveCurPage() {
            if(!!this.curCanvas){
                this.curCanvas.syncRoot();
            }
            
            var curCanvasData = this.canvasDataList[this.curPage];

            if (!!curCanvasData) {
                var rootJson = curCanvasData.toJson();

                let result;
                try {
                    var res = await this.project.savePage(this.curPage, {
                        tree: rootJson
                    });
                    result = res;
                } catch (error) {
                    result = false;
                }

                return result;
            }
            return true;
        },
        async saveScreenShot() {
            try {
				// console.log(this.curCanvasData);
				if(!this.curCanvasData){
					return;
				}
				var rootJson = this.curCanvasData.toJson();
                var total = this.elementNum(rootJson.childrens);
                if (total >= 5) {
                    let temcanvas = await html2canvas(
                        this.curCanvas.$el.firstChild,
                        { foreignObjectRendering: false ,logging:false}
                    );
                    let imgdata = temcanvas
                        .toDataURL("image/webp", 0.1)
                        .substring(23);
                    await this.project.savePreImg(imgdata);
                } else {
                    this.project.delPreImg();
                }
                //mySocket.sendTo('main','getlist')
            } catch (error) {}
        },
        elementNum(json) {
            let num = 0;
            if (!!json && typeof json == "object") {
                for (var i in json) {
                    num++;
                    if (!!json[i].childrens) {
                        num += this.elementNum(json[i].childrens);
                    }
                }
            }
            return num;
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
			this.saveScreenShot();
			this.saveCurPage();
        },
        savedesign() {},
        clearCanvas() {
            this.curCanvas.clearCanvas();
		},
        async savePage(tip = true) {
			this.saveScreenShot();
            var lastest = await this.project.whoIsLatest(this.curPage);
            if (lastest == "origin") {
                var result = await new Promise((resolve, reject) => {
                    this.$Modal.confirm({
                        title: "Nore",
                        okText: "同步并保存",
                        cancleText: "取消",
                        content:
                            "<p>当前页面不是已通过源代码改动，是否覆盖</p>",
                        loading: false,
                        onOk: async () => {
                            var result = await this.saveCurPage();
                            if (tip) {
                                if (result) {
                                    this.$Message.success("保存成功");
                                } else {
                                    this.$Message.error("保存失败");
                                }
                            }
                            resolve(result);
                        },
                        onCancel: () => {
                            resolve(false);
                        }
                    });
                });
                return result;
            } else {
                var result = await this.saveCurPage();
                if (tip) {
                    if (result) {
                        this.$Message.success("保存成功");
                    } else {
                        this.$Message.error("保存失败");
                    }
                }
                return result;
            }
            
        },
        async buildPage() {
            var hasBuildFile = await this.project.hasBuildFile(this.curPage);
            //console.log(hasBuildFile);
            if (!!hasBuildFile) {
                this.$Modal.confirm({
                    title: "Nore",
                    okText: "确认覆盖",
                    cancleText: "取消",
                    loading: false,
                    content: "<p>继续构建将会覆盖原有代码，是否继续覆盖？</p>",
                    onOk: async () => {
                        setTimeout(async () => {
                            var res = await this.savePage(false);
                            if (res) {
                                var res2 = await this.project.buildPage(
                                    this.curPage
                                );

                                if (res2) {
                                    this.$Message.success("构建成功");
                                } else {
                                    this.$Message.error("构建失败");
                                }
                                //this.$Modal.remove();
                            } else {
                                this.$Message.error("保存页面失败导致构建失败");
                                // this.$Modal.remove();
                            }
                        }, 600);
                    },
                    onCancel: () => {}
                });
            } else {
                var res2 = await this.project.buildPage(this.curPage);
                if (res2) {
                    this.$Message.success("构建成功");
                } else {
                    this.$Message.error("构建失败");
                }
            }
        },
        async reloadPage() {
            var res = await this.project.fileToDb(this.curPage);

            return res;
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
            this.curStyles = vnode.styles;
            this.curProps = vnode.props;
            this.propOptions = curView.props;
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
