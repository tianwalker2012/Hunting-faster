/**
* One decision need to make, that is All the operation do not include commit. But I will expose a commit version. Make simple things simple, make complicated thing 
* Possible. 
**/
var configure = require("./configure").configure;
var exec = require('child_process').exec;
//One lesson learnt, make the object name match object name, make your life easier
var solrutil = {};

//All the character no need to convert
var UnReserved={
	"A":1,"B":1,"C":1,"D":1,"E":1,"F":1,"G":1,"H":1,"I":1,"J":1,"K":1,"L":1,"M":1,"N":1,"O":1,"P":1,"Q":1,"R":1,"S":1,"T":1,"U":1,"V":1,"W":1,"X":1,"Y":1,"Z":1,
	"a":1,"b":1,"c":1,"d":1,"e":1,"f":1,"g":1,"h":1,"i":1,"j":1,"k":1,"l":1,"m":1,"n":1,"o":1,"p":1,"q":1,"r":1,"s":1,"t":1,"u":1,"v":1,"w":1,"x":1,"y":1,"z":1,
	"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"0":1,
	"-":1,"_":1,".":1,"~":1
}

//Why I implement this, becuase the escape in the Node js will transfer the Chinese character, which make solr do NOT work, SO I implement this one
//Not because I have too much time to do stupid things like this.
function encode(str){
	var res = [];
	for(var i=0; i<str.length; i++){
		if(UnReserved[str.charAt(i)]){
			res.push(str.charAt(i));
		}else if(str.charAt(i) ===" "){
			res.push("+");
		}else if(str.charCodeAt(i) > 255){
			//Mean UTF-8 code keep it as it is
			res.push(str.charAt(i));
		}else{
			res.push("%");
			var hexStr = str.charCodeAt(i).toString(16);
			if(hexStr.length == 1){
				res.push("0");
			}
			res.push(hexStr);
		}
	}
	return res.join("");
}

solrutil.encode = encode;
//Keep it simple and stupid. Let's assume I just put all the message into index, even this is not the case,
//The combination job should be done outside of this things
solrutil.query = function(query, next){
	var queryStr = configure.solrquery;
	var arr = [];
	for(var pm in query){
	    if(pm == "q"){
		   arr.push(pm+"="+encode(query[pm]));
		}else{
		   arr.push(pm+"="+query[pm]);
		}
	}
	//console.log(queryStr+" Array join:"+arr.join("&"));
	queryStr += arr.join("&");
	//console.log("The final query string:"+queryStr);
	var options = {
			host: configure.solrhost,
			port: configure.solrport,
			path: queryStr,
			method: "GET",
			};
	var httpreq = require("http").request(options,
			function(resp){
				console.log("status code:"+resp.statusCode+",headers:"+JSON.stringify(resp.headers));
				resp.on("data", function(chunk){
						next(resp.statusCode, chunk);
				});
			});
	httpreq.on("error", function(e){
			next(configure.tcperror, e.message);
	});
	httpreq.end();
}

//The method will create the index
//I need to create a XML file on some configured directory, then submit it to the solr server.
//Then commit it. What should I return? the code from the Solr,
solrutil.createIndex = function(obj, next){
 	var params = {
		method: "POST",
		headers: {"Content-type":"application/json"},
		body: JSON.stringify(obj),
		path: configure.solrupdatejson
 	};
	httpCall(params, next);
}

solrutil.createIndexCurl = function(obj, next){
	var fullurl= "'http://"+configure.solrhost+":"+configure.solrport+configure.solrupdatejson+"'";
	console.log("fullurl:"+fullurl);
	var fs = require("fs");
	var fileName = "dynamic.json";
	var fullFileName = configure.solrxmlfolder+fileName;
	fs.writeFile(fullFileName, JSON.stringify(obj), function(err){
		//console.log("Result:"+err);
		if(err){
			next(err);
		}else{
			var cmd = "curl "+fullurl+" --data-binary @"+fullFileName + " -H 'Content-type:application/json'";
			console.log("Full command:"+cmd);
			exec(cmd, function(err, stdout, stderr){
				if(err){
					next(err);
				}else{
					//console.log("stdout:"+stdout);
					var resObj = JSON.parse(stdout);
					if(resObj.responseHeader.status == 0){
						next(null,stdout);
					}else{
						next("Unknown error", stdout);
					}
				}
			}); 
		}
	});
}

//This function is the result of refractor. When was the last time I geniuely feel some part of the code need to be refractored? When was the last time I feel 
//Some code need to be changed. When was the last time get myself into this flow state. Man I just can NOT remember. Enjoy coding, enjoy being a programmer who 
//create valuable software for this world. 
function httpCall(httpParameter, next){
	var options = {
		host: configure.solrhost,
		port: configure.solrport,
		path: httpParameter.path,
		method: httpParameter.method
		};
	
	if(httpParameter.headers){
		options.headers = httpParameter.headers;
	}
	var httpreq = require("http").request(options, function(resp){
		console.log("status code:"+resp.statusCode+",headers:"+JSON.stringify(resp.headers));
		resp.on("data", function(chunk){
			//console.log("Recieved data:"+chunk);
			next(resp.statusCode, chunk);
		});
	});
	
	httpreq.on("error", function(e){
		console.log("Encounter error:"+e.message);
		next(configure.tcperror, e.message);
	});
	
	if(httpParameter.body){
		httpreq.write(httpParameter.body);
	}
	httpreq.end();
}
//Will send a commit request to the Solr. 
//What if some error happened, Could I still get the callback?
//This is important, once I get the http and json part solved, there will be no issue for me to get the search done.
//URL encoding thing need to get done. Just run and check what's going on.
solrutil.commit = function(next){
	var httpreq = require("http").request({
		host: configure.solrhost,
		port: configure.solrport,
		path: configure.solrupdate,
		method: "POST",
		headers: {"Content-type":"application/xml"}
	}, function(resp){
		console.log("status code:"+resp.statusCode+",headers:"+JSON.stringify(resp.headers));
		resp.on("data", function(chunk){
			//console.log("Recieved data:"+chunk);
			next(resp.statusCode, chunk);
		});
	});
	
	httpreq.on("error", function(e){
		console.log("Encounter error:"+e.message);
		next(configure.tcperror, e.message);
	});
	httpreq.write("<commit />");
	httpreq.end();
}

//This is the simplest unit function, it will do the commit inside it
solrutil.remove = function(removesyntax, next){
	
}

//It will remove the object first, then create again
solrutil.update = function(obj, next){
	
}

	exports.solrutil = solrutil
