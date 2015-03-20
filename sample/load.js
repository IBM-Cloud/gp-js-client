//* IBM Globalization
//* IBM Confidential / Copyright (C) IBM Corp. 2015

//* simple sample: loader.

var gaas=require('./gaas-sample.js');

var data=require('./sample-en.js');

console.log('Loader: about to load this data:');
console.dir(data);

gaas.createProject( { sourceLanguage: 'en', targetLanguages: ['fr'] }, function onCreate(resp) {
    console.dir('Project created!', resp);
    gaas.updateProject({ data: data }, function(resp) {
        console.dir('Data posted!', resp);
    }, console.err);
}, console.err);

