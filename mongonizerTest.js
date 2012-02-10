var mongoer = require("./mongonize");
var mongonizer = new mongoer.mongonizer("127.0.0.1",27017,"hr_system");

//Should have a function do NOT have the side effect.
//I am so happy, that I get into the flow mode. 
function extend(orginal, extension){
    var res = {};
    for(var pm in orginal){
	console.log("put orginal "+pm+":"+orginal[pm]);
	res[pm] = orginal[pm];
    }
    for(var pm in extension){
	console.log("put extension "+pm+":"+extension[pm]);
	res[pm] = extension[pm];
    }
    return res;
}

function updateEx(cond, obj, colname, next){
    console.log("I am in the updateEx:"+colname);
    mongonizer.find(cond, function(res){
	    //console.log("UpdateEx result length:"+res.length);
	    if(res && res.length > 0){
		var combined = extend(res[0],obj);
		mongonizer.store(combined, function(stored){
			next(stored);
		    }, colname);
	    }else{
		next(); //if return nil mean not find.
	    }
	}, colname);
}




updateEx({name:"geng"},{"updateEx":"happier"},"employee", function(combined){
	if(!combined){
	    console.log("Not find");
	    return;
	}
	for(var pm in combined){
	    console.log(pm+":"+combined[pm]);
	}
    });


function update(cond, obj, colname, next){
    console.log("In update, Check condition for find");
    for(var pm in cond){
	console.log(pm+":"+cond[pm]);
    }
    
    mongonizer.find(cond, function(res){
	    console.log("result length:"+res.length);
	    if(res){
		console.log("The length:"+res.length);
		var combined = extend(res[0],obj);
		mongonizer.store(combined, function(stored){
			console.log("Stored successfully");
			next(stored);

		    }, colname);
		}
	}, "empolyee");
}

//mongonizer.store({name:"geng", password:"easy"}, function(res){
//	console.log("stored success");
//    }, "employee");

/**
mongonizer.find({name:"gen"}, function(res){
	console.log("in find function the found length:"+res.length);
	if(res){
	    return;
	}
	res[0].coolfield = "cool field";
	var newObj = extend(res[0], {"anyfield": "just added"});
	mongonizer.store(newObj, function(itm){
		console.log("Stored successfully");
		for(var pm in itm){
		    console.log(pm+":"+itm[pm]);
		}
	    }, "employee");
    },"employee");

**/

/**
update({name:"geng"}, {"updateField":"Updated Field"}, "employee", function(stored){
	for(var pm in stored){
	    console.log(pm+":"+stored[pm]);
	}
    });
**/

/**
mongonizer.drop("employee", function(db, err, result){
	if(err){
	    console.log("Type of error:"+ typeof err);
	    for(var pm in err){
		console.log(pm+":"+err[pm]);
	    }
	}else{
	    console.log("I wish I drop database successfully");
	}
	db.close();
    });

*/


/**
mongonizer.remove("employee", {}, function(){
	console.log("Successfully removed employee");
    });

mongonizer.find({name: "Hou Xue Teng"}, function(docs){
	for(var pm in docs){
	    //  console.log('result:'+pm+":"+docs[pm]);
	    for(var pmm in docs[pm]){
		console.log("Result:"+pmm+":"+docs[pm][pmm]);
	    }

	}
    });

mongonizer.store({name: "Hou Xue Teng", age: 36, description:"Wonderful wife"}, function(obj){
	console.log("Stored successful");
	for(var pm in obj){

	}
    });
**/
