var browserSync = require("browser-sync");
class Server{
    static start(callback){
        if(!!this.server){
            callback(this.server);
            return true;
        }
        var self = this;
        this.server = browserSync.create('develop');
        this.server.init({
            open:false,
            ghostMode: {
                clicks: true,
                forms: true,
                scroll: false
            },
            server: __dirname+"/../workshop"
        },function(res){
            
            callback(self.server);
        });
    }
    static restart(){
        this.stop();
        this.start();
    }
    static stop(){
        if(!!this.server){
            this.server.exit();
            this.server = null;
        }
    }
    static status(){
        return !!this.server;
    }
}

module.exports = {Server};