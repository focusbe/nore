<template>
	<div class="page_manage options_section">
		<h2>页面管理<a>
            <Icon
				 size="22"
				 @click="addPage"
				 type="ios-add"
                 class="add_btn"
                 title="新建页面"
				/>
            </a>
        </h2>
		<ul class="options_wrap">
			<li v-for="(item,key) in pagelist">
				<span @dblclick="openPage(item)">{{item.name}}</span>
				<Icon
                title="删除"
				 @click="deletePage(item.name)"
				 size="22"
				 type="ios-trash"
                 class="delete"
				/>
			</li>
		</ul>
		<add-page
		 ref="pageForm"
		 :curProject="project"
		 @ok="addPageOk"
		></add-page>
	</div>
</template>
<style lang="scss" scoped>
.add_btn{
    position: absolute;
    right: 0;
}
.page_manage {
    ul{
        li{
            line-height: 30px;
            position: relative;
            text-indent: 20px;
            span{
                display: block;
            }
            .delete{
                cursor: pointer;
                position: absolute;
                right: 0;
                top: 5px;
            }
        }
        li:hover{
            opacity: 0.8;
        }
    }
}
</style>

<script>
export default {
	props: {
		project: Object
	},
	created: function() {
		this.getPagelist();
	},
	data: function() {
		return {
			pagelist: []
		};
	},
	render: function() {},
	mounted: function() {
		//alert(1);
	},
	updated: function() {},

	watch: {},
	methods: {
		addPage() {
			this.$refs.pageForm.show();
		},
		addPageOk() {
			this.getPagelist();
        },
        hasPage(){

        },
		openPage(pageinfo) {
            
            this.$emit('openPage',pageinfo);
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
		getPagelist() {
            console.log('11111');
			this.pagelist = [];
			var pagelist = this.project.getPageList();
            this.pagelist = pagelist;
            this.$emit('getPageList',pagelist);
		}
	}
};
</script>

