// TODO: store this in the creds file, VCAP, etc
var projectId = process.env.TAAS_PROJECT || 'MyProject';
var apiKey = process.env.TAAS_API_KEY || 'admin8';
var url = process.env.TAAS_API_URL || 'http://127.0.0.1:9131/translate'; // 'https://gaas-dev.stage1.mybluemix.net/translate/';
var expect = require('chai').expect;


var assert = require('assert');

var taas = require('../index.js')({ url: url, api: apiKey, project: projectId });
/*
var taas = require('./index.js')({ url: url, api: apiKey, project: projectId });
*/
var sourceLoc = "en-US";
var targLoc = "zh-Hans";

var sourceData = {
    "key1": "First string to translate",
    "key2": "Second string to translate"
};

/**
 * probably been written before!
 */
function arrayToHash(o, k) {
    var res = {};
    for(var i in o) {
        res[o[i][k]] = o[i];
    }
    return res;
}

describe('taas-client', function() {
    describe('getInfo', function() {
        it('should contain English', function(done) {
            taas.getInfo({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.supportedTranslation).to.include.keys('en');
                done();
            }, done);
        });
    });
    describe('getProjectList [expect: []]', function() {
        it('should return an empty list', function(done) {
            taas.getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.projects).to.be.empty;
                done();
            }, done);
        });
    });
    
    describe('createProject(MyProject)', function() {
        it('should let us create', function(done) {
            taas.createProject({ body: {id: 'MyProject', sourceLanguage: 'en', targetLanguages: ['es','fr']}}, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });


    describe('getProjectList [expect: MyProject]', function() {
        it('should return our project in the list', function(done) {
            taas.getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.projects.length).to.equal(1);
                var projs = arrayToHash(resp.projects, 'id');
                expect(projs).to.contain.keys('MyProject');
                expect(resp.projects[0].sourceLanguage).to.equal('en');
                expect(projs.MyProject.targetLanguages).to.include('es');
                expect(projs.MyProject.targetLanguages).to.include('fr');
                expect(projs.MyProject.targetLanguages).to.not.include('de');
                expect(projs.MyProject.targetLanguages).to.not.include('zh-Hans');
                done();
            }, done);
        });
    });

    describe('createProject', function() {
        it('should let us create another', function(done) {
            taas.createProject({ body: {id: 'MyOtherProject', sourceLanguage: 'en', targetLanguages: ['de','zh-Hans']}}, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });

    describe('getProjectList', function() {
        it('should return our other project in the list', function(done) {
            taas.getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                var projs = arrayToHash(resp.projects, 'id');
                expect(projs).to.include.keys('MyProject');
                expect(projs.MyProject.targetLanguages).to.include('es');
                expect(projs.MyProject.targetLanguages).to.include('fr');
                expect(projs.MyProject.targetLanguages).to.not.include('de');
                expect(projs.MyProject.targetLanguages).to.not.include('zh-Hans');
                expect(projs).to.include.keys('MyOtherProject');
                expect(projs.MyOtherProject.targetLanguages).to.include('de');
                expect(projs.MyOtherProject.targetLanguages).to.include('zh-Hans');
                expect(projs.MyOtherProject.targetLanguages).to.not.include('es');
                expect(projs.MyOtherProject.targetLanguages).to.not.include('fr');
                expect(resp.projects.length).to.equal(2);
                done();
            }, done);
        });
    });

    describe('getProject(MyOtherProject)', function() {
        it('should let us query our 2nd project', function(done) {
            taas.getProject({ projectID: 'MyOtherProject' }, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.project.targetLanguages).to.include('de');
                expect(resp.project.targetLanguages).to.include('zh-Hans');
                expect(resp.project.targetLanguages).to.not.include('es');
                expect(resp.project.targetLanguages).to.not.include('fr');
                expect(resp.project.targetLanguages).to.not.include('it');
                 done();
            }, done);
        });
    });

    describe('updateProject(MyOtherProject) +it', function() {
        it('should let us change the target languages', function(done) {
            taas.updateProject({ projectID: 'MyOtherProject', 
                                 body: { newTargetLanguages: ["it"] }},
                               function good(resp) {
                                   expect(resp.status).to.equal('success');
                                   done();
                               }, done);
            });
    });

    describe('getProject(MyOtherProject)', function() {
        it('should let us query our 2nd project again', function(done) {
            taas.getProject({ projectID: 'MyOtherProject' }, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.project.targetLanguages).to.include('de');
                expect(resp.project.targetLanguages).to.include('it');
                expect(resp.project.targetLanguages).to.include('zh-Hans');
                expect(resp.project.targetLanguages).to.not.include('es');
                expect(resp.project.targetLanguages).to.not.include('fr');
                done();
            }, done);
        });
    });

    describe('deleteLangauge(MyOtherProject) -de', function() {
        it('should let us delete German from 2nd project', function(done) {
            taas.deleteLanguage({ projectID: 'MyOtherProject', languageID: 'de' }, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });

    describe('getProject(MyOtherProject)', function() {
        it('should let us query our 2nd project yet again', function(done) {
            taas.getProject({ projectID: 'MyOtherProject' }, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.project.targetLanguages).to.not.include('de');
                expect(resp.project.targetLanguages).to.include('it');
                expect(resp.project.targetLanguages).to.include('zh-Hans');
                expect(resp.project.targetLanguages).to.not.include('es');
                expect(resp.project.targetLanguages).to.not.include('fr');
                done();
            }, done);
        });
    });

    describe('updateProject(MyOtherProject) +de', function() {
        it('should let us change the target languages', function(done) {
            taas.updateProject({ projectID: 'MyOtherProject', 
                                 body: { newTargetLanguages: ["de"] }},
                               function good(resp) {
                                   expect(resp.status).to.equal('success');
                                   done();
                               }, done);
            });
    });

    describe('getProject(MyOtherProject)', function() {
        it('should let us query our 2nd project again again', function(done) {
            taas.getProject({ projectID: 'MyOtherProject' }, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.project.targetLanguages).to.include('de');
                expect(resp.project.targetLanguages).to.include('it');
                expect(resp.project.targetLanguages).to.include('zh-Hans');
                expect(resp.project.targetLanguages).to.not.include('es');
                expect(resp.project.targetLanguages).to.not.include('fr');
                done();
            }, done);
        });
    });

    describe('getProject(nonExist)', function() {
        it('should NOT let us query a non-existent project', function(done) {
            taas.getProject({ projectID: 'MyBadProject' }, function good(resp) {
                expect(resp.status).to.not.equal('success');
                done('Should not have worked');
            }, function(x){done();});
        });
    });

    describe('deleteProject', function() {
        it('should let us deleted', function(done) {
            taas.deleteProject({ projectID: 'MyOtherProject' }, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });

    describe('getProjectList', function() {
        it('should return just our one project in the list', function(done) {
            taas.getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.projects.length).to.equal(1);
                expect(resp.projects[0].id).to.equal('MyProject');
                done();
            }, done);
        });
    });


    describe('updateResourceData(en)', function() {
        it('should let us update some data', function(done) {
            taas.updateResourceData({projectID: 'MyProject', languageID: 'en',
                                     body: { data: sourceData, replace: false }},
                                    function good(resp) {
                                        expect(resp.status).to.be.equal('success');
                                        done();
                                    }, done);
        });
    });


    describe('deleteProject', function() {
        it('should let us deleted', function(done) {
            taas.deleteProject({ projectID: 'MyProject' }, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });

    describe('getProjectList', function() {
        it('should return an empty list again', function(done) {
            taas.getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.projects).to.be.empty;
                done();
            }, done);
        });
    });

});

        // console.log("Create:");
        // console.log(taas._api.projects.createProject({"api-key": apiKey, 
        //                                              body: {
        //                                                  id: projectId,
        //                                                  sourceLanguage: "en",
        //                                                  targetLanguages: ["de","fr"]
        //                                              }}));
        // console.log("Projects again:");
        // console.log(taas._api.projects.getProjectList({"api-key": apiKey}));
        // console.log("Inject data:");
        // console.log(taas._api.projects.updateResourceData({"api-key": apiKey,
    //                                                    projectID: projectId,
    //                                                    languageID: "en",
    //                                                    body: {
    //                                                        resourceData: {
    //                                                            hello: "Hello",
    //                                                            bye: "Goodbye"
    //                                                        }
    //                                                    }}));
    // console.log("verify data en:");
    // console.log(taas._api.projects.getResourceData({"api-key": apiKey,
    //                                                 projectID: projectId,
    //                                                 languageID: "en"}));
    // console.log("verify data de:");
    // console.log(taas._api.projects.getResourceData({"api-key": apiKey,
    //                                                 projectID: projectId,
    //                                                 languageID: "de"}));
    // console.log("verify data fr:");
    // console.log(taas._api.projects.getResourceData({"api-key": apiKey,
    //                                                 projectID: projectId,
    //                                                 languageID: "fr"}));



//taas.translate({source: sourceLoc, target: targLoc, data: sourceData}, function OKAY(x) {
//    console.log('-'); console.log(x); console.log("RESPONSE: " + JSON.stringify(x.entity));
//} , function ERR(x){ console.log("ERR:"); console.log(x);  });

//taas.schema(console.log, console.err, []); // 

// Local Variables:
// compile-command: "cd c:/Users/IBM_ADMIN/git/taas-nodejs-client/ ; npm run test"
// End:
