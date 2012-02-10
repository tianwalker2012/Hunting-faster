var events = require('events');
var util = require('util');

function pulser() {
    events.EventEmitter.call(this); //Whats the purpose of this, populate the fields?
}

util.inherits(pulser, events.EventEmitter);

pulser.prototype.start = function() {
    var self = this;
    this.id = setInterval(function(){
	    util.log('pulse >>>');
	    self.emit('pulse');
	    util.log('pulse <<<');
	}, 1000);
}

    exports.pulser = pulser;