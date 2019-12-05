import User from "./user";
import Vuex from "vuex";
import Vue from "vue";
Vue.use(Vuex) 
const store = new Vuex.Store({
	modules: {
		User: User
	}
});
export default store;
