var server = require("./server.js");
var router = require("./router.js");
var handlers = {};
var definedHandlers = require("./handlers");

handlers["/upload"] = definedHandlers.upload;
handlers["/login"] = definedHandlers.login;
handlers["/download"] = definedHandlers.download;
handlers["/uploadform"] = definedHandlers.uploadform;
handlers["/show"] = definedHandlers.show;
server.start(handlers,router);