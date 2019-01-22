
// console.log('Worker-' + process.pid + ': Hello world.')
// process.on('message', (msg) => {
//     console.log('[Worker] Received message from master: ' + msg)
//     process.send('Hi master.')
// })

class saveImg{
    constructor(){
        this.pool = [];
        this.oldLength = this.pool.length;

        this.timeout = 3000;
    }
    addimg(imgObj){
        if(!imgObj){
            return;
        }

        this.pool.push(imgObj);
    }
    _checkAndSave(){
        
    }
}
