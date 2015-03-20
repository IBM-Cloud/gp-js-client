//* IBM Globalization
//* IBM Confidential / Copyright (C) IBM Corp. 2015

//* simple sample: loader.

var gaas=require('./gaas-sample.js');
console.log('Let\'s see how the GaaS service is doing!');

gaas.getInfo({}, console.dir, console.error);
