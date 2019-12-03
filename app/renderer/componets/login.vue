<template>
	<Modal
		v-model="modalshow"
		title="登录"
		@on-ok="ok"
		@on-cancel="cancel"
		:loading="loading"
		:footer="''"
	>
		<div slot="footer">
			<Button
				@click="submitData"
				type="primary"
			>提交</Button>
		</div>
		<Form
			ref="form"
			:model="projectInfo"
			label-position="left"
			:label-width="100"
			:rules="userRules"
		>
			<FormItem
				prop="username"
				label="用户名"
			>
				<Input
					placeholder="请填写用户名"
					v-model="User.username"
				/>
			</FormItem>
			<FormItem
				prop="password"
				label="密码"
			>
				<Input
					type="password"
					placeholder="请输入密码"
					v-model="User.password"
				/>
			</FormItem>
		</Form>
	</Modal>
</template>
<script>
const { Projects, Project, Files } = require("../../libs/project.ts");
import mySocket from "../utli/mysocket";
import Configs from "../../libs/configs";
export default {
	data() {
		return {
			gameList: {},
			scaList: {},
			modalshow: false,
			loading: false,
			User: {
				username: "",
				password: ""
			},
			userRules: {
				username: [
					{
						required: true,
						message: "请填写用户名",
						trigger: "blur"
					}
				],
				password: [
					{
						required: true,
						message: "请填写密码",
						trigger: "blur"
					}
				]
			}
		};
	},
	created: function() {
		var self = this;
	},
	props: {},
	methods: {
		validateTitle: function(rule, value, callback) {
			var re = new RegExp("^[a-zA-Z0-9-_]+$");
			if (!value) {
				return callback(new Error("请填写项目名称"));
			} else if (!re.test(value)) {
				return callback(new Error("项目名称为英文或拼音"));
			} else {
				callback();
			}
		},
		submitData: function() {
			var self = this;
			this.$refs["form"].validate(valid => {
				if (valid) {
					let response = await axios.get("http://17must.com/card/info.json?password=&email=");
					if (!!response && !!response.data) {
						return response.data;
					}
					return {};
				} else {
					this.$Message.error("验证失败");
				}
			});
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
<style lang="scss">
</style>
