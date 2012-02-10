var verifier = require("./usercheck").verifier;
var mongoer = require("./mongonize");
var mongonizer = new mongoer.mongonizer("127.0.0.1",27017,"hr_system");
var res = {};
res.cookie = function(name, value){
    console.log("Somebody setup name:"+name+",value:"+value+" to cookie");
};

function testFind(){
mongonizer.find({name: "geng", password: "easy"}, function(err, docs){
	if(err){
		console.log("error:"+err);
	}else{
		console.log("docs:"+JSON.stringify(docs));
	}
}, "employee");
}

verifier.authenticate("geng","easy", null, function(user){
	console.log("user:"+JSON.stringify(user));
});


function authenticate(){
verifier.authenticate("geng","geng@123", res, function(user){
	if(user){
	    console.log("find");
	}else{
	    console.log("did NOT find");
	}
    });
verifier.authenticate("tian","kaka", res, function(user){
	if(user){
	    console.log("find");
	}else{
	    console.log("Do not find");
	}
    });
verifier.authenticate("geng","easy", res, function(user){
	if(user){
	    console.log("find");
	}else{
	    console.log("do NOT find");
	}
    });
var req = {"cookies":{"token":"geng:easy"}};
verifier.fetchuser(req, function(user){
	if(user){
	    console.log("Get user from token");
	}else{
	    console.log("Can NOT find user from the token");
	}
    });
}