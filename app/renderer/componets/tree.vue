<template>
    <ul class="filelist">
        <li v-for="(item,index) in list" v-bind:key="index">
            <p>
				<Icon :type="fileType(item.name)" ></Icon>
				<span>{{item.name}}</span>
				<my-tree v-if="item.children" :list="item.children"></my-tree>
			</p>
        </li>
    </ul>
</template>
<style lang="scss" scoped>
	.filelist{
		li{
			padding: 5px;
			cursor: pointer;
		}
		li:hover{
			background: #999;
			color: #fff;
		}
	}
</style>
<script>
export default {
	name:"my-tree",
	computed: {},
	props: {
		list:{}
	},
	data() {
		return {
            
        }
	},
	created(){
		
	},
	methods:{
		fileType(name){
			var namearr = name.split('.');
			if(namearr.lenght<2){
				return 'ios-folder'
			}
			else{
				var extname = namearr[namearr.length-1].toLowerCase();
				if(extname=='jpg'||extname=='png'||extname=='png'||extname=='ico'||extname=='psd'){
					return 'md-image'
				}
				else if(extname=='mp3'){
					return 'md-musical-note';
				}
				else if(extname=='mp4'){
					return 'ios-film'
				}
				return 'ios-document'
			}
			
		}
	}
};
</script>


