// const path = require('path');
// const {
//     spawn
// } = require('child_process');
// const ls = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install'],{
//     cwd:path.resolve(__dirname, '../')
// });
// ls.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
// });
const UI = require("readline-ui");
const ui = new UI();
ui.render('111');
ui.rl.on('SIGINT', function(){
    console.log(111);
});