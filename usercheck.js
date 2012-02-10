var mongoer = require("./mongonize");
var configure = require("./configure").configure;
var mongonizer = new mongoer.mongonizer(configure.mongo.host, configure.mongo.port, configure.mongo.dbname);

var verifier = {};

//This method will be called by login POST to check if the username and login are valid or not
verifier.fetchuser = function(user, password, next){
    console.log("user:"+user+","+"password:"+password);
    mongonizer.find({"name":user, "password":password},function(err, docs){
	    if(err || docs.length == 0){
	    	console.log("Error authenticate user:"+err);
	    	next();
	    	return;
	    }
	    var record = docs[0];
	    next(record);
	},"employee");
}

//This method will be invoked in the login method. The name is really misleading. Because it is not login
//It is just to check if the parameter in the cookie, if not redirect to the default page. 
verifier.authenticate = function(req, res, next){
    var token = req.cookies.token || ":";
    var user = token.split(":")[0];
    var password = token.split(":")[1];
    mongonizer.find({"name":user, "password":password},function(err, docs){
	    if(err || docs.length == 0){
	    	console.log("Error authenticate user:"+err);
	    	res.cookie("referrer", req.url);
	    	next();
	    	return;
	    }
	    var record = docs[0];
	    //console.log("Call back get called:"+docs);
	    if(record){
		  next(record);
	    }else{
		//console.log("Did not find");
		  res.cookie("referer", req.url);
		  next();
	    }
	    
	},"employee");
}
exports.verifier = verifier;