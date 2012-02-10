var mongoer = require("./mongonize");
var configure = require("./configure").configure;
var mongonizer = new mongoer.mongonizer(configure.mongo.host, configure.mongo.port, configure.mongo.dbname);

var taskManager = {};

//Need to fetch that record and change the status accordingly
taskManager.changeTalentStatus = function(talentID,taskID,status, next){
    next({});
}


//Use mock up data to make things up and run.
//Even without javascript. Just pure staff.
taskManager.fetchTalentInTask = function(talentID, next){
    console.log("Passing talentID:"+talentID);
    var res = [
{
    "name": "谢天",
    "age": 34,
    "career_age": 8,
    "skill_set": "Java, C++, Javascript, HTML, CSS, Ruby",
    "served_company": "iiL, Wipro, i-MD",
    "title": "Engineer Manager",
    "salary": 20000,
    "used_title": "Engineer, Consultant",
    "resume": "我曾经年少爱追梦，一心只想往前飞",
    "status": "Free",
    "inputer": "天哥",
    "created_time": new Date(),
    "updated_time": new Date(),
    "_id": "123"
}
];
    next(res);
}

taskManager.fetchTask = function(condition, next){
    console.log("Try to fetch task");
    mongonizer.find(condition, function(docs){
	    next(docs);
	}, configure.taskCollectionName);
}

//Store and update is the same. How about the talent will add to  
taskManager.storeTask = function(task, next){
    console.log("Try to store task");
    mongonizer.store(task, 
		     next
		     , configure.taskCollectionName);
}

//Fetch talents that have assigned to this task 
taskManager.fetchTalents = function(task, next){
    console.log("Try to fetch talent assigned to this task");

}

exports.taskManager = taskManager;