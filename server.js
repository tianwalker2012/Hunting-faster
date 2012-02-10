var http = require("http");
var url = require("url");
   
function startOn(handlers,router){
    var onRequest = function(request, response){
	console.log("Request recieved,access url:"+request.url);
	var pathname = url.parse(request.url).pathname
        request.setEncoding("utf8");
        var postData = "";
	//request.addListener("data", function(chunk){
	//	postData += chunk;
		//console.log("Recieved chunk data:"+chunk);
	//    });
        //request.addListener("end", function(){
	    router.route(handlers,pathname,request,response,postData);
	//});

    //router.route(handlers,pathname,request,response);
	//console.log("The pathname is:"+pathname);
        //response.writeHead(200,{"Content-Type":"text/plain"});
	//response.write("阿米陀佛");
	//response.end();
    }
    http.createServer(onRequest).listen(8888);
    console.log("Sever started");
}

exports.start = startOn;
