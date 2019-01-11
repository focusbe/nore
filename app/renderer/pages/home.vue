<template id="template">
  <div class="page_wrap">
    <ul class="project_list">
      <li
        v-for="(item,key) in projectList"
        v-bind:key="key"
      >
        <a @click="projectEdit(key)">
          <img
            src="images/bg.jpg"
            alt
          >
          <p>{{key}}</p>
        </a>
      </li>
      <li>
        <Button
          type="primary"
          @click="showprojectadd"
        >
          <Icon
            type="ios-add-circle"
            :size="30"
          />
        </Button>
      </li>
    </ul>
    <newproject
      ref="projectForm"
      @ok="newprojectok"
    ></newproject>
    <editconfig
      ref="configform"
      @ok="editconfigok"
    ></editconfig>
  </div>
</template>
<script>
import Vue from "vue";
import newproject from "../componets/newproject.vue";
import editconfig from "../componets/editconfig.vue";
const {Projects,Project,Files} = require('../../libs/project');
import Configs from '../../libs/configs';
Vue.component("newproject", newproject);
Vue.component("editconfig", editconfig);
export default {
  name: "home",
  data() {
    return {
      projectList: {}
    };
  },
  mounted(){
    if(!Configs.getItem('workshop')){
      this.showEditConfig();
    }
    else{
      this.getProjects();
    }
    
  },
  created: function() {
    
  },
  methods: {
    getProjects: function() {
      var self = this;
      Projects.getlist(function(res) {
        if (res) {
          self.projectList = res;
        } else {
          alert("获取项目列表失败");
        }
      });
    },
    newprojectok: function() {
      //return false;
      this.getProjects();
    },
    showEditConfig(){
      this.$refs.configform.show();
    },
    editconfigok(){

    },
    showprojectadd: function() {
      this.$refs.projectForm.show();
    },
    projectEdit: function(id) {
      Socket.sendTo("MAIN", "open", {
        tag: "project_edit_" + id,
        hash: "#/project/edit?actname=" + id
      });
    }
  }
};
</script>
