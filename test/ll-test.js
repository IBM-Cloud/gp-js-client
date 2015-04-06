//* IBM Globalization
//* IBM Confidential / Copyright (C) IBM Corp. 2015
// Low Level test of GAAS API

if(true) {
  console.log('Note: skipping ll-test (for now)');
} else {

var projectId = process.env.GAAS_PROJECT || process.env.TAAS_PROJECT || 'MyProject';
var projectId2 = process.env.GAAS_PROJECT2 || 'MyOtherProject';
var apiKey = process.env.GAAS_API_KEY || process.env.TAAS_API_KEY || 'admin8';
var url = process.env.GAAS_API_URL || process.env.TAAS_API_URL || 'http://127.0.0.1:9131/translate'; // 'https://gaas-dev.stage1.mybluemix.net/translate/';

function removeTrailing(str, chr) {
    if (!str || (str=="")) return str;
    if (str[str.length-1] == chr) {
        return str.substring(0, str.length-1);
    } else {
        return str;
    }
};

var url = removeTrailing(url, '/'); // strip trailing slash

var expect = require('chai').expect;

var assert = require('assert');

var gaas = require('../index.js')({ url: url, api: apiKey, project: projectId });


console.log('REST api list:');
console.dir(gaas.rest_help);

var sourceLoc = "en-US";
var targLoc = "zh-Hans";

var sourceData = {
    "key1": "First string to translate",
    "key2": "Second string to translate"
};

var http_or_https;
if ( url.indexOf('https') === 0) {
    http_or_https = require('https');
} else { 
    http_or_https = require('http');
}

describe('Check URL ' + url+'/', function() {
    it('Should let me fetch landing page', function(done) {
        http_or_https.get(url+'/', // trailing slash to avoid 302
                          function(d) {
                             console.log('-> ' + d.statusCode); // dontcare
                             done();
                          })
        .on('error', done);
    });
});

describe('cleaning up', function() {
    it('Cleanup: Should delete '+projectId+' (ignoring errs)', function(done) {
        try {
            gaas.rest_deleteProject({ projectID: projectId }, function good(resp) {
                done();
            }, function() {done();} );
        } catch (e) { done(); }
    });
    it('Cleanup: Should delete '+projectId2+' (ignoring errs)', function(done) {
        try {
            gaas.rest_deleteProject({ projectID: projectId2 }, function good(resp) {
                done();
            }, function() {done();} );
        } catch (e) { done(); }
    });
});

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
            gaas.rest_getInfo({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.supportedTranslation).to.include.keys('en');
                done();
            }, done);
        });
    });
    describe('getProjectList [expect: []]', function() {
        it('should return an empty list', function(done) {
            gaas.rest_getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.projects).to.be.empty();
                done();
            }, done);
        });
    });
    
    describe('createProject(MyProject)', function() {
        it('should let us create', function(done) {
            gaas.rest_createProject({ body: {id: projectId, sourceLanguage: 'en', targetLanguages: ['es','qru']}}, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });

    describe('updateResourceData(en)', function() {
        it('should let us update some data', function(done) {
            gaas.rest_updateResourceData({projectID: projectId, languageID: 'en',
                                     body: { data: sourceData, replace: false }},
                                    function good(resp) {
                                        expect(resp.status).to.be.equal('success');
                                        done();
                                    }, done);
        });
    });

    describe('getProjectList [expect: MyProject]', function() {
        it('should return our project in the list', function(done) {
            gaas.rest_getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.projects.length).to.equal(1);
                var projs = arrayToHash(resp.projects, 'id');
                expect(projs).to.contain.keys(projectId);
                expect(resp.projects[0].sourceLanguage).to.equal('en');
                expect(projs.MyProject.targetLanguages).to.include('es');
                expect(projs.MyProject.targetLanguages).to.include('qru');
                expect(projs.MyProject.targetLanguages).to.not.include('de');
                expect(projs.MyProject.targetLanguages).to.not.include('zh-Hans');
                done();
            }, done);
        });
    });

    describe('createProject', function() {
        it('should let us create another', function(done) {
            gaas.rest_createProject({ body: {id: projectId2, sourceLanguage: 'en', targetLanguages: ['de','zh-Hans']}}, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });

    describe('getProjectList', function() {
        it('should return our other project in the list', function(done) {
            gaas.rest_getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                var projs = arrayToHash(resp.projects, 'id');
                expect(projs).to.include.keys(projectId);
                expect(projs.MyProject.targetLanguages).to.include('es');
                expect(projs.MyProject.targetLanguages).to.include('qru');
                expect(projs.MyProject.targetLanguages).to.not.include('de');
                expect(projs.MyProject.targetLanguages).to.not.include('zh-Hans');
                expect(projs).to.include.keys(projectId2);
                expect(projs.MyOtherProject.targetLanguages).to.include('de');
                expect(projs.MyOtherProject.targetLanguages).to.include('zh-Hans');
                expect(projs.MyOtherProject.targetLanguages).to.not.include('es');
                expect(projs.MyOtherProject.targetLanguages).to.not.include('qru');
                expect(resp.projects.length).to.equal(2);
                done();
            }, done);
        });
    });

    describe('getProject(MyOtherProject)', function() {
        it('should let us query our 2nd project', function(done) {
            gaas.rest_getProject({ projectID: projectId2 }, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.project.targetLanguages).to.include('de');
                expect(resp.project.targetLanguages).to.include('zh-Hans');
                expect(resp.project.targetLanguages).to.not.include('es');
                expect(resp.project.targetLanguages).to.not.include('qru');
                expect(resp.project.targetLanguages).to.not.include('it');
                 done();
            }, done);
        });
    });

    describe('updateProject(MyOtherProject) +it', function() {
        it('should let us change the target languages', function(done) {
            gaas.rest_updateProject({ projectID: projectId2, 
                                 body: { newTargetLanguages: ["it"] }},
                               function good(resp) {
                                   expect(resp.status).to.equal('success');
                                   done();
                               }, done);
            });
    });

    describe('getProject(MyOtherProject)', function() {
        it('should let us query our 2nd project again', function(done) {
            gaas.rest_getProject({ projectID: projectId2 }, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.project.targetLanguages).to.include('de');
                expect(resp.project.targetLanguages).to.include('it');
                expect(resp.project.targetLanguages).to.include('zh-Hans');
                expect(resp.project.targetLanguages).to.not.include('es');
                expect(resp.project.targetLanguages).to.not.include('qru');
                done();
            }, done);
        });
    });

    describe('deleteLangauge(MyOtherProject) -de', function() {
        it('should let us delete German from 2nd project', function(done) {
            gaas.rest_deleteLanguage({ projectID: projectId2, languageID: 'de' }, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });

    describe('getProject(MyOtherProject)', function() {
        it('should let us query our 2nd project yet again', function(done) {
            gaas.rest_getProject({ projectID: projectId2 }, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.project.targetLanguages).to.not.include('de');
                expect(resp.project.targetLanguages).to.include('it');
                expect(resp.project.targetLanguages).to.include('zh-Hans');
                expect(resp.project.targetLanguages).to.not.include('es');
                expect(resp.project.targetLanguages).to.not.include('qru');
                done();
            }, done);
        });
    });

    describe('updateProject(MyOtherProject) +de', function() {
        it('should let us change the target languages', function(done) {
            gaas.rest_updateProject({ projectID: projectId2, 
                                 body: { newTargetLanguages: ["de"] }},
                               function good(resp) {
                                   expect(resp.status).to.equal('success');
                                   done();
                               }, done);
            });
    });

    describe('getProject(MyOtherProject)', function() {
        it('should let us query our 2nd project again again', function(done) {
            gaas.rest_getProject({ projectID: projectId2 }, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.project.targetLanguages).to.include('de');
                expect(resp.project.targetLanguages).to.include('it');
                expect(resp.project.targetLanguages).to.include('zh-Hans');
                expect(resp.project.targetLanguages).to.not.include('es');
                expect(resp.project.targetLanguages).to.not.include('qru');
                done();
            }, done);
        });
    });

    describe('getProject(nonExist)', function() {
        it('should NOT let us query a non-existent project', function(done) {
            gaas.rest_getProject({ projectID: 'MyBadProject' }, function good(resp) {
                expect(resp.status).to.not.equal('success');
                done('Should not have worked');
            }, function(x){done();});
        });
    });

    describe('deleteProject', function() {
        it('should let us delete', function(done) {
            gaas.rest_deleteProject({ projectID: projectId2 }, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });

    describe('getProjectList', function() {
        it('should return just our one project in the list', function(done) {
            gaas.rest_getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.projects.length).to.equal(1);
                expect(resp.projects[0].id).to.equal(projectId);
                done();
            }, done);
        });
    });

    describe('getResourceData(en)', function() {
        it('should return our resource data for English', function(done) {
            gaas.rest_getResourceData({ projectID: projectId, languageID: 'en'}, function good(resp) {
                console.dir(resp);
                expect(resp.status).to.equal('success');
                //expect(resp.resourceData.translationStatus).to.equal('sourceLanguage');
                expect(resp.resourceData.language).to.equal('en');
                done();
            }, done);
        });
    });

    describe('getResourceEntry(en)', function() {
        it('should return our resource data for English', function(done) {
            gaas.rest_getResourceEntry({ projectID: projectId, languageID: 'en', resKey: 'key1'}, function good(resp) {
                console.dir(resp);
                expect(resp.status).to.equal('success');
                expect(resp.resourceEntry.translationStatus).to.equal('sourceLanguage');
                expect(resp.resourceEntry.language).to.equal('en');
                expect(resp.resourceEntry.key).to.equal('key1');
                expect(resp.resourceEntry.value).to.equal(sourceData['key1']);
                done();
            }, done);
        });
    });

    describe('getResourceData(fr)', function() {
        it('should return our resource data for French', function(done) {
            gaas.rest_getResourceData({ projectID: projectId, languageID: 'qru'}, function good(resp) {
                console.dir(resp);
                expect(resp.status).to.equal('success');
//                expect(resp.resourceData.translationStatus).to.equal('completed');
                expect(resp.resourceData.language).to.equal('qru');
                done();
            }, done);
        });
    });

    describe('deleteProject', function() {
        it('should let us deleted', function(done) {
            gaas.rest_deleteProject({ projectID: projectId }, function good(resp) {
                expect(resp.status).to.equal('success');
                done();
            }, done);
        });
    });

    describe('getResourceData(en)', function() {
        it('should NOT return our resource data for our deleted project', function(done) {
            gaas.rest_getResourceData({ projectID: projectId, languageID: 'en'}, function good(resp) {
                console.dir(resp);
                expect(resp.status).to.not.equal('success');
                done();
            }, function(x) {
                if(x.obj) {
                    console.dir(x.obj);
                }
                done(); // failed, as expected
            });
        });
    });

    describe('getProjectList', function() {
        it('should return an empty list again', function(done) {
            gaas.rest_getProjectList({}, function good(resp) {
                expect(resp.status).to.equal('success');
                expect(resp.projects).to.be.empty;
                done();
            }, done);
        });
    });
});

    // console.log("verify data en:");
    // console.log(gaas._api.projects.getResourceData({"api-key": apiKey,
    //                                                 projectID: projectId,
    //                                                 languageID: "en"}));
    // console.log("verify data de:");
    // console.log(gaas._api.projects.getResourceData({"api-key": apiKey,
    //                                                 projectID: projectId,
    //                                                 languageID: "de"}));
    // console.log("verify data fr:");
    // console.log(gaas._api.projects.getResourceData({"api-key": apiKey,
    //                                                 projectID: projectId,
    //                                                 languageID: "fr"}));

}
// Local Variables:
// compile-command: "cd c:/Users/IBM_ADMIN/git/taas-nodejs-client/ ; npm run test"
// End:
