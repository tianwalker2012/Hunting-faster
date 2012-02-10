var taskManager = require("./taskoperation").taskManager;
taskManager.storeTask(
		      {
			  name:"淘宝高级产品经理",
			      salary:"10000-20000",
			      job_description:"专业吃喝，一定要非常能喝",
			      experience:"5-10",
			      skillset:"Java,C++,UI design,UX,MMA",
			      department: "大客户部",
			      headcount:10,
			      contact: "李晓霜",
			      contact_phone: "15216727142",
			      contact_mail: "tian.xie@i-md.com",
			      created_date: new Date(),
			      deadline: new Date()
			      },
		      function(storedTask){
			  console.log("stored id:"+storedTask._id+", I will try to get this task back");
			  taskManager.fetchTask({"_id":storedTask._id}, function(tasks){
				  console.log("fetched task id:"+tasks[0]._id);
			      });
		      }

);
taskManager.storeTask(
		      {
			  name:"百度高级产品经理",
			      salary:"10000-20000",
			      job_description:"专业唱K，一定要非常能唱",
			      experience:"5-10",
			      skillset:"Java,C++,UI design,UX,MMA",
			      department: "大客户部",
			      headcount:10,
			      contact: "李晓霜",
			      contact_phone: "15216727142",
			      contact_mail: "tian.xie@i-md.com",
			      created_date: new Date(),
			      deadline: new Date()
			      },
		      function(storedTask){
			  console.log("stored id:"+storedTask._id+", I will try to get this task back");
			  taskManager.fetchTask({"_id":storedTask._id}, function(tasks){
				  console.log("fetched task id:"+tasks[0]._id);
			      });
		      }

);