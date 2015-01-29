// TODO: store this in the creds file, VCAP, etc
var projectId = process.env.TAAS_PROJECT || 'MyProject';
var apiKey = process.env.TAAS_API_KEY || '34EF-45FF-AB12-DC78';
var url = process.env.TAAS_API_URL || 'http://ultra6.sanjose.ibm.com:9080/translate/';

var taas = require('../index.js')({ url: url, api: apiKey, project: projectId });
/*
var taas = require('./index.js')({ url: url, api: apiKey, project: projectId });
*/
var sourceLoc = "en-US";
var targLoc = "zh-Hans";

var sourceData = [
    {"key": "key1", "value": "First string to translate"},
    {"key": "key2", "value": "Second string to translate"}
];


//taas.translate({source: sourceLoc, target: targLoc, data: sourceData}, function OKAY(x) {
//    console.log('-'); console.log(x); console.log("RESPONSE: " + JSON.stringify(x.entity));
//} , function ERR(x){ console.log("ERR:"); console.log(x);  });

taas.schema(console.log, console.err, []); // 

// Local Variables:
// compile-command: "cd c:/Users/IBM_ADMIN/git/taas-nodejs-client/ ; npm run test"
// End:
