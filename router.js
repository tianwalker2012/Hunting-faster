function route(handle, pathname, request, response, postData){
    console.log("About to route a request path:"+pathname);
    if(typeof handle[pathname] === "function"){
	handle[pathname](request, response, postData);
    } else {
	response.writeHead(404,{"Content-Type":"text/plain"});
	response.write("Oops, we can't find what you requested:"+pathname);
	response.end();
	console.log("No request handler for "+pathname);
    }
}

exports.route = route;