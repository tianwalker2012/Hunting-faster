var express = require("express");
var util = require("util");
var verifier = require("./usercheck").verifier;
var taskManager = require("./taskoperation").taskManager;
var configure = require("./configure").configure;
var submithandler = require("./submithandler").submithandler;
var solrutil = require("./solrutil").solrutil;
var exec = require('child_process').exec;
//var form = require('connect-form');
//Is this a good idea to maintain a global open database here? give a shot see where it goes. Enjoy
var mongoer = require("./mongonize");
var mongonizer = new mongoer.mongonizer("127.0.0.1",27017,"hr_system");


var app = express.createServer(
					  express.logger(),
					  express.bodyParser({uploadDir:"/tmp"}),
					  express.cookieParser()
);
app.register(".html", require("ejs"));
app.set("view engine", "ejs");
console.log("Current name:" + __dirname);
app.set("views", __dirname + "/views");

app.configure(
	      function(){
		  app.use(app.router);
		  app.use("/public",express.static(__dirname + "/public"));
		  app.use("/download",express.static(__dirname+"/download"));
		  app.use(
			  express.errorHandler(
					       {
						   dumpExceptions: true,
						       showStack: true
					       }
)
);
	      }
);

// Extract the parameter out of the URL
function extractParameter(paramStr){
    var pos = paramStr.indexOf("?");
    var res = {};
    if(pos >= 0){
	rest = paramStr.substring(pos+1, paramStr.length);
	//console.log("The rest is:"+rest);
	rest.split("&").forEach(function(item){
		pos = item.indexOf("=");
		var key = item.substring(0,pos);
		var value = item.substring(pos+1, item.length);
		//console.log(key+":"+value);
		res[key] = unescape(value);
	    });
    }
    return res;
}

app.post("/task/talent", function(req, res){
	console.log("request taskid:"+req.body.taskid);
	taskManager.fetchTalentInTask(req.body.taskid, function(tasks){
		res.render("talentintask.html", {layout:false, "tasks": tasks});
	    });
    });

app.get("/html5", function(req, res){
	console.log("The first html5");
	res.render("html5.html", {layout:false});
    });

//I hope I can remove the cookie by doing this.
app.get("/logout", function(req, res){
	var referer = req.headers.referer || "/";
	console.log("Referred:"+referer);
	res.cookie("token", "logout");
	res.redirect(referer);
    });

//Will provide a page to add account to database
app.get("/account", function(req, res){
	login(req, res, function(req, res, user){
	  //console.log("User info detail:"+JSON.stringify(user));
	  if(user.type !== "admin"){
	    res.cookie("referrer", req.url);
	    res.redirect("/login");
	  }
	  var params = extractParameter(req.url);
	  var eid = params.eid;
	  console.log("Parameter:"+JSON.stringify(params));
	  if(eid){
	    mongonizer.find({_id:eid}, function(err, record){
	    	var binds = {user:user};
	    	if(err){
	    		console.log("find employee id error:"+eid+", error:"+err);
	    		binds.errorDetail = err;
	    	}
	    	binds.result = record[0];
	    	res.render("account.html",{binds:binds});
	    },"employee");
	  }else{
	    res.render("account.html",{binds:{user:user}});
	  }
	});
});

//Will store the result to database.
app.post("/account", function(req, res){
	login(req, res, function(req, res, user){
	    if(user.type !== "admin"){//not admin, please login as admin, how represent this.
           res.cookie("referer", req.url);
           res.redirect("/login");
        }
	    var converted = submithandler.convert(configure.accounttemplate, req.body, {creator: user.name, created_time: new Date()});
	 	mongonizer.store(converted, function(err, stored){
	 		var binds = {stored:true, user:user};
	 		if(err){
	 			binds.errorDetail = err;
	 		}
	 		if(stored){
	 		    console.log("stored account:"+JSON.stringify(stored));
	 			binds.result = stored;
	 		}
	 		res.render("account.html", {binds:binds});
	 	}, "employee");
	 	
	});
}); 

//If have id pass in, it is modify otherwise it is add.
//This style not very intuitive, any way brutally go ahead, let it bite me.  
app.get("/modify", function(req, res){
   login(req, res, function(req, res, user) {
	 var params = extractParameter(req.url);
	 var modify = params.modify;
	 modify = true;
	 console.log("parameter:"+ JSON.stringify(params));
	 var errorDetail = null; //Will put error into the page to tell user what's just happened.
	 if(params.talentid){
		mongonizer.find({"_id":params.talentid}, function(err, record){
			if(err){
				console.log("Encounter error")
				errorDetail = err;
			}
			var result = null;
			if(record && record.length > 0){
			    console.log("get inside");
				result = record[0];
			}
			res.render("modify.html",{binds:{result:result, errorDetail:errorDetail, modify:modify, user:user}});
			
		},"talents");
	 }else{
		res.render("modify.html",{binds:{modify: modify, user:user}});
	}
	});
});

//The result of the modication will handled by this Method
app.post("/modify", function(req, res){
   login(req, res, function(req, res, user) {
   	 console.log("User:"+JSON.stringify(user));
     var params = extractParameter(req.url);
	 var modify = params.modify;
	 modify = true;
	 console.log("Modify parameter:"+ modify);
     if(!req.body._id){
        console.log("files json:"+JSON.stringify(req.files));
        req.body.attached_resume = req.files.upload.name;
     	var converted = submithandler.convert(configure.converttemplate, req.body, {creator: user.name, created_time: new Date()});
	 	mongonizer.store(converted, function(err, stored){
	 		var binds = {modify: modify, stored: true, user:user};
	 		if(err){
          		binds.errorDetail = err;
          		binds.result = converted;
	 		}else{
	 	  		binds.result = stored;
	 		}
	 		
	 		console.log("Stored:"+JSON.stringify(stored));
	 		solrutil.createIndex([stored],function(statusCode, indexResult){
	 		  binds.statusCode = statusCode;
	 		  binds.indexResult = indexResult;
	 		  var cmd = "mv "+req.files.upload.path+" "+configure.uploadStoredDir+req.files.upload.name;
	 		  exec(cmd, function(err, stdout, stderr){
	 		  	console.log("error:"+err+",stdout:"+stdout+",stderr:"+stderr);
	 		  	res.render("modify.html",{binds:binds});	 		  	
	 		  });

	 		});
	  	},"talents");
	 }else{
	 	mongonizer.find({"_id":req.body._id},function(err, docs){
	 		var fetched = docs[0];
	 		if(err || !fetched){
	 			console.log("Error:"+err+",fetched:"+JSON.stringify(fetched));
	 		}
	 		fetched = fetched || {};
	 		console.log("For _id:"+req.body._id+",Found:"+JSON.stringify(fetched));
	 		if(!fetched.changer){
	 			fetched.changer = [];
	 		}
	 		fetched.changer.push(user.name);
	 		
	 		fetched.updated_time = new Date();
	 		
	 		if(!fetched.changer_history){
	 			fetched.changer_history = [];
	 		}
	 		fetched.changer_history.push(new Date());
	 		req.body.attached_resume = req.files.upload.name;
	 		var converted = submithandler.convert(configure.converttemplate, req.body, fetched);
	 		console.log("For converted:"+JSON.stringify(converted));
	 	    mongonizer.store(converted, function(err, stored){
	 			var binds = {modify: modify, stored: true, user:user};
	 			if(err){
          			binds.errorDetail = err;
          			binds.result = converted;
	 			}else{
	 	  			binds.result = stored;
	 			}
	 			console.log("Updated:"+JSON.stringify(stored));
	 			solrutil.createIndex([stored],function(statusCode, indexResult){
	 		  		binds.statusCode = statusCode;
	 		  		binds.indexResult = indexResult;
	 		  		var cmd = "mv "+req.files.upload.path+" "+configure.uploadStoredDir+req.files.upload.name;
	 		        exec(cmd, function(err, stdout, stderr){
	 		  	       console.log("error:"+err+",stdout:"+stdout+",stderr:"+stderr);
	 		  	       res.render("modify.html",{binds:binds});	 		  	
	 		        });
	 		  		
	 			});
	  		},"talents");
	 		
	 	}, "talents");
	 }
	 });
});

app.get("/search", search);

//Make it as simple as possible
app.post("/search", search);

function search(req, res){
  login(req, res, function(req, res, user){
    var param = extractParameter(req.url);
    var solrutil = require("./solrutil").solrutil;
	var searchText = req.body.searchText;
	if(!searchText){
		searchText = param.searchText;
	}
	console.log("Search Text:" + searchText);
	var startStr = param.start || "0";
	var rowsStr = param.rows || ""+configure.numberPerPage;
	var start = parseInt(startStr);
	var rows = parseInt(rowsStr);
	console.log("searchText:"+searchText+",start:"+start+",rows:"+rows);
	if(searchText){
	    searchText = searchText.trim();
	    var salaryAsc = "/search?sort=salary%2basc&searchText="+solrutil.encode(searchText);
	    var salaryDesc= "/search?sort=salary%2bdesc&searchText="+solrutil.encode(searchText);
	    var ageAsc = "/search?sort=age%2basc&searchText="+solrutil.encode(searchText);
	    var ageDesc = "/search?sort=age%2bdesc&searchText="+solrutil.encode(searchText);
		solrutil.query({q:searchText, start:start, rows:rows}, function(code, data){
	   //res.send(data);
	  	var resultObj = null;
      	if(code == 200){
                        console.log("Returned data:"+data);
	  		resultObj = JSON.parse(data);
	  	}
	  	if(!resultObj){ //If no result for this query.
	  	   res.render("search.html", {binds:{user:user}});
	  	   return;
	  	}
	  	console.log("ResultObj:"+JSON.stringify(resultObj));
	  	var totalNum = resultObj.response.numFound;
	  	var currentEnd = start + rows;
	  	var nextPage = null;
	  	var prevPage = null;
	  	if(currentEnd < totalNum){
	  	    var nextStart = currentEnd;
	  		nextPage = "/search?start="+nextStart+"&rows="+rows+"&searchText="+solrutil.encode(searchText); 
	  		console.log("NextPage url:"+nextPage);
	  	}
	  	if(start > 0){
	  	    var prevStart = start - rows;
	  	    prevPage = "/search?start="+prevStart+"&rows="+rows+"&searchText="+solrutil.encode(searchText);
	  	    console.log("PrePage url:"+prevPage);
	  	}
	  	res.render("search.html", {binds:{
	  			user:user,
	  			searchText:searchText,
	  			searchResult:resultObj,
	  			nextPage:nextPage,
	  			prevPage:prevPage,
	  			salaryAsc: salaryAsc,
	  			salaryDesc: salaryDesc,
	  			ageAsc: ageAsc,
	  			ageDesc: ageDesc
	  			}});
		});
	}else{//Get functionality
		 res.render("search.html", {binds:{user:user}});
	}
	});
}

//All the method need to login will call this functionality
//My design is ok, I just pick the wrong method to call.
function login(req,res, next){
   var params = extractParameter(req.url);
   verifier.authenticate(req, res, function(user){
		if(user){
            next(req, res, user);
		}else{
		    res.redirect("/login");
		}
	    });
}

//Search will need login to do.
app.get("/", function(req, res){
  res.redirect("/search");
});
//Initially, I think the task management is the key, after think about for a while, For a small company of 4 people, the most important thing
//is the search, How to make search as convenient as possible is what you can do. So now the focus is the search page.  
app.get("/tasks", function(req, res){
	
    var params = extractParameter(req.url);
	//var selectedTaskID = params.taskid;
	verifier.fetchuser(req, function(user){
		if(user){
		    taskManager.fetchTask({},
					  function(tasks){
					      var taskid = params.taskid || tasks[0]._id;
					      console.log("Task ID:"+taskid);
					      taskManager.fetchTalentInTask(taskid, function(talents){
						      res.render("index.html", {"user": user, "tasks":tasks, "taskid":taskid, "talents":talents });
						  });
					  });
		}else{
		    res.redirect("/login");
		}
	    });
	//res.redirect("/random");
});

//Do I need to handle referrer or other thing. I have. Let's print the referer
app.get("/login", function(req, res) {
	var referrer = req.cookies.referrer || "/";
	console.log("referer:"+referrer);
	res.render("login.html",{layout:false, binds:{referred: referrer}});
});

app.post("/login", function(req, res){
	//util.inspect(req.body);
	var user = req.body.email;
	var password = req.body.password;
	var referredUrl = req.body.referredUrl || "/";
	//console.log("cookies:"+JSON.stringify(req.cookie));
	console.log(user+":"+password);
	verifier.fetchuser(user, password, function(record){ 
		if(record){
		    //res.cookie("token","MockToken");
		    console.log("The redirectUrl:"+referredUrl);
		  	res.cookie("token",user+":"+password);
		    res.redirect(referredUrl);
		}else{
		    res.render("login.html",{layout:false, binds:{error:"登录失败，请重新尝试", referred: referredUrl}}); //Something wrong, login again
		}
	    });
});

app.get("/upload", function(req, res){
	res.render("upload.html",{binds:{}});
});

app.post("/upload", function(req, res){
	//res.send("Body:"+JSON.stringify(req.headers));
	console.log("upload post get called, header:"+JSON.stringify(req.headers));
	console.log("upload files:"+JSON.stringify(req.files));
	console.log("upload parameters:"+JSON.stringify(req.body));
	console.log("upload method quit");
});

app.get("/solr/update/json", function(req, res){
    login(req, res, function(req, res, user){
		res.send("GET:"+JSON.stringify(req.headers)+",user:"+JSON.stringify(user));
		console.log("header:"+JSON.stringify(req.headers));
		});
});

app.post("/solr/update/json", function(req, res){
	res.send("POST:"+JSON.stringify(req.headers));
	//res.send(req.body);
	console.log("header:"+JSON.stringify(req.headers)+", body:"+JSON.stringify(req.body));
});


app.get("/random", function(req, res){
	res.send("{name:'xie tian',age:34, result: 503}");
	util.inspect(req.headers);
});

app.get("/remote", function(req, res){
	var httpreq = require('http').request({
		host: "127.0.0.1",
		port: 8888,
		path: "/random",
		method: "GET"
	    }, function(httpresp){
		httpresp.on('data', function(chunk) {
			console.log("Chunk from server:"+chunk+",original result:"+req.result);
			var data = eval(chunk);
			for(var pm in data){
			    console.log(pm+":"+data[pm]);
			}
			//console.log("JSON not exist:"+JSON.parse);
			//req.result = data.result;//what's the purpose of this?
			res.render("remote.html",{data: data });
		    });
	    });
	httpreq.end();
});

app.listen(8888);
console.log("Listen to 8888");
