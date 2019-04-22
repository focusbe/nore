<template id="template">
    <router-view class="main_wrap">
        
    </router-view>
</template>
<script>
import mySocket from '../utli/mysocket';
export default {
    data: function() {
        return {
            active: "home",
            newPopup: false
        };
    },
    updated: function() {},
    mounted: function() {
        var self = this;
        mySocket.on("new_project", function() {
            self.showNewProject();
        });
    },
    methods: {
        exit: function() {
            window.close();
        },
        showNewProject: function() {
            this.$router.push({path:'/project/edit'});
        },
        closeNew: function() {
            this.newPopup = false;
        }
    }
};
</script>

<style lang="css">

</style>