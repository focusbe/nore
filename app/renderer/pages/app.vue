<template id="template">
    <div class="layout" >
        <div class="mac_topbar"></div>
        <div class="content">
            <div class="body">
                
                <router-view class="view">
                    
                </router-view>
            </div>
        </div>
    </div>
</template>
<script>
// import mySocket from '../js/mysocket';
// console.log(mySocket);
// import $ from "jquery";
const Project = require('../../main/libs/project.js');
// var jsonfile = require("jsonfile");
// const fse = require("fs-extra");
// var co = require("co");
// var browserify = require("browserify");
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
        // Socket.on("new_project", function() {
        //     self.showNewProject();
        // });
    },
    methods: {
        exit: function() {
            window.close();
        },
        showNewProject: function() {
            
            //this.$router.push({path:'/project/edit'});
        },
        closeNew: function() {
            this.newPopup = false;
        }
    }
};
</script>

<style lang="css">

</style>