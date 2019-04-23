//const {Projects,Project,Files} = require('../main/libs/project');
const Configs = require('../libs/configs');
import Vue from "vue";
import Vuex from "vuex";
import VueRouter from "vue-router";
import App from "./pages/app.vue";

import "./css/style.scss";
import iView from "iview";
import "./css/themes.less";
import Elelments from "./elements/index.js";
// console.log(path);
import contentmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
import mySocket from "./utli/mysocket";
mySocket.on('reloadPage', function () {
    window.location.reload();
});
Vue.use(contentmenu)
Vue.use(Elelments);
Vue.use(Vuex);
Vue.use(iView);
Vue.use(VueRouter);
import Pages from './pages';
import components from './componets/install';
App.props = {
    pageUrls: {
        type: Array,
        default: function () {
            return Pages["pageUrls"];
        }
    }
};

const router = new VueRouter({
    mode: "hash",
    base: __dirname,
    routes: [
        {
            path: "/",
            name: "app",
            component: App,
            children: Pages["pagerouter"],
            redirect: { name: "home" }
        }

    ]
});
const store = new Vuex.Store({
    state: {
        count: 0

    },
    mutations: {
        increment(state) {
            state.count++;
        }
    }
});

var app = new Vue({
    router,
    el: "#app",
    store,
    template: `
  <div id="app" class="${process.platform}">
    <div class="mac_topbar"></div>
    <router-view class="view"></router-view>
  </div>
  `
}).$mount("#app");
