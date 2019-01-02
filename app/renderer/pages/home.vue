<template id="template">
  <div class="page_wrap">
    <ul class="project_list">
      <li v-for="(item,key) in projectList" v-bind:key="key">
        <a @click="projectEdit(key)">
          <img src="images/bg.jpg" alt>
          <p>{{key}}</p>
        </a>
      </li>
      <li>
        <Button type="primary" @click="showprojectadd">
          <Icon type="ios-add-circle" :size="24"/>
        </Button>
      </li>
    </ul>
    <newproject ref="projectForm" @ok="newprojectok"></newproject>
  </div>
</template>
<script>
import Vue from "vue";
import newproject from "../componets/newproject.vue";
Vue.component("newproject",newproject);
export default {
  name: "home",
  data() {
    return {
      projectList: {}
    };
  },
  created: function() {
    this.getProjects();
  },
  methods: {
    getProjects: function() {
      var self = this;
    //   Projects.getlist(function(res) {
    //     if (res) {
    //       self.projectList = res;
    //     } else {
    //       alert("获取项目列表失败");
    //     }
    //   });
    },
    newprojectok: function() {
      //return false;
      this.getProjects();
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
