var exec = require("child_process").exec,
    formidable = require("formidable"),
    sys = require("util"),
    querystring = require("querystring"),
    fs = require("fs");

function show(request, response, postData) {
    console.log("Show get called");
    fs.readFile("/Users/xietian/test.png","binary",function(error, file){
	    if(error){
		response.writeHead(500, {"Content-Type":"text/plain"});
		response.write(error+"\n");
		response.end();
	    }else{
		response.writeHead(200,{"Content-Type":"image/png"});
		response.write(file,"binary");
		response.end();
	    }
	});
}

function upload(request, response, postData){
    //console.log("Somebody try to upload to me, data is:"+postData);
    var form = new formidable.IncomingForm();
    var resp = response;
    //resp.writeHead(200,{"Content-Type":"text/plain"});
    // resp.write("Upload get called");
    //resp.end();
    var files = [], fields = [];
    //form.uploadDir = "/Users/xietian/";
    console.log("About to handling upload");
    form.on("field", function(field,value){
	    console.log(field,value);
	    fields.push([field,value]);
	}).on("file", function(field,file){
		console.log(field, file);
		files.push([field,file]);
	    }).on("end",function(){
		    console.log("Upload done");
		    res.writeHead(200,{"Content-Type":"text/plain"});
		    res.write("received fields:"+sys.inspect(fields));
		    res.end();
		});
    form.parse(request);
}

function uploadform(request, response){
    console.log("UploadForm get called");
    var body = '<html>'+
	'<head>'+
	'<meta http-equiv="Content-type" content="text/html; '+
	'charset=UTF-8" />'+
	'</head>'+
	'<body>'+
	'<form action="/upload" enctype="multipart/form-data" method="post">'+
	'<input type="text" name="title"><br>'+
	'<input type="file" name="upload" multiple="multiple"><br>'+
	'<input type="submit" value="Upload" />'+ ''.replace +
	'</form>'+
	'</body>'+
	'</html>';
    process.nextTick(function(){
	    console.log("I am in next tick");
	    response.writeHead(200,{"Content-Type":"text/html"});
	    response.write(body);
	    response.end();
	});
}

function download(request, response){
    console.log("Download handler get called");
    exec("ls -ltr",function(error, stdout , stderr){
	    response.writeHead(200,{"Content-Type":"text/plain"});
	    console.log("Standard output:"+stdout);
            response.write(stdout);
	    response.end();
	});
}

function login(request, response){
    console.log("Login get called");
    response.writeHead(200,{"Content-Type":"text/plain"});
    response.write("login successfully");
    response.end();
}

exports.upload = upload;
exports.login = login;
exports.download = download;
exports.uploadform = uploadform;
exports.show = show;