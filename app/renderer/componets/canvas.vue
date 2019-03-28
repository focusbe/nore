
<script>
import { Position } from "./lib";
import viewList from "../elements/list.js";
import { vnode } from "./vnode";
import { hoverStyles } from "../configs";
import $ from "jquery";
import path from "path";
import Configs from "../../libs/configs";
var jsx = require("jsx-transform");

var viewObj = viewList;
var curviewObj = null;

export default {

	created: function() {
		this.rootvnode = new vnode(viewList['root'], { overflow: "auto" }, null);
		this.curvnode = this.rootvnode;
		this.projectPath = this.isssr?'../': path.resolve(Configs.getItem("workshop"),this.projectname);
		console.log(this.projectPath);
		this.initFromTree(this.canvasData.tree);
		this.$emit("onChange", "curvnode", this.curvnode);
		
	}, 
	mounted(){
		
	},
	methods: {
		initFromTree(tree) {
			this.curvnode = this.rootvnode;
			this.rootvnode.childrens = [];
			if(!!tree){
				this.addTreenodes(tree.childrens,this.rootvnode);
			}
			this.refresh();
			console.log(this);
		},
		clearCanvas() {
			this.$set(this.rootvnode, "childrens", []);
			this.refresh();
		},
		addTreenodes(treenodes, curvnode) {
			if (!curvnode) {
				curvnode = this.rootvnode;
			}
			if (Array.isArray(treenodes)) {
				var curnode;
				for (var i in treenodes) {
					curnode = treenodes[i];
					if (curnode.view == "button") {
						curnode.view = "my-button";
					}
					console.log(curnode);
					var newnode = new vnode(
						viewObj[curnode.view],
						curnode.styles,
						curnode.props,
						this.isssr,
						this.projectPath
					);
					if (!!curvnode.childrens) {
						curvnode.childrens.push(newnode);
					}
					if (!!curnode.childrens && curnode.childrens.length > 0) {
						this.addTreenodes(curnode.childrens, newnode);
					}
				}
			} else if(!!treenodes){
				this.addTreenodes([treenodes], curvnode);
			}
			// this.changeCurVnode(newnode);
			// this.$emit("onChange", "root", this.rootvnode);
			// this.$emit("onChange", "curvnode", this.curvnode);
		},
		addVnode: function(viewdata) {
			var newnode = new vnode(viewdata, null, null);
			this.curvnode.push(newnode);
			this.changeCurVnode(newnode);
			this.$emit("onChange", "root", this.rootvnode);
			this.$emit("onChange", "curvnode", this.curvnode);
		},
		syncRoot(){
			this.$emit("onChange", "root", this.rootvnode);
		},
		renderToString: function() {
			// var res = this.vnodeToJsx(this.rootvnode);
			// var test1 = jsx.fromString(res.jsx, {
			// 	factory: "createVnode"
			// });
		},
		resizeElement: function(delta, keepRatio) {
			//keepRatio = true;
			var oldwidth = this.startStyles.width;
			var oldheight = this.startStyles.height;
			var newwidth = oldwidth + delta.x;
			var newheight = oldheight + delta.y;
			if (!!keepRatio) {
				var widthradio = newwidth / oldwidth;
				var heightradio = newheight / oldheight;
				var ratio = widthradio;
				newwidth = parseInt(oldwidth * ratio);
				newheight = parseInt(oldheight * ratio);
			}
			this.$set(this.curvnode.styles, "width", newwidth + "px");
			this.$set(this.curvnode.styles, "height", newheight + "px");
		},
		clearHoverStyles: function() {
			if (!!this.curvnode) {
				this.curvnode.changeStyles(this.curvnode.styles);
			}
		},
		movePosition: function(delta) {
			if (isNaN(parseInt(this.curvnode.styles.x))) {
				this.$set(this.curvnode.styles, "x", 0);
			}
			if (isNaN(parseInt(this.curvnode.styles.y))) {
				this.$set(this.curvnode.styles, "y", 0);
			}
			this.realMove(delta);
		},
		realMove: function(delta) {
			// if(!this.startStyles||!typeof(this.startStyles['x'])=='undefined'){
			//     alert(11);
			//     return;
			// }
			this.$set(
				this.curvnode.styles,
				"x",
				parseInt(this.startStyles["x"]) + delta.x + "px"
			);
			this.$set(
				this.curvnode.styles,
				"y",
				parseInt(this.startStyles["y"]) + delta.y + "px"
			);
		},
		bindMouse: function() {
			var _this = this;
			var body = $("body")[0];
			body.addEventListener("mousemove", function(event) {
				event.preventDefault();
				_this.mouseMove(event);
				event.cancelBubble = true;
			});
			body.addEventListener("mouseup", function(event) {
				event.preventDefault();
				_this.mouseUp(event);
				event.cancelBubble = true;
			});
		},
		changeMouseStyle: function(event, curusor) {
			event.preventDefault();
			$(event.target).css("cursor", curusor);
		},
		mouseDown: function(event, vnode) {
			event.preventDefault();
			event.stopPropagation();
			this.changeMouseStyle(event, "move");
			this.isdmousedown = true;
			this.startPos = new Position(event.clientX, event.clientY);
			this.startStyles = {
				width: this.curvnode.styles.width,
				height: this.curvnode.styles.height,
				x: this.curvnode.styles.x,
				y: this.curvnode.styles.y
			};
			var $el = $(this.curvnode.getVueNode().elm);
			if (this.startStyles.width.toString().indexOf("%") > -1) {
				this.startStyles.width = $el.width();
			} else {
				this.startStyles.width = parseInt(this.startStyles.width);
			}
			if (this.startStyles.height.toString().indexOf("%") > -1) {
				this.startStyles.height = $el.height();
			} else {
				this.startStyles.height = parseInt(this.startStyles.height);
			}
		},
		incorner: function(event) {
			var rongcuo = 10;
			var target = $(event.target);

			var xNum =
				event.layerX < rongcuo
					? 1
					: target.width() - event.layerX < rongcuo
					? 3
					: 2;
			var yNum =
				event.layerY < rongcuo
					? 1
					: target.height() - event.layerY < rongcuo
					? 3
					: 2;
			return xNum + (yNum - 1) * 3;
		},
		mouseUp: function(event) {
			event.preventDefault();
			this.isDrage = false;
			this.isdmousedown = false;
			if (!this.isdmousedown) {
				return;
			}
			this.changeMouseStyle(event, "default");
			// this.curPos = new Position(event.clientX, event.clientY);
			// this.delta = this.curPos.sub(this.startPos);
			// //this.startPos = new Position(event.clientX, event.clientY);
			// this.movePosition(this.delta);
		},
		mouseMove: function(event) {
			event.preventDefault();
			var posAreanum = this.incorner(event);
			switch (posAreanum) {
				case 5:
					if (!this.isdmousedown) {
						this.changeMouseStyle(event, "default");
					} else {
						this.changeMouseStyle(event, "move");
					}
					break;
				case 2:
				case 8:
					this.changeMouseStyle(event, "s_resize");
					break;
				case 1:
				case 9:
					this.changeMouseStyle(event, "se-resize");
					break;
				case 3:
				case 7:
					this.changeMouseStyle(event, "ne-resize");
					break;
				default:
					this.changeMouseStyle(event, "default");
			}

			if (!this.isdmousedown) {
				return;
			}
			this.curPos = new Position(event.clientX, event.clientY);
			this.delta = this.curPos.sub(this.startPos);
			//this.startPos = new Position(event.clientX, event.clientY);
			if (posAreanum == 5 && !this.isDrage) {
				this.movePosition(this.delta);
			} else if (posAreanum == 9 || this.isDrage) {
				this.isDrage = true;
				this.resizeElement(this.delta);
			}
		},
		changeCurVnode: function(vnode) {
			if (this.curvnode == vnode) {
				return;
			}
			//this.curvnode.changeStyles(this.curvnode.styles);
			this.curvnode.isoptioning = false;
			this.curvnode = vnode;
			this.curvnode.isoptioning = true;
			this.$emit("onChange", "curvnode", this.curvnode);
			this.refresh();
		},
		runvnodeOnrendered: function(curvnode) {
			if (!!curvnode.viewname) {
				viewObj[curvnode.viewname].onRendered(curvnode);
			}

			if (curvnode.childrens) {
				for (var i in curvnode.childrens) {
					this.runvnodeOnrendered(curvnode.childrens[i]);
				}
			}
		},
		refresh: function() {
			// console.log('refresh');
			// console.log(this.version);
			// this.version = this.version + 1;
			// console.log(this.version);
		}
	},
	data: function() {
		return {
			version: 0,
			isdmousedown: false,
			startPos: null,
			curPos: null,
			delta: null,
			isDrage: false,
			curvnode: null,
			rootvnode: null,
			projectPath:''
		};
	},

	render: function(createElement) {
		// this.bindMouse();
		console.log("canvas render");
		
		var _this = this;
		var result =  createElement(
			"div",
			{
				style: {
					width:'100%',
					height:'100%'
				},
				// attrs: {
				// 	canvasversion: this.version
				// },
				on: {
					click: function(event) {
						_this.changeCurVnode(_this.rootvnode);
						// _this.curvnode.changeStyles(this.curvnode.styles);
						// _this.curvnode = _this.rootvnode;
						event.cancelBubble = true;
					},
					mousemove: function(event) {
						_this.mouseMove(event);
						event.cancelBubble = true;
					},
					mouseup: function(event) {
						_this.mouseUp(event);
						event.cancelBubble = true;
					}
				}
			},
			[this.rootvnode.render(createElement, _this)]
			// _this.rootvnode.childrens.map(function(currentValue, index, arr) {
			// 	console.log('children render');
			// 	return currentValue.render(createElement, _this);
			// })
		);
		return result;
	},

	updated: function() {
		console.log('canvasupdated');
	},
	mounted: function() {
		
	},
	watch: {
		// curStyles: {
		//     deep: true,
		//     handler: function() {
		//         var styles;
		//         // if(this.curvnode.name!='root'){
		//         //     styles = Object.assign({}, hoverStyles, this.curvnode.styles);
		//         // }
		//         // else{
		//         styles = Object.assign({}, this.curvnode.styles);
		//         //}
		//         this.curvnode.changeStyles(styles);
		//         this.refresh();
		//     }
		// },
		// curProps: {
		//     deep: true,
		//     handler: function() {
		//         if (this.curvnode.name != "root") {
		//             this.curvnode.changeProps(this.curProps);
		//             this.refresh();
		//         }
		//     }
		// }
	},
	props: {
		canvasData:{
			type: Object
		},
		pagename:'',
		projectname:'',
		isssr:false
	}
};
</script>