<template>
	<div>
		<Upload
		 multiple
		 :show-upload-list="false"
		 type="drag"
		 :before-upload="upload"
		 action="javascript:void(0)"
		>
			<slot>
				<Button icon="ios-cloud-upload-outline">Upload files</Button>
			</slot>
		</Upload>
	</div>
</template>
<style lang="scss" scoped>
</style>
<script>
export default {
	name: "myupload",
	computed: {},
	props: {},
	data() {
		return {
			list: {}
		};
	},
	created() {},
	methods: {
		async getList() {
			var list = await this.assets.getList();
			// console.log('获取list');
			this.list = list;
		},
		async upload(file) {
			try {
				var res = await this.assets.upload(file.path);
				if (res) {
					alert("上传成功");
				}
				await this.getList();
			} catch (error) {
				var msg;
				if (typeof error == "object") {
					msg = error.msg | error.message | "未知错误";
				}
				msg = error;
				alert(msg);
			}
			return false;
		}
	}
};
</script>


