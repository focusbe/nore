var jsonfile = require('jsonfile');
var Configs = {
    gameList: function () {
        var configfile = __dirname + "/../config/games.json";
        console.log(configfile);
        return jsonfile.readFileSync(configfile);
    }
};
module.exports = { Configs: Configs };
