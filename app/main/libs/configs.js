
var jsonfile = require('jsonfile');
const Configs = {
    gameList(){
        var configfile = __dirname+"/../config/games.json";
        console.log(configfile);
        return jsonfile.readFileSync(configfile);
    }
}

export default Configs;