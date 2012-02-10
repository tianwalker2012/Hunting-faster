var solrutil = require("./solrutil").solrutil;


function testCommit(){
	console.log("start to call");
	solrutil.commit(function(code, responseBody){
			console.log("Code:"+code+",responseBody:"+responseBody);
			if(code == 200){
				var obj = JSON.parse(responseBody);
				console.log("object is:"+ obj.responseHeader.status);
			}
		});
}

//testCommit();

function testEscape(){
	var orginal = "我爱+号= 也爱－号";
	console.log("orginal:"+orginal+" escaped:"+escape(orginal)+",unescaped:"+unescape(escape(orginal)));
}

function testQuery(){
	solrutil.query({q:"name:谢天", start:0, rows:2}, function(code, data){
		console.log("Status code:"+code+",data:"+data);
		//console.log("escape code:"+escape);
	});
}

testQuery();

function testEncodeRelatedThings(){
	var encodeStr=" a我是谁b";
	console.log("length:"+encodeStr.length+",charater 0:"+encodeStr[0]+", char 0:"+encodeStr.charCodeAt(0).toString(16)+",1:"+encodeStr.charCodeAt(1).toString(16));

	var NonConvert={
		"A":1,
		"-":1
	}
}

function testCommandIssue(){
	var exec = require("child_process").exec;
		exec("curl 'http://127.0.0.1:8888/solr/update/json?commit=true&wt=json' --data-binary @/Users/xietian/solrindex/dynamic.json", function(err, stdout, stderr){
			console.log("err:"+err+", stdout:"+stdout+",stderr:"+stderr);
		});
}

function testCreateIndexCurl(){
	solrutil.createIndexCurl([{"id":"2012-01-30",
		name:"挑灯",cat:["fiction","mathmetic"],
		author:"Xie Tian",
		inStock:true,
		price:40.50,
		page_i:1025}], function(err, stdout){
		console.log("Error message:"+err+",stdout:"+stdout);
	});
}

//testCreateIndexCurl();

function testCreateIndex(){
 var indexObj = 
	[{
		_id:"167791-1",
		name:"谢天",
		phone:["15216727142","15921942426"],
		email:["sunnyskyunix@sina.com","tian.xie@i-md.com"],
		age:35,
		career_age:11,
		skill_set:"c++ java .net c# html5 css UX ui design public talk humor funny",
		company:"睿医",
		served_company:["拉阔","浩天","奥菲","威不落"],
		title:"Technical Manager",
		used_title:["Java engineer","Software consultant"],
		resume:"A very nice and funny guy, Always dream of doing something extraordinary. Full of dream and imagination",
	    cases:["乐知网","smart schedule"],	
		comments:["crazy guy","rejected","not suitable for any big company"],
		status:"rejected",
		creator:"xietian",
		created_time:"2012-01-30T12:30:00Z",
		updated_time:"2012-01-30T12:35:00Z",
		changer:["xietian","geng","bill"],
		changer_history:["2011-10-01T12:00:00Z","2011-11-30T12:00:01Z"]
	}];

	solrutil.createIndex(indexObj, function(code, content){
		console.log("The first index code:"+code+",content:"+content);
	});
}

//testCreateIndex();

//console.log("Date:"+JSON.stringify({name:"cool", birthday: new Date()}));

function testEncode(){
	encodeStr = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_.~我爱 +%<>=?";
	console.log("Encoded:"+solrutil.encode(encodeStr));
	console.log(NonConvert["A"]+","+NonConvert["-"]+","+NonConvert["*"]);
	console.log("End calling");
}