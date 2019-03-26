<template>
	<ul class="filelist">
		<li
		 v-for="(item,index) in list"
		 v-bind:key="index"
		>
			<p @click="onSelect(item)">
				<Icon v-if="fileType(item.name)!='md-image'" :type="fileType(item.name)"></Icon>
				<img
				width="20"
				 v-if="fileType(item.name)=='md-image'"
				 :src="item.path"
				 alt=""
				>
				<span>{{item.name}}</span>
			</p>
			<my-tree
			 v-if="item.children"
			 :list="item.children"
			></my-tree>
		</li>
	</ul>
</template>
<style lang="scss" scoped>
.filelist {
	li p {
		padding: 5px;
		cursor: pointer;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		img{
			vertical-align: middle;
		}
	}
	li li {
		padding-left: 20px;
	}
	li p:hover {
		background: #999;
		color: #fff;
	}
}
</style>
<script>
export default {
	name: "my-tree",
	computed: {},
	props: {
		list: {}
	},
	data() {
		return {};
	},
	created() {
		
	},
	methods: {
		onSelect(item){
			console.log(item);
			this.$emit('onSelect',item);
		},
		fileType(name) {
			var namearr = name.split(".");
			if (namearr.lenght < 2) {
				return "ios-folder";
			} else {
				var extname = namearr[namearr.length - 1].toLowerCase();
				if (
					extname == "jpg" ||
					extname == "png" ||
					extname == "png" ||
					extname == "ico" ||
					extname == "psd"
				) {
					return "md-image";
				} else if (extname == "mp3") {
					return "md-musical-note";
				} else if (extname == "mp4") {
					return "ios-film";
				}
				return "ios-document";
			}
		}
	}
};
</script>


