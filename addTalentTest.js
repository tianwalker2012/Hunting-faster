var mongoer = require("./mongonize");
var solrutil = require("./solrutil").solrutil;
var submithandler = require("./submithandler").submithandler;

mongoer.mongonizer.prototype.findOne = function(id, next, colname){
	var col = colname || this.colname
    console.log("Call findOne "+this.host+":"+this.port+"/"+col+",dbname:"+this.dbname);
    var Self = this; //To be referred by closure.
    var db = new this.Db(this.dbname, new this.Server(this.host, this.port,{}),{});
    db.open(function(err, db){
	    if(err){
		throw new Error("Can't open database");
	    }
	    console.log("Control come to db");
	    db.collection(col, function(err, collection){
		    if(err){
			throw new Error("Error at opening collection:"+Self.colname);
		    }
		    collection.findOne(id,function(err, result){
			    if(err){
				  return;//Next will never get called. 
			    }
			   next(result);
			});
		});
	});
}

var mongonizer = new mongoer.mongonizer("127.0.0.1",27017,"hr_system");

//The purpose of record_status is to tell my handler only index those is active,
//all delete not physical deletion, it will only set deleted to true. 
//also create this field on the Solr, So nothing could lost. Safe and enjoyable. 
var talents = [
{
	name:"Starry Starry night",
	phone:["15216727142","15921942426"],
	email:["sunnyskyunix@sina.com","tian.xie@i-md.com"],
	age:35,
	career_age:11,
	skill_set:"c++ java .net c# html5 css UX ui design public talk humor funny",
	company:"Enjoy learning LTD",
	served_company:["拉阔","浩天","奥菲","威不落"],
	title:"CEO",
	used_title:["CXO","UFO", "XXOO"],
	resume:"I have a dream, Someday I could change everybody's life for good. I could enjoy my existence and proudly tell GOD, I really enjoy life, thank you",
	cases:["enjoy learning","smart schedule"],
	comments:["should be pastor","Modern life Martin ruther King JR","Benjamin franklin JR"],
	status:"rejected",
	creator:"xietian",
	created_time:new Date(Date.parse("2012-01-30T12:30:00Z")),
	updated_time:new Date(Date.parse("2012-01-30T12:35:00Z")),
	changer:["xietian","geng","bill"],
	changer_history:[new Date(Date.parse("2011-10-01T12:00:00Z")),new Date(Date.parse("2011-11-30T12:00:01Z"))],
	deleted:false
}
]

function testFindOne(){
mongonizer.findOne(mongonizer.getDb().bson_serializer.ObjectID("4f279522ef90d6cd13000001"), function(res){
	console.log("result:"+JSON.stringify(res));
	res.name = "Crazy but funny guy";
	mongonizer.store(res, function(stored){
		console.log("Stored successfully, or I wish");
	}, "talents");
}, "talents");
}


function storeTest(){
mongonizer.store(talents[0], function(stored){
	console.log("Type of id:");
	console.log("Stored:"+JSON.stringify(stored));
	
}, "talents")
}

//storeTest();
console.log("Type string:"+typeof(""));
console.log("Type object:"+typeof({}["_id"]));
console.log("type funciton:"+typeof(function(){}));
console.log("type null:"+typeof(null));
console.log("type of list:"+typeof([]));
console.log("Type of float:"+typeof(0.75));
console.log("type of int:"+typeof(14));
console.log("Unescape:"+unescape("天空%20之城"));
console.log("Unescape2:"+unescape("%09++name%3a谢天"));
var coolguy = null || null || "happy";
console.log("result:"+coolguy);
console.log("Date:"+new Date());

//Test the solrutil search functionality
function testSearch(){

}
function convert(){
	var template = {
	"name":"string",
	"age": "int",
	"salary": "float",
	"create_date": "date",
	"notexist": "string",
	"comments":"stringlist"
	}

	var target = {
  "name":"xietian",
  "age": "35",
  "salary": "879.50",
  "create_date":"2012-02-01T13:03:04Z",
  "notexist":" ",
  "comments":"好人一个，开心快乐"
	}

	var result = submithandler.convert(template, target);
	console.log(JSON.stringify(result));
}

//It will accept 2 parameter, for each value will get called, for the final also get called.
//Then problem get solved. If final not provide, then nothing get done.
function testIterateAndIndexing(condition, eachval,endval){
	mongonizer.findCursor(condition, function(err,res){
			if(err){
				console.log("Encounter error:"+JSON.stringify(err)+", res:"+JSON.stringify(res));
				return;
			}
			if(res){
				eachval(res);
			}else{
				//console.log("Collected all result. Time to call next, the result length:"+result.length);
			    endval();//Did the MongoDB make sure eachval and endval synchronized, or did the each call are asynchronized? we can test it.
			}
			console.log(JSON.stringify(res));
	}, "talents");
}

function indexAllRecordsInMongo(){
testIterateAndIndexing({deleted:false}, function(val){
	console.log("Try to index:"+JSON.stringify(val));
	solrutil.createIndex([val], function(code, response){
		console.log("Index code:"+code+",response:"+response);
	});
}, function(){
	console.log("Successfully ended");
});
}


function testFindCursor(){
var result = [];

mongonizer.findCursor({deleted:false}, function(err,res){
		if(err){
			console.log("Encounter error:"+JSON.stringify(err)+", res:"+JSON.stringify(res));
			return;
		}
		if(res){
			result.push(res);
		}else{
			console.log("Collected all result. Time to call next, the result length:"+result.length);
		}
		console.log(JSON.stringify(res));
}, "talents");
}

function testFindOne(){
mongonizer.find({_id:"4f279522ef90d6cd13000001"}, function(res){
	console.log(JSON.stringify(res));
}, "talents");
}
//storeTest();
//testFindOne();
//mongonizer.find({}, )