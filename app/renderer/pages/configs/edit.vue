<template id="">
	<editconfig class="editconfig"
	 ref="configform"
     isShow="1"
	 @ok="editconfigok"
	></editconfig>
</template>
<style lang="scss" scoped>
    
</style>

<script>
import mySocket from "../../utli/mysocket";
export default {
    name:"config_edit",
	data() {
		return {
			
		};
    },
    methods:{
        editconfigok(){
            mySocket.sendTo('MAIN','relaunch');
            window.close();
        }
    }
};
</script>
