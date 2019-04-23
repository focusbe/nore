<template>
	<div class="page_manage options_section">
		<h2>动画编辑<a>
            <Icon
				 size="22"
				 @click="addAnimate"
				 type="ios-add"
                 class="add_btn"
                 title="新建动画组"
				/>
            </a>
        </h2>
	</div>
</template>
<style lang="scss" scoped>
.add_btn{
    position: absolute;
    right: 0;
}


</style>

<script>
export default {
	props: {
		animateLine: Object
	},
	created: function() {
		//this.getPagelist();
	},
	data: function() {
		// return {
		// 	pagelist: []
		// };
	},
	render: function() {},
	mounted: function() {
		//alert(1);
	},
	updated: function() {},

	watch: {},
	methods: {
		
	}
};
</script>

