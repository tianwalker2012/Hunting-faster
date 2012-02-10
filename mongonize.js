/**
*  Need to get all the function call to accept a error parameter as the first one. No exception. Because there is only single thread.
*  Your exception will crash all the user process. Each user process just a context, not a thread. exception mean fatal error happened. 
*  Think and enjoy this new way of doing things. 
*  Thanks Geng for giving me this opportunity to write HR system for him. I will promise and I will delivery. I will enjoy my time of 
*  doing this. 
**/

function mongonizer(host, port, dbname, colname) {
    this.host = host;
    this.port = port;
    this.dbname = dbname;
    this.colname = colname;
    this.mongo = require("mongodb");
    this.Db = this.mongo.Db;
    this.Connection = this.mongo.Connection;
    this.Server = this.mongo.Server;
    this.connectedDb = new this.Db(this.dbname, new this.Server(this.host, this.port, {}),{});
}

mongonizer.prototype.getDb = function(){
  	return this.connectedDb;
}

mongonizer.prototype.action = function(action, colname) {
    console.log("Action get called, aguments length:"+ arguments.length);
    var Self = this;
    var col = colname || this.colname;
    console.log("The colname:"+col);
    var db = this.connectedDb;
    db.open(function(err, db){
	    if(err){
		throw new Error("Can't open database");
	    }
	    db.collection(col, function(err, collection){
		    if(err){
			throw new Error("Can't open collection");
		    }
		    action(collection);
		});

	});
}

mongonizer.prototype.dbAction = function(action) {
    console.log("DbAction get called, arguments length:"+arguments.length);
    var Self = this;
    var db = this.connectedDb;
    db.open(function(err, db){
	    if(err){
		throw new Error("Can't open database");
	    }
	    action(db);
	});
}
mongonizer.prototype.remove = function(colname, condition, next) {
    console.log("First action user");
    this.action(function(collection){
	    collection.remove(condition, function(err, collection){
		    console.log("What I can do during remove?");
		});
	    next(collection);
	}, colname);
}

mongonizer.prototype.drop = function(colname, next){
    console.log("Will drop the collection:"+colname);
    this.dbAction(function(db){
	    db.dropCollection(colname, function(err, result){
		    console.log("Drop the collection:"+colname+", err:"+err+",result:"+result);
		    next(db,err, result);
		});
	});
   
}

/**
*  Will save the data into database. I remember I have get the update work in this method. Need to verify.
*  Let's check.
*  
**/
mongonizer.prototype.store = function(object, next, colname) {
	var col = colname || this.colname;
    console.log("Will store to "+this.host+":"+this.port+"/"+col);
    var Self = this; // To be referred by closure.
    var db = this.connectedDb;
    if(typeof(object["_id"]) === "string"){ //Will query the id out
		console.log("Will replace id with object");
		object["_id"] = this.connectedDb.bson_serializer.ObjectID(object["_id"]);
	}
    db.open(function(err, db){
	    if(err){
		//throw new Error("Can't open database");
	    	next(err);
	    }else{
		db.collection(col, function(err, collection){
			if(err){
			    //throw new Error("Error at opening collection:"+Self.colname);
				next(err);
			}else{
			    collection.save(object);
     			next(null, object);
			}
		    });
	    }
	});

}

//The previous find will crash the whole server if the resultset is huge. 
//This version will iterate the cursor, so resource is limited. but the way to know when it is over is a little bit different with 
//Previous version.
mongonizer.prototype.findCursor = function(condition, next, colname){
	var col = colname || this.colname
    console.log("Will find result from "+this.host+":"+this.port+"/"+col+",dbname:"+this.dbname);
    var Self = this; //To be referred by closure.
    var db = this.connectedDb;
    if(typeof(condition["_id"]) === "string"){ //Will query the id out
		console.log("Will replace id with object");
		condition["_id"] = this.connectedDb.bson_serializer.ObjectID(condition["_id"]);
	}
    db.open(function(err, db){
	    if(err){
		//throw new Error("Can't open database");
	      next(err);
	      return;
		}
	    console.log("Control come to db");
	    db.collection(col, function(err, collection){
		    if(err){
			//throw new Error("Error at opening collection:"+Self.colname);
		      next(err);
			  return;
			}
		    collection.find(condition,function(err, cursor){
			    if(err){
				  next(err); //Even error, you still get the callback, especially important to web application.
			      return;
				}
			    console.log("Control come to Cursor handler");
			    cursor.each(function(err, author) {
					next(err, author);
				});
			});
		});
	});
}

//Simpler when you only have limited result. If you have large chunk of data, please use findCursor.
mongonizer.prototype.find = function(condition, next, colname) {
	    var col = colname || this.colname
    console.log("Will find result from "+this.host+":"+this.port+"/"+col+",dbname:"+this.dbname);
    var Self = this; //To be referred by closure.
    var db = this.connectedDb;
    if(typeof(condition["_id"]) === "string"){ //Will query the id out
		//console.log("Will replace id with object");
		condition["_id"] = this.connectedDb.bson_serializer.ObjectID(condition["_id"]);
	}
    db.open(function(err, db){
	    if(err){
		  //throw new Error("Can't open database");
	      next(err);
	      return;
	    }
	    console.log("Control come to db");
	    db.collection(col, function(err, collection){
		    if(err){
			//throw new Error("Error at opening collection:"+Self.colname);
		    	next(err);
		    	return;
		    }
		    collection.find(condition,function(err, cursor){
			    if(err){
				//throw new Error("Error at find");
			      next(err);
			      return;
			    }
			    console.log("Control come to Cursor handler");
			    cursor.toArray(function(err, docs){
				    next(null, docs);
				});
			});
		});
	});
}

mongonizer.prototype.findex = function(condition, next, colname) {
	    var col = colname || this.colname
    console.log("Will find result from "+this.host+":"+this.port+"/"+col+",dbname:"+this.dbname);
    var Self = this; //To be referred by closure.
    var db = this.connectedDb;
    db.open(function(err, db){
	    if(err){
		throw new Error("Can't open database");
	    }
	    console.log("Control come to db");
	    db.collection(col, function(err, collection){
		    if(err){
			throw new Error("Error at opening collection:"+Self.colname);
		    }
		    collection.find(condition,function(err, cursor){
			    if(err){
				throw new Error("Error at find");
			    }
			    console.log("Control come to Cursor handler");
			    cursor.toArray(function(err, docs){
				    next(docs, db, collection);
				});
			});
		});
	});
}

exports.mongonizer = mongonizer;