var PORT = 8998;
var http = require('http');
var url = require('url');
var fs = require('fs');
var mine = require('./mine').types;
var path = require('path');

var server = http.createServer(function(request, response) {
    var pathname = url.parse(request.url).pathname;
    if(pathname.charAt(pathname.length - 1) == "/") {
        //如果访问目录
        pathname += "index.html"; //指定为默认网页
    }
    var realPath = path.join("../webtools/build/", pathname);
    //console.log(realPath);
    var ext = path.extname(realPath);
    ext = ext
        ? ext.slice(1)
        : 'unknown';
    fs.exists(realPath, function(exists) {
        if (!exists) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write("This request URL " + pathname + " was not found on this server.");
            response.end();
        } else {
            fs.readFile(realPath, "binary", function(err, file) {
                if (err) {
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end(err);
                } else {
                    var contentType = mine[ext] || "text/plain";
                    response.writeHead(200, {'Content-Type': contentType});
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
});
server.listen(PORT);
var socketio = require('socket.io')(server);
var socketPool = {};
var socketMap = {};
var memberToRoom = {};
var socket = socketio.on("connection",function(sock){
	//socketMap.push(sock);
	socketPool[sock.id] = sock;
	sock.on('pconline', function (data) {
		socketMap[sock.id] = [];
		socketMap[sock.id].push(sock.id)
		memberToRoom[sock.id] = sock.id;
		sock.emit('pconline success');
    });
	sock.on('mobileonline',function(roomid){
		if(socketMap[roomid]&&!!socketPool[roomid])
		{
			socketMap[roomid].push(sock.id);
			memberToRoom[sock.id] = roomid;
			sock.emit('mobileonline success');
		}
		else
		{
			sock.emit('mobileonline failed');
		}
	});
	sock.on('message', function (data) {

		var roomid = memberToRoom[sock.id];
		if(!roomid||!data)
		{
			return;
		}

		if(typeof(data['type'])=='undefined'){
			data['type'] = null;
		}

		if(data['type']=='pc'){

			var pcSocket = getSockObjById(roomid);
			if(pcSocket){
				pcSocket.emit('message',data);
			}
		}
		else if(data['type']=='mobile'){
			emitAllMemberBy(sock.id,'message',data,roomid);
		}
		else{

			emitAllMemberBy(sock.id,'message',data);
		}
    });
	sock.on('disconnect', function () {

		var roomid = memberToRoom[sock.id];
		if(roomid==sock.id){
			emitAllMemberBy(sock.id,'message',{event:'pc offline'});
		}
		deleteFromRoom(sock.id);
		if(!!socketPool[sock.id]){

		}
	});
});
function getSockObjById(id){
	try {
		var result = socketPool[id];
	} catch (e) {
		var result = false;
	} finally {

	}
	return result;
}
function deleteFromRoom(id){
	try {
		var roomid = memberToRoom(id);
	} catch (e) {
		var roomid = false;
	} finally {

	}
	if(roomid){
		try {
			var roomMap = socketMap[roomid];
		} catch (e) {
			var roomMap = false;
		} finally {

		}
		if(roomMap){
			for(var i in roomMap){
				if(id==roomMap[i]){
					roomMap.split(i,1);
					break;
				}
			}
		}
		try {
			delete memberToRoom[id];
			delete socketPool[id];
		} catch (e) {

		} finally {

		}
	}
}
function emitAllMemberBy(id,event,data,but){
	if(!!socketPool[id]&&!!memberToRoom[id]){

		var roomid = memberToRoom[id];
		var memberArray = socketMap[roomid];
		var memberSocket;
		if(typeof(but)=='string'){
			but = [but,id];
		}
		else if(typeof(but)=='object'){
			but.push(id);
		}
		else{
			but = [id];
		}
		for(var i in memberArray){
			for(var j in but){
				if(but[j]==memberArray[i]){
					continue;
				}
			}
			memberSocket = getSockObjById(memberArray[i]);
			memberSocket.emit(event,data);
		}
	}
}
console.log("Server runing at port: " + PORT + ".");
