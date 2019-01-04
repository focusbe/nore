<template id="">
    <div id="app">
        <p>抢票软件</p>
        <router-view class="view"></router-view>
    </div>
</template>
<script>
    export default {
      name: 'app',
      data () {
        return {
          msg: 'Welcome to Your Vue.js App',
          fileList:''
        }
      }
    }
</script>
