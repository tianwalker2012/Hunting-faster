var mongoer = require("./mongonize");
var configure = require("./configure").configure;
var mongonizer = new mongoer.mongonizer(configure.mongo.host, configure.mongo.port, configure.mongo.dbname);

var talentSearcher = {};
 

function strToJson(str){
    var res = {};
    var constr = str || "";
    var arr = constr.split(",");
    console.log("arr length:"+arr.length);
    for(var i=0; i< arr.length; i++){
	var pos = arr[i].indexOf(":");
	if(pos>0){
	    var key = arr[i].substring(0,pos);
	    var value = arr[i].substring(pos+1, arr[i].length);
	    console.log("original="+arr[i]+", positon:"+pos+","+key+":"+value);
	    res[key] = value;
	}
    }
    return res;
}
talentSearcher.strToJson = strToJson;
talentSearcher.search = function(condition, next){
    var transferred = strToJson(condition);
    mongonizer.find(transferred, function(docs){
	    next(docs);
	}, configure.taskCollectionName);

}

exports.talentSearcher = talentSearcher;