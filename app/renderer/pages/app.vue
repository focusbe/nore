<template id="template">
	<div>
		<div class="mac_topbar">

		</div>
		<div class="win_topbar">

			<img
			 src="../images/norecode.png"
			 alt=""
			>
			<div class="menu_wrap">
				<ul>
					<li>
						<p>文件</p>
						<ul>
							<li>子菜单</li>
							<li>子菜单</li>
							<li>子菜单</li>
							<li>子菜单</li>
							<li>子菜单</li>
							<li>子菜单</li>
						</ul>

					</li>
					<li>
						<p>文件</p>
					</li>
					<li>
						<p>文件</p>
					</li>
					<li>
						<p>文件</p>
					</li>
					<li>
						<p>文件</p>
					</li>
				</ul>
			</div>
			<div class="drag_wrap"></div>

			<div class="right_wrap">
				<a
				 @click="minwin"
				 href="javascript:void(0)"
				>
					<Icon
					 :size="20"
					 type="md-remove"
					/></a>
				<a
				 @click="maxwin"
				 href="javascript:void(0)"
				>
					<Icon
					 :size="15"
					 type="md-square-outline"
					/></a>
				<a
				 @click="close"
				 href="javascript:void(0)"
				>
					<Icon
					 :size="20"
					 type="md-close"
					/></a>
			</div>
		</div>
		<router-view class="main_wrap">

		</router-view>
	</div>

</template>
<script>
import mySocket from "../utli/mysocket";
export default {
	data: function() {
		return {
			active: "home",
			newPopup: false
		};
	},
	updated: function() {},
	mounted: function() {
		var self = this;
		mySocket.on("new_project", function() {
			self.showNewProject();
        });
        mySocket.on("setMenu", (menuData)=>{
            this.menu = menuData;
		});
	},
	methods: {
		exit: function() {
			window.close();
		},
		showNewProject: function() {
			this.$router.push({ path: "/project/edit" });
		},
		closeNew: function() {
			this.newPopup = false;
		},
		close() {
			window.close();
		},
		minwin() {
			mySocket.sendTo("MAIN", "min", WINDOWTAG);
		},
		maxwin() {
			mySocket.sendTo("MAIN", "max", WINDOWTAG);
		}
	}
};
</script>

<style lang="scss">
.darwin {
	padding-top: 22px;
	.mac_topbar {
		display: block;
		position: fixed;
		top: 0px;
		left: 0px;
		width: 100%;
		-webkit-app-region: drag;
		height: 22px;
		z-index: 999999;
	}
	.win_topbar {
		display: none;
	}
	.project_list {
		margin-top: -6px;
	}
}
.drag_wrap {
	-webkit-app-region: drag;
	width: 100%;
}
.win_topbar {
	height: 30px;
	background: rgba($color: #3d474c, $alpha: 0.99);
	width: 100%;
	position: relative;
	border-bottom: 1px solid #282c2f;
	// z-index: 2000;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	width: 100%;
	& > * {
		flex-grow: 0;
		flex-shrink: 0;
	}
	& > .drag_wrap {
		flex-grow: 1;
		flex-shrink: 1;
		height: 100%;
	}
	.menu_wrap {
		margin-left: 5px;
		height: 100%;
		z-index: 1000;
		& > ul {
			& > li {
				// margin: 0 5px;
				padding: 0 10px;
				display: inline-block;
				vertical-align: top;
				position: relative;
				p {
					white-space: nowrap;
					line-height: 30px;
				}
				ul {
					background: #1e1f24;
					padding: 5px 0;
					box-shadow: #15161a 0px 0px 3px 1px;
					position: absolute;
					left: 0;
					display: none;
					& > li {
						padding: 0px 20px;
						line-height: 30px;
						white-space: nowrap;
					}
					& > li:hover {
						background: #2d313a;
					}
				}
			}
			& > li:hover {
				background: rgba(0, 0, 0, 0.1);
				ul {
					display: block;
				}
			}
		}
	}
}
.right_wrap {
	display: flex;
	align-items: center;
	justify-content: center;

	height: 100%;
	-webkit-app-region: none;
	a {
		margin: 0 4px;
		display: inline-block;
	}
}
.win_topbar {
	img {
		width: 25px;
		height: auto;
		position: relative;
	}
	span {
		font-size: 14px;
		line-height: 40px;
		text-indent: 10px;
		font-weight: bold;
		color: #1ac2ff;
	}
}
</style>