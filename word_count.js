var mongoer = require("./mongonize");
var mongonizer = new mongoer.mongonizer("192.168.1.20",27017,"InfoProd");
var fs = require("fs");
var util = require("util");

mongonizer.action(function(collection){
	collection.find({title:/..*/}, function(err, cursor){
		console.log("begin iterate");
		var maxLength = 0;
		var minLength = 50;
		var lengthDistribution = {};
		var totalLength = 0;
		var totalCount = 0;
		var writen = {};
		cursor.each(function(err,doc){
			if(doc){
			    if(doc.title.length > maxLength){
				maxLength = doc.title.length;
			    }
			    if(doc.title.length < minLength){
				minLength = doc.title.length;
			    }
			    
			    totalCount += 1;
			    totalLength += doc.title.length;
			    if (lengthDistribution[""+doc.title.length]) {
				
				lengthDistribution[""+doc.title.length] += 1;
			    
			    }else{
				lengthDistribution[""+doc.title.length] = 1;
			    }
			    if(doc.title.length==10 || doc.title.length == 19 || doc.title.length == 20||doc.title.length == 21 || doc.title.length == 22 || doc.title.length == 23 || doc.title.length == 24 || doc.title.length == 40 || doc.title.length == 41 || doc.title.length == 42){
				if(!writen[""+doc.title.length]){
				    writen[""+doc.title.length] = 1;
				    console.log("About to write title length:"+doc.title.length+",text:"+doc.title+",id:"+doc._id);
				    var fileName = "./"+doc._id+".txt";
				    var stream = fs.createWriteStream(fileName);
				    stream.once('open', function(fd) {
					    stream.write("id:"+doc._id+"\n");
					    stream.write("title:"+doc.title+"\n");
					    stream.write("author:"+doc.author+"\n");
					    stream.write("publishTime:"+new Date(doc.publishTime)+"\n");
					    stream.write("content:"+doc.content);
					});
					}
			    }
			    //    if(doc.title.length === 1)
			    //console.log("1 length:"+doc.title);
			//			    console.log("title:"+doc.title);
			}else{
			    console.log("totalCount:"+totalCount);
			    console.log("maxLength:"+maxLength);
			    console.log("minLength:"+minLength);
			    var avg = totalLength/totalCount;
			    console.log("average Length:"+avg);
			    var arr = [];
			    for(var pm in lengthDistribution) {
				var tmp = {};
				tmp.key = pm;
				tmp.content = lengthDistribution[pm];
				console.log(tmp.key+":"+tmp.content);
				arr.push(tmp);
			    }
			    
			    //arr.sort(function(le, ri){
			    //   le.content - ri.content;
			    //	});
			    //for (var i = 0;i < arr.length; i++){
			    //console.log("length:"+arr[i].key+",count:"+arr[i].content);
			    // }
			    console.log("I hope this is last");
			}
		    });
		console.log("end iterate");
	    });
    }, "content");