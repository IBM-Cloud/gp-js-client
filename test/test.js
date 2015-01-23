// TODO: store this in the creds file, VCAP, etc
var projectId = 'MyProject';
var apiKey = '34EF-45FF-AB12-DC78';
var url = 'http://localhost:9131/translate/';

var taas = require('../index.js')({ url: url, api: apiKey, project: projectId });

var sourceLoc = "en-US";
var targLoc = "zh-Hans";

var sourceData = [
    {"key": "key1", "value": "First string to translate"},
    {"key": "key2", "value": "Second string to translate"}
];


taas.translate({source: sourceLoc, target: targLoc, data: sourceData}, function OKAY(x) {
    console.log('-'); console.log(x); console.log("RESPONSE: " + JSON.stringify(x.entity));
} , function ERR(x){ console.log("ERR:"); console.log(x);  });

// Local Variables:
// compile-command: "cd c:/Users/IBM_ADMIN/git/taas-nodejs-client/ ; npm run test"
// End:
