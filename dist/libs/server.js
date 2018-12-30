var browserSync = require("browser-sync");
var Server = /** @class */ (function () {
    function Server() {
    }
    Server.start = function (callback) {
        if (!!this.server) {
            callback(this.server);
            return true;
        }
        var self = this;
        this.server = browserSync.create('develop');
        this.server.init({
            open: false,
            ghostMode: {
                clicks: true,
                forms: true,
                scroll: false
            },
            server: __dirname + "/../workshop"
        }, function (res) {
            callback(self.server);
        });
    };
    Server.restart = function () {
        this.stop();
        this.start();
    };
    Server.stop = function () {
        if (!!this.server) {
            this.server.exit();
            this.server = null;
        }
    };
    Server.status = function () {
        return !!this.server;
    };
    return Server;
}());
module.exports = { Server: Server };
