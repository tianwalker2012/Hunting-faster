var searcher = require("./talentsearcher").talentSearcher;
var converted = searcher.strToJson("key1:value1,key2:value2");
for(var pm in converted){
    console.log(pm+":"+converted[pm]);
}

searcher.search("name:谢天",function(docs){
	for(var i = 0; i< docs.length; i++){
	    for(var pm in docs[i]){
		console.log("result:"+pm+":"+docs[i][pm]);
	    }
	}
    });