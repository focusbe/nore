<template>
	<div class="editanimate options_section">
		<h2>动画编辑<a>
				<Icon
				 size="22"
				 @click="showAddModal"
				 type="ios-add"
				 class="add_btn"
				 title="新建动画组"
				/>
			</a>
		</h2>
		<ul>
			<timeline :element="curElement"></timeline>
			<li v-for="(item,key) in animateLine">
				<p @click="openAnimate(key)">
					<Icon
					 :size="12"
					 v-if="!animaShowStatus[key]"
					 type="md-arrow-dropright"
					/>
					<Icon
					 v-if="!!animaShowStatus[key]"
					 :size="12"
					 type="md-arrow-dropdown"
					/>
					<Icon
					 :size="12"
					 type="md-folder"
					/>
					<span>{{key}}</span>
				</p>
				
				<ul v-if="!!animaShowStatus[key]">
					<li v-for="(curanimate,animindex) in item['animates']">
						<Icon :size="12" type="md-albums" />
						<span class="name">{{curanimate.element.classname}}</span>
						<timeline></timeline>
					</li>
				</ul>
			</li>
		</ul>

		<Modal
		 v-model="modalshow"
		 title="添加动画组"
		 :footer="''"
		>
			<div slot="footer">
				<Button
				 @click="addAnimate"
				 type="primary"
				>添加</Button>
			</div>
			<Form
			 ref="form"
			 :model="animateInfo"
			 label-position="left"
			 :label-width="100"
			 :rules="pageRules"
			>
				<FormItem
				 prop="name"
				 label="名称"
				>
					<Input v-model="animateInfo.name" />
				</FormItem>

				<FormItem
				 prop="desc"
				 label="描述"
				>
					<Input v-model="animateInfo.desc" />
				</FormItem>
			</Form>
		</Modal>
	</div>
</template>
<style lang="scss" scoped>
.editanimate {
	min-height: 200px;
	position: relative;
}
.add_btn {
	position: absolute;
	right: 0;
}
</style>

<script>
export default {
	props: {},
	created: function() {
		//this.getPagelist();
	},
	data: function() {
		return {
			curElement:null,
			animateLine: {},
			animaShowStatus: {},
			animateInfo: {
				name: "",
				desc: ""
			},
			modalshow: false,
			pageRules: {
				name: [
					{
						required: true,
						message: "请填写动画名称",
						trigger: "blur"
					},
					{ validator: this.validateTitle, trigger: "blur" }
				]
			}
		};
	},
	render: function() {},
	mounted: function() {
		//alert(1);
	},
	updated: function() {},
	watch: {},
	methods: {
		changeCurElement(dom){
			console.log(dom);
			this.curElement = dom;
		},
		
		validateTitle: function(rule, value, callback) {
			var re = new RegExp("^[a-zA-Z0-9-_]+$");
			if (!value) {
				return callback(new Error("请填写动画名称"));
			} else if (!re.test(value)) {
				return callback(new Error("动画名称为英文或拼音"));
			} else if (!!this.animateLine[value]) {
				return callback(new Error("项目名称已存在"));
			} else {
				callback();
			}
		},
		addAnimate() {
			this.animateLine[this.animateInfo.name] = {
				desc: this.animateInfo.desc,
				animates: []
			};
			this.modalshow = false;
			this.animateInfo = {};
		},
		deleteAnimate(name) {
			if (!name) {
				return;
			}
			this.animateLine[name] = null;
			delete this.animateLine[name];
		},
		showAddModal() {
			this.modalshow = true;
		},
		openAnimate(name){
			if(!name){
				return;
			}
			// console.log(this.animaShowStatus[name] );
			this.$set(this.animaShowStatus,name,!this.animaShowStatus[name]);
			
		}
	}
};
</script>

