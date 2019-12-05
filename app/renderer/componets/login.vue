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
			:model="userInfo"
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
					v-model="userInfo.username"
				/>
			</FormItem>
			<FormItem
				prop="password"
				label="密码"
			>
				<Input
					type="password"
					placeholder="请输入密码"
					v-model="userInfo.password"
				/>
			</FormItem>
		</Form>
	</Modal>
</template>
<script>
const { Projects, Project, Files } = require("../../libs/project.ts");
import mySocket from "../utli/mysocket";
import Configs from "../../libs/configs";
import axios from "axios";
export default {
	data() {
		return {
			gameList: {},
			scaList: {},
			modalshow: false,
			loading: false,
			userInfo: {
				username: window.localStorage.getItem("username") || "",
				password: window.localStorage.getItem("password") || ""
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
		isphone: function(str) {
			return /^[0-9]+$/.test(str);
		},
		submitData: function() {
			var self = this;
			var username = this.userInfo.username;
			if (!this.isphone(username) && username.indexOf("@") < 0) {
				username += "@ztgame.com";
			}
			this.$refs["form"].validate(async valid => {
				if (valid) {
					window.localStorage.setItem(
						"username",
						this.userInfo.username
					);
					window.localStorage.setItem("password", "");
					if (username.indexOf("@ztgame.com") > -1) {
						let response = await axios.get(
							`http://17must.com/card/info.json?password=${this.userInfo.password}&email=${username}`
						);
						if (!!response && !!response.data) {
							if (
								!!response.data.payload &&
								!!response.data.payload.userName
							) {
								// console.log(response.data.payload);
								window.localStorage.setItem(
									"password",
									this.userInfo.password
								);
								window.localStorage.setItem(
									"userInfo",
									JSON.stringify(response.data.payload)
								);
								this.$Message.success("登录成功");

								this.ok();
							} else {
								var msg = response.data.message || "未知错误";
								this.$Message.error(msg);
							}
							// console.log(response.data);
						} else {
							this.$Message.error("登录失败");
						}
					}
				} else {
					this.$Message.error("登录失败");
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
