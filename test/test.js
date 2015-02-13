// TODO: store this in the creds file, VCAP, etc
var projectId = process.env.TAAS_PROJECT || 'MyProject';
var apiKey = process.env.TAAS_API_KEY || 'admin8';
var url = process.env.TAAS_API_URL || 'https://gaas-dev.stage1.mybluemix.net/translate/';

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

taas._fetchApi(function() {
    console.log("Projects:");
    console.log(taas._api.projects.getProjectList({"api-key": apiKey}));
    console.log("Create:");
    console.log(taas._api.projects.createProject({"api-key": apiKey, 
                                                 body: {
                                                     id: projectId,
                                                     sourceLanguage: "en",
                                                     targetLanguages: ["de","fr"]
                                                 }}));
    console.log("Projects again:");
    console.log(taas._api.projects.getProjectList({"api-key": apiKey}));
    console.log("Inject data:");
    console.log(taas._api.projects.updateResourceData({"api-key": apiKey,
                                                       projectID: projectId,
                                                       languageID: "en",
                                                       body: {
                                                           resourceData: {
                                                               hello: "Hello",
                                                               bye: "Goodbye"
                                                           }
                                                       }}));
    console.log("verify data en:");
    console.log(taas._api.projects.getResourceData({"api-key": apiKey,
                                                    projectID: projectId,
                                                    languageID: "en"}));
    console.log("verify data de:");
    console.log(taas._api.projects.getResourceData({"api-key": apiKey,
                                                    projectID: projectId,
                                                    languageID: "de"}));
    console.log("verify data fr:");
    console.log(taas._api.projects.getResourceData({"api-key": apiKey,
                                                    projectID: projectId,
                                                    languageID: "fr"}));

}, console.error, []);


//taas.translate({source: sourceLoc, target: targLoc, data: sourceData}, function OKAY(x) {
//    console.log('-'); console.log(x); console.log("RESPONSE: " + JSON.stringify(x.entity));
//} , function ERR(x){ console.log("ERR:"); console.log(x);  });

//taas.schema(console.log, console.err, []); // 

// Local Variables:
// compile-command: "cd c:/Users/IBM_ADMIN/git/taas-nodejs-client/ ; npm run test"
// End:
