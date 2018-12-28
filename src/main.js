import Vue from "vue";
import Vuex from "vuex";
import VueRouter from "vue-router";
import App from "./pages/app.vue";
import "./css/style.scss";
import "material-design-icons";
import iView from "iview";
import "./css/themes.less";
import Elelments from "./elements/index.js";
Vue.use(Elelments);
Vue.use(Vuex);
Vue.use(iView);
Vue.use(VueRouter);

function getPages() {
    var pages = require.context("./", true, /^\.\/pages\/(.*)\.vue$/);
    var pagerouter = [];
    var pageUrls = [];
    pages.keys().map(key => {
        let path = key.replace("./pages/", "").replace(".vue", "");
        let pathname = path.replace("/", "_");
        if (pathname.indexOf("public") == 0 || pathname.indexOf("app") == 0) {
            return;
        }
        pageUrls.push({
            name: pathname,
            path: path
        });
        pagerouter.push({
            name: pathname,
            path: path,
            ismenue: true,
            component: pages(key)
        });
        pagerouter.push({
            name: pathname + "_withparam",
            path: path + "/(.*)",
            ismenue: false,
            component: pages(key)
        });
    });
    return { pagerouter, pageUrls };
}

const Pages = getPages();

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
        { path: "/", redirect: { name: "home" } },
        {
            path: "/",
            name: "app",
            component: App,
            children: Pages["pagerouter"]
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
  <div id="app">
      <router-view class="view"></router-view>
  </div>
  `
}).$mount("#app");
