//* IBM Globalization
//* IBM Confidential / Copyright (C) IBM Corp. 2015

//* simple sample: loader.

var gaas=require('./gaas-sample.js');

console.log('deleting..');
gaas.deleteProject( {}, function(resp) {
    console.dir('Project deleted!', resp);
}, console.err);
