var mongo = require("mongodb");
var Db = mongo.Db;
var Connection = mongo.Connection;
var Server = mongo.Server;

var Host = "127.0.0.1";
var port = 27017;
console.log("Connecting to "+Host+":"+port);
var db = new Db("nodeDB", new Server(Host, port, {}), {});
db.open(function(err, db){
	if(err){
	    throw new Error("Can't open Database");
	}else{
	    db.collection("employee",function(err, collection){
		    if(err){
			throw new Error("Error opening Collection");
		    }
		    console.log("Will insert staff into database");
		    collection.insert({name:"Xie Tian", age: 34, status:"Happy"});
		});
	}
    });