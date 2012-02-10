/**
* In this submission handler, basically doing one thing.
* In the method passing 2 parameter, one the template object which will tell which field it will get out, and what's the type of this field, 
* like list, or int or float or string, date, or other type. The other parameter is the object which submitted by user. Iterate the template,
* try to get the things out of the target. 
*
**/

var configure = require("./configure").configure;

var submithandler = {};

//This method will convert the string to the perferred type.
//Once I have seperated this functionality inside this method, I can do many tricks here.
function convertType(type, target, original){
  if(target === undefined && original === undefined){
  	return null;
  }else if(target === undefined){
  	return original;
  }
  if(type === "string"){
  	if(target.trim() ===""){
  		return null; //remove unnecessary staff.
  	}
  	return target;
  } else if(type === "int") {
  	if(target.trim() === ""){
  		return null;
  	}
  	return parseInt(target);
  } else if(type === "float") {
    if(target.trim() === "") {
        return null;
    }
    return parseFloat(target);
  } else if(type === "date") {
    if(target.trim() === "") {
        return null;
    }
    return new Date(Date.parse(target));
  } else if(type === "stringlist") {
    if(original){
    	if(target.trim() === "") {
    	  return original;
    	}
    	original.push(target);
    	return original;
    }
    if(target.trim() === ""){
      return null;
    }else{
  	  return [target];
  	}
  }else {
    return target;
  }
}

submithandler.convertType = convertType;

submithandler.convert = function(template, submitted, original){
	var res = {};
	for(var pm in template){
		var type = template[pm];
		console.log("try to convert:"+pm);
		var value = convertType(type, submitted[pm], original[pm]);
	    if(value != null){
	    	res[pm] = value;
	    }
	}
	return res;
}

exports.submithandler = submithandler;
