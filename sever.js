function start(){
    var http = require("http");
    var onRequest = function(request, response){
	console.log("Request recieved");
	response.writeHead(200,{"Content-Type":"text/plain"});
	response.write("阿米陀佛");
	response.end();
    }
    http.createServer(onRequest).listen(8888);
    console.log("Sever started");
}

exports.start = start;