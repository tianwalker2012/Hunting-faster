//make sure the change get into the file
var configure = {};
configure.mongo = {host:"127.0.0.1", port:27017, dbname:"hr_system"};
configure.taskCollectionName = "tasks";
configure.solrhost = "127.0.0.1";
configure.solrport = 8983;

//commit=true parameter will make the update committed immediately
configure.solrupdate = "/solr/update?wt=json";
configure.solrquery = "/solr/select/?wt=json&version=2.2&indent=on&";
configure.solrupdatejson = "/solr/update/json?commit=true&wt=json";
//The generated index file will be stored in this folder and will upload to 
configure.solrxmlfolder = "/Users/xietian/solrindex/";
configure.uploadStoredDir = __dirname+"/download/";

//For any remote access request, if error encountered before request get to the server like DNS, TCP, etc... System will use 999 as it's 
//StatusCode, so that application callback can do something about it. Why I feel so much better to work under the IDE, even it is just a text inputs IDE.
//You need a work bench which you can enjoy you coding life.  
configure.tcperror = 999;
configure.numberPerPage = 20;

//This template was used to convert the target parameter into the type specified in this template.
configure.converttemplate = {
  _id: "string",
  name: "string",
  age: "int",
  career_age: "int",
  salary: "int",
  title: "string",
  skill_set: "string",
  company: "string",
  resume: "string",
  diploma: "string",
  department: "string",
  work_address: "string",
  home_address: "string",
  region: "string",
  comments: "stringlist",
  email: "string",
  phone: "string",
  changer: "stringlist",
  changer_history: "datelist",
  attached_resume: "stringlist",
  creator: "string",
  created_time: "date",
  updated_time: "date"
};

configure.accounttemplate = {
  _id: "string", 
  name: "string",
  password: "string",
  type: "string",
  creator: "string",
  created_time: "date"
}


exports.configure = configure;
