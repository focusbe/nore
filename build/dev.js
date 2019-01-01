const { exec } = require('child_process');
const path = require('path');
var electronPro;

const renderer = exec('npm run webpack-dev', {
    cwd: path.resolve(__dirname, '../'),
    windowsHide: false
});
renderer.stdout.on('data', (data) => {
    // startmain.kill(1);
    console.log(`rendere: ${data}`);
    if (data.indexOf('Built at:') > -1) {
        const startmain = exec('npm run start-main', {
            cwd: path.resolve(__dirname, '../'),
            windowsHide: false
        });
        startmain.stdout.on('data', (data) => {
            // startmain.kill(1);
            if (data.indexOf('Built at:') > -1) {
                if (!!electronPro) {
                    electronPro.kill();
                }
                electronPro = exec('npm run electron', {
                    cwd: path.resolve(__dirname, '../'),
                    windowsHide: false
                });
                electronPro.stdout.on('data', (data) => {
                    console.log(`electron: ${data}`);
                });
                electronPro.stderr.on('data', (data) => {
                    console.log(`electron-data: ${data}`);
                });
                electronPro.on('close', (code) => {
                    console.log(`electron退出：${code}`);
                });
            }
            console.log(`main: ${data}`);

        });
        startmain.stderr.on('data', (data) => {
            //console.log(`main-data: ${data}`);
        });
        startmain.on('close', (code) => {
            console.log(`main退出：${code}`);
        });



    }
});
renderer.stderr.on('data', (data) => {
    console.log(`renderer-data: ${data}`);
});
renderer.on('close', (code) => {
    console.log(`renderer退出：${code}`);
});