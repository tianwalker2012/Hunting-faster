var mongoer = require("./mongonize");
var mongonizer = new mongoer.mongonizer("127.0.0.1",27017,"hr_system");

//Tasks
//One company could have multiple tasks
//One task can allocate to mutliple people.
//Should I limit one task to one type of talent?
//Keep it simple and stupid. 
var current = new Date();
for(var pm in current){
    if(typeof current[pm] === "function"){
	console.log("function:"+pm);
    }else{
	console.log(pm+":"+current[pm]);
    }
   
}
var org  = current - 0;
var minus = 15*24*60*60*1000 + org;
var testTime = 1325054924966;

console.log("local time:"+new Date(testTime));

console.log("orginal:"+org+",minus:"+minus);

//console.log("Later time="+later);
//current.setMilliSeconds(later);
mongonizer.store({
	company_name: "阿里巴巴",//may use company id later. now keep it simple and straightforward.
	    department: "阿里云事业部",
	    experience: "2-15",//minus mean between
	    salary: "2000-4000",//minus mean between
	    title: "Engineer Manager",//
	    skill_set: "C++,Java,Object C",
	    target_company: "腾讯,百度,Google,Douban",
	    job_description: "每周工作80小时，没有正常节假日，简单一句话，招的人需要是费曼的聪明，能适应机器人的工作",
	    number: 15,
	    created_time: new Date(minus),
	     updated_time: new Date()
    },function(obj){
	for(var pm in obj){
	    console.log(pm+":"+obj[pm]);
	}
    },"tasks");

//Employee
mongonizer.store({
	name: "耿云亭",
	    role: "owner",
	    status: "active",//active or inactive
	    password: "easy", //MD5 later.
	    login_name: "geng",
	    created_time: new Date(),
	    last_login: new Date()
    },function(obj){
	for(var pm in obj){
	    console.log(pm+":"+obj[pm]);
	}
    },
    "employee"
    );

//Talent database
//Could have a list of comments, who and what about this guy
mongonizer.store(
		 {name: "谢天",
			 age: 34,
			 carrer_age: 8,
			 skill_set: "Java, C++, Javascript, HTML, CSS, Ruby",
			 served_company: "iiL, Wipro, i-MD",
			 title: "Engineer Manager",
			 salary: 20000,
			 used_title: "Engineer, Consultant",
			 resume: "我曾经年少爱追梦，一心只想往前飞",
			 status: "Free",
			 inputer: "天哥",
			 created_time: new Date(),
			 updated_time: new Date()},
		 function(obj){
		     console.log("Stored successful");
		     for(var pm in obj){
			 console.log(pm+":"+obj[pm]);
		     }
		 },
		 "talents"
);
