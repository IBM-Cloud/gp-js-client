
var fs = require('fs');

var alreadyRead = {};

function tryRead(fn) {
	// read each file only once.
	if(alreadyRead[fn]) return;
	alreadyRead[fn]=true;

	var fc;
	try {
		fc = fs.readFileSync(fn);
	} catch(e) {
		console.log('# Not able to read: ' + fn + ' ('+e+')');
	}
	if(fc) {
		console.log('#'+fn);
		fc.toString().split(/[\n\r]/).forEach(function(s) {
			if(!s || s[0]===('#') || (s==='') ) return;
			var e = s.split('=');
			if(process.env.hasOwnProperty(e[0])) {
				// console.log('Not overriding $'+e[0] +' with entry from ' +fn);
			} else {
				process.env[e[0]] = e[1];
				console.log(e[0]+"="+e[1]);
			}
		});
	}
}

function applyLocal() {
	tryRead('local-test.properties');
	tryRead('test.properties');
}

module.exports = {
	tryRead: tryRead,
	applyLocal: applyLocal
};