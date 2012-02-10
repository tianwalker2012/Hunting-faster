[1,2,3,4].forEach(function(item){
	console.log("print item:"+item);
    });

console.log("Substring 1,4 for 12345 is:"+"12345".substring(1,4));
console.log("Substr 1,4 for 12345 is:"+"12345".substr(1,4));
console.log("indexOf not exist is:"+"12345".indexOf("0"));
var obj = {};

var testVal = obj.a || obj.b || "comeon";
console.log("testValue:"+testVal);
 