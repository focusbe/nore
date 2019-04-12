<template id="">
	<editconfig
	 ref="configform"
     isShow="1"
	 @ok="editconfigok"
	></editconfig>
</template>
<script>
import Vue from "vue";
import editconfig from "../../componets/editconfig.vue";
Vue.component("editconfig", editconfig);
import mySocket from "../../utli/mysocket";
export default {
    name:"config_edit",
	data() {
		return {
			
		};
    },
    methods:{
        editconfigok(){
            mySocket.sendAll('reloadPage');
            window.close();
        }
    }
};
</script>
