
var axios = require('axios');
class Games{
    static gamelist = null
    static async getGame(name){
        let gamelist = await this.getGameList();
        if(!!gamelist&&gamelist[name]){
            return gamelist[name];
        }
        return null;
    }
    static async getGameList(){
        if(!!this.gamelist){
            return this.gamelist;
        }
        let response = await axios.get("http://nore.focusbe.com/api/games.json");
        if (!response || !response.data) {
            return null;
        }
        this.gamelist = response.data;
        return this.gamelist;
    }
}
export default Games;
