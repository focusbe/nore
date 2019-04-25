<template>
	<div class="timeline">
		<span
		 v-for="i in framesNum"
		 :key="i"
		 @click="selected(i)"
		 v-contextmenu:contextmenu
		 :class="!!selectStatus[i]?'selected':'1'"
		>
			<em v-if="getFrame(i)"></em>
		</span>
		<v-contextmenu
		 ref="contextmenu"
		 @contextmenu="onContextMenu"
		>
			<v-contextmenu-item
			 v-for="(item,index) in curContextMenu"
			 @click="contextMenuClicked(item)"
			>{{item.label}}</v-contextmenu-item>
		</v-contextmenu>
		<Modal
		 v-model="modalshow"
		 title="添加补间动画"
		 :footer="''"
		>
			<div slot="footer">
				<Button
				 @click="cofimGapFun"
				 type="primary"
				>确定</Button>
			</div>
			<Form
			 ref="form"
			 :model="funInfo"
			 label-position="left"
			 :label-width="100"
			>
				<FormItem
				 prop="name"
				 label="动画名称"
				>
					<Select v-model="funInfo.name">
						<Option
						 v-for="(item, key) in funlist"
						 :value="item"
						 :key="key"
						>{{item}}</Option>

					</Select>
				</FormItem>
			</Form>
		</Modal>
        <svg width="256" height="112" viewBox="0 0 256 112">
        <path fill="none" stroke="currentColor" stroke-width="1" d="M8,56 C8,33.90861 25.90861,16 48,16 C70.09139,16 88,33.90861 88,56 C88,78.09139 105.90861,92 128,92 C150.09139,92 160,72 160,56 C160,40 148,24 128,24 C108,24 96,40 96,56 C96,72 105.90861,92 128,92 C154,93 168,78 168,56 C168,33.90861 185.90861,16 208,16 C230.09139,16 248,33.90861 248,56 C248,78.09139 230.09139,96 208,96 L48,96 C25.90861,96 8,78.09139 8,56 Z"></path>
      </svg>
        <svg width="580" height="400" viewBox="0 0 580 400" class="mysvg"><path xmlns="http://www.w3.org/2000/svg" id="svg_1" d="m100.999999,145.499999c51,60 106,44 139,17c33,-27 64,-36 95,-1c31,35 -19,117 6,61c25,-56 70,-62 85,-58" opacity="1" stroke-width="1" stroke="#ffffff" fill="none"/></svg>
	</div>
</template>
<style lang="scss" scoped>
.timeline {
	white-space: nowrap;
	& > span {
		display: inline-block;
		width: 8px;
		height: 16px;
		box-sizing: border-box;
		border: 1px solid #555555;
		background: #494949;
		& > em {
			display: inline-block;
			width: 6px;
			height: 6px;
			border-radius: 3px;
			border: 1px solid #000;
			vertical-align: middle;
			position: relative;
			top: -3px;
		}
	}

	& > span:nth-child(5n + 0) {
		background: #4c4c4c;
	}
	& > span.selected {
		background: #9b771c;
	}
}
</style>

<script>
// const { remote } = require("electron");
// const { Menu, MenuItem } = remote;

// //右键餐单
// const menu = new Menu();
// menu.append(
// 	new MenuItem({
// 		label: "放大",
// 		click: function() {
// 			console.log("item 1 clicked");
// 		}
// 	})
// );
// menu.append(new MenuItem({ label: "创建补间动画" })); //选中
// menu.append(new MenuItem({ type: "separator" })); //分割线
// menu.append(new MenuItem({ label: "缩小", type: "checkbox", checked: true })); //选中

// window.addEventListener("contextmenu", e => {
// 	// e.preventDefault();
// 	// menu.popup({ window: remote.getCurrentWindow() });
// });
import Anime from "animejs";
console.log(Anime);
export default {
	props: { element: null },
	created: function() {
		//this.getPagelist();
	},
	data: function() {
		return {
			funlist: ["spring", "linear", "easeInQuad"],
			modalshow: false,
			framesNum: 200,
			frames: {},
			gapfun: [],
			zone: [],
			curFrameIndex: -1,
			selectStatus: {},
			funInfo: {
				name: ""
			}
		};
	},
	render: function() {},
	mounted: function() {
		//alert(1);
	},
	updated: function() {},
	watch: {},
	computed: {
		curContextMenu() {
			var index = this.curFrameIndex;
			console.log(index);
			var menu = [];
			if (this.getFrame(index)) {
				menu = [
					{ label: "删除关键帧", method: "delFrame", value: index }
				];
			} else {
				menu = [
					{ label: "插入关键帧", method: "addFrame", value: index }
				];
			}

			// if(this.zoneIndex(index)){
			//     menu.push({label:'删除轨迹动画',method:'delZone',value:this.zoneIndex(index)});
			// }
			// else {
			//     menu.push({label:'添加轨迹动画',method:'delZone',value:this.zoneIndex(index)});
			// }
			if (this.getGapFun(index)) {
				menu.push({
					label: "删除补间动画",
					method: "delGapFun",
					value: this.getGapFun(index)
				});
			} else if (this.getGap(index)) {
				menu.push({
					label: "添加补间动画",
					method: "addGapFun",
					value: this.getGap(index)
				});
			}
			menu.push({
				label: "运行所有动画",
				method: "runall",
				value: 1    
			});

			return menu;
		}
	},
	methods: {
		onContextMenu(vnode) {
			this.curFrameIndex = vnode.key;
			// console.log(vnode.key);
		},
		runall() {
            var path = Anime.path('.mysvg path');
            Anime({
                targets:  this.element,
                translateX: path('x'),
                translateY: path('y'),
                rotate: path('angle'),
                easing: 'linear',
                duration: 2000,
                loop: true
            });
            return;
			var curDelay = 0;
			var tl = Anime.timeline({
				easing: "steps(1)",
				loop: false,
				update: function(anim) {
					console.log(anim.currentTime);
					
				},
				begin: function(anim) {
					
				},
				complete: function(anim) {
					
				}
			});
			var start = 0;
			for (var i in this.frames) {
				let easing = "steps(1)";
				if (!!this.getease(start)) {
					easing = this.getease(start);
				}
				console.log(easing);
				let curAnimate = {
					targets: this.element,
					easing: easing
				};
				let Styles = this.frames[i];
				let run = Object.assign(curAnimate, Styles, {
					duration: i * 100 - curDelay
				});
				console.log(run);
				tl.add(run);
				start = i;
				// console.log(run);
				// Anime(run);
				// curDelay = i * 100;
			}
		},
		getGap(index) {
			var start = 0;
			var end = 0;
			for (var i in this.frames) {
				if (index <= i) {
					end = parseInt(i);
				} else {
					start = i;
				}
			}
			if (!!end && start < end) {
				return [start, end];
			}
			return null;
		},
		getFrame(timeIndex) {
			if (!!this.frames[timeIndex]) {
				return this.frames[timeIndex];
			}
			return null;
		},
		selected(index) {
			this.selectStatus = {};
			this.$set(this.selectStatus, index, true);
		},
		addFrame(timeIndex, styles) {
			this.$set(this.frames, timeIndex, {
				translateX: parseInt(Math.random() * 100),
				translateY: parseInt(Math.random() * 100)
			});
			// this.frames[timeIndex] = styles;
		},
		addZone(start, end, path) {
			this.zone.push({
				start: start,
				end: end,
				path: path
			});
			return this.zone.length - 1;
		},
		delZone(index) {
			this.zone.splice(index, 1);
		},
		contextMenuClicked(item) {
			if (item.method) {
				let str = "this." + item.method + "(" + item.value + ")";
				// // console.log(str);
				// eval(str)
				this[item.method](item.value);
			}
		},
		zoneIndex(timeIndex) {
			let index = [];
			for (var i in this.zone) {
				if (
					timeIndex >= this.zone.start &&
					timeIndex <= this.zone.end
				) {
					index.push(i);
				}
			}
			if (index.length == 0) {
				index = null;
			}
			return index;
		},
		delFrame(timeIndex) {
			this.$set(this.frames, timeIndex, null);
			//delete this.frames[timeIndex];
		},
		getGapFun(index) {
			let indexArr = [];
			for (var i in this.gapfun) {
				if (
					index > this.gapfun[i]["start"] &&
					index < this.gapfun[i]["end"]
				) {
					indexArr.push(i);
				}
			}
			if (indexArr.length == 0) {
				indexArr = null;
			}
			return indexArr;
		},
		addGapFun() {
			// this.gapfun.push({
			//     start:start,
			//     end:end
			// });
			this.modalshow = true;
		},
		delGapFun(index) {
			// this.zone.splice(index, 1);
			for (var i in this.gapfun) {
			}
		},
		cofimGapFun() {
			console.log(this.curFrameIndex);
			var curgap = this.getGap(this.curFrameIndex);
			if (!this.funInfo.name) {
				this.$Message.error("请选择过度函数");
				return;
			}
			if (!curgap) {
				this.$Message.error("没有检测到区间");
				return;
			}
			this.gapfun.push({
				start: curgap[0],
				fun: this.funInfo.name
			});
			// console.log(this.gapfun);
			this.modalshow = false;
		},
		getease(startIndex) {
			for (var i in this.gapfun) {
				console.log(this.gapfun[i]["start"]);
				console.log(startIndex);
				if (this.gapfun[i]["start"] == startIndex) {
					return this.gapfun[i]["fun"];
				}
			}
			return null;
		}
	}
};
</script>

