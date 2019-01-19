const childProcess = require('child_process');
const worker = childProcess.fork('./saveimg.js');
var i=0;
setInterval(function(){
    i++;
    worker.send({a:1,b:2});
},1000)
worker.on('message', (msg) => {
    console.log('[Master] Received message from worker: ' + msg)
});
// setTimeout(function(){
//     worker.kill();
// },6000);