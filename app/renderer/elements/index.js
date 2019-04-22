// var vueViews = require.context("./", true, /^\.\/(.*)\/(index|main)\.(js|vue)$/);
// console.log(vueViews);
// var vuecomponents = [];
// vueViews.keys().map(key => {
//   vuecomponents.push(vueViews(key));
// });
// const install = function(Vue) {
  
//   for (var key in vuecomponents) {
//     if (typeof vuecomponents[key]["beforeCreate"] != "undefined") {
//       console.log('install');
//       Vue.component(vuecomponents[key].name, vuecomponents[key]);
//     }
//   }
// };

// export default {
//   install
// };
