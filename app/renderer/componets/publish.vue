<template>
	<Modal
	 v-model="modalshow"
	 title="发布代码"
	 @on-ok="ok"
	 :closable="true"
	 :fullscreen="false"
	 @on-cancel="cancel"
	 :loading="loading"
	 :footer="''"
	>
		<div slot="footer">
			<!-- <Button
			 @click="submitData"
			 type="primary"
            >提交</Button>-->
		</div>
		<div class="btn_list">
			<Button
			 @click="publishdev"
			 type="primary"
			>上传到测试服</Button>
			<Button
			 @click="publishonline"
			 type="primary"
			>上传到正式服</Button>
		</div>
		<!-- <Form
		 ref="form"
		 :model="configsData"
		 label-position="left"
		 :label-width="100"
		 :rules="configRules"
		>
			<FormItem
			 v-for="(item,key) in configObj"
			 v-bind:key="key"
			 :prop="key"
			 v-bind:label="item.name"
			>
				<Input
				 placeholder
				 v-model="configsData[key]"
				/>
				<input
				 class="fileinput"
				 v-bind:name="key"
				 @change="fileChange"
				 type="file"
				 webkitdirectory
				 directory
				>
				<Icon
				 class="foldericon"
				 type="ios-folder-open"
				 :size="30"
				/>
			</FormItem>
        </Form>-->
	</Modal>
</template>
<style lang="scss" scoped>
.btn_list {
	text-align: center;
}
</style>
<script>
const { Projects, Project, Files } = require("../../libs/project");
import Configs from "../../libs/configs";
export default {
    // name: "editconfig",
    data() {
        return {
            modalshow: false,
            loading: false,
            configsData: {},
            configObj: null,
            configRules: {
                workshop: {
                    required: true,
                    message: "请填写项目保存目录",
                    trigger: "blur"
                }
            }
        };
    },
    created: function() {
        this.modalshow = !!this.isShow;

        // for (var i in this.configObj) {

        // 	rules[i] = {
        // 		required: true,
        // 		message: "必填",
        // 		trigger: "blur"
        // 	};
        // 	this.configRules = rules;
        // }
    },
    computed: {},
    props: {
        isShow: false,
        project: null
    },
    methods: {
        async publishdev() {
            try {
                var has = await this.project.devHas();
                //console.log(has);
                if(has){
                    this.$Modal.confirm({
                        content:'测试服已有存在该项目并在：'+has+'修改过，是否确认上传',
                        onOk:async ()=>{
                            if (await this.project.publishDev()) {
                                this.$Message.success("发布成功");
                            } else {
                                this.$Message.error("发布失败");
                            }
                        }
                    })
                }
                else{
                    if (await this.project.publishDev()) {
                        this.$Message.success("发布成功");
                    } else {
                        this.$Message.error("发布失败");
                    }
                }
                
            } catch (error) {
                console.error(error);
                this.$Message.error(error.message || "发布失败");
            }
        },
        async publishonline() {
            try {
                if (await this.project.publishOnline()) {
                    this.$Message.success("发布成功");
                } else {
                    this.$Message.error("发布失败");
                }
            } catch (error) {
                console.error(error);
                this.$Message.error(error.message || "发布失败");
            }
        },
        show: function() {
            this.modalshow = true;
        },
        hide: function() {
            this.modalshow = false;
        },
        ok() {
            //this.$Message.info("Clicked ok");
            this.$emit("ok", true);
        },
        cancel() {
            //this.$Message.info("Clicked cancel");
        }
    }
};
</script>

