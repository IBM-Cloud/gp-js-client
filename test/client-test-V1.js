/*	
 * Copyright IBM Corp. 2015
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


describe('client-test-v1', function() {
  it('TODO: port client-test-V1 to client-test.js');
});

return;

/*


 ...(moved from client-test.js)

describe('gaasClient.project('+projectId+')', function() {
  it('should let us update some data(en)', function(done) {
    var proj = gaasClient.project(projectId);
    proj.updateResourceData({ languageID: 'en',
                              body: { replace: false, retry: false, data: sourceData}},done);
  });
  // at this point, the qru data will not have finished.
  it('should show qru as in progress', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('qru');
      expect(entry.key).to.equal('key1');
      expect(entry.translationStatus).to.equal("inProgress");
      done();
    });
  });
  // wait for qru to finish
  it('should let qru finish', function(done) {
    var proj = gaasClient.project(projectId);
    var loopy = function() {
      minispin.step();
      proj.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
      function(err, entry) {
        if(err) {done(err); return; }
        expect(entry.language).to.equal('qru');
        expect(entry.key).to.equal('key1');
        if(VERBOSE) process.stderr.write(entry.translationStatus);
        if(entry.translationStatus === "inProgress") {
          setTimeout(loopy, 500); // try again
        } else {
          expect(entry.translationStatus).to.equal("completed"); // if not in progress, better be done.
          minispin.clear();
          done(); // get out.
        }
      });
    };
    process.nextTick(loopy); // first run
  });
  // qru should be done now.
  it('should NOT us update the wrong language(tlh)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.updateResourceData({ languageID: 'tlh',
                              body: { replace: false, retry: false, data: sourceData}},
    function(err){if(err){done(); return;} done(Error('should have failed')); });
  });
  it('should let us verify the source data(en)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceData({ languageID: 'en'},
    function(err, data) {
      if(err) {done(err); return; }
      expect(data.language).to.equal('en');
      expect(data).to.have.a.property('data');
      expect(JSON.stringify(data.data)).to.equal(JSON.stringify(sourceData));
      done();
    });
  });
  it('should let us verify one key (en/key1)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceEntry({ languageID: 'en', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('en');
      expect(entry.key).to.equal('key1');
      expect(entry.value).to.equal(sourceData.key1);
      done();
    });
  });
  it('should let us verify the target data(qru)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceData({ languageID: 'qru'},
    function(err, data) {
      if(err) {done(err); return; }
      expect(data.language).to.equal('qru');
      expect(data).to.have.a.property('data');
      expect(JSON.stringify(data.data)).to.equal(JSON.stringify(qruData));
      done();
    });
  });
  it('should let us verify one key (qru/key1)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('qru');
      expect(entry.key).to.equal('key1');
      expect(entry.value).to.equal(qruData.key1);
      done();
    });
  });
  it('should let us add language zxx', function(done) {
    var proj = gaasClient.project(projectId);
    proj.addTargetLanguages({newTargetLanguages:['zxx']}, done);
  });
  it('Should let us verify the project info', function(done) {
    var proj = gaasClient.project(projectId);
    proj.getInfo({}, function(err, proj2) {
      if(err) { done(err); return; }
      expect(proj2.readerKey).to.be.a('string');
      expect(proj2.readerKey).to.not.equal(opts.credentials.api_key);
      ourReaderKey = proj2.readerKey; // set this
      expect(proj2.id).to.equal(projectId);
      expect(proj2.sourceLanguage).to.equal('en');
      expect(proj2.targetLanguages).to.include('es');
      expect(proj2.targetLanguages).to.include('qru');
      expect(proj2.targetLanguages).to.include('zxx');
      done();
    });
  });
  it('Should let us use the reader key', function(done) {
    ourReaderClient = gaas.getClient({
      credentials: {
        uri: opts.credentials.uri,
        api_key: ourReaderKey
      }
    });
    var ourReaderProject = ourReaderClient.project(projectId);
    ourReaderProject.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('qru');
      expect(entry.key).to.equal('key1');
      expect(entry.value).to.equal(qruData.key1);
      done();
    });
  });

  it('should let us verify failed target data(zxx)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceData({ languageID: 'zxx'},
    function(err, data) {
      if(err) {done(err); return; }
      expect(data.language).to.equal('zxx');
      expect(data).to.have.a.property('data');
      expect(JSON.stringify(data.data)).to.equal(JSON.stringify({})); //‽
      expect(data.failed).to.include('key1');
      expect(data.failed).to.include('key2');
      done();
    });
  });
  it('Should let us modify one entry(qru)', function(done) {
    var proj = gaasClient.project(projectId);
    proj.updateResourceData({ languageID: 'qru',
                              body: { replace: false, retry: false, data: {key1:str3} } },
                            done);
  });
  it('should let us verify one key (qru/key1) again', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('qru');
      expect(entry.key).to.equal('key1');
      expect(entry.value).to.equal(str3);
      done();
    });
  });
  it('should let us delete language qru', function(done) {
    var proj = gaasClient.project(projectId);
    proj.deleteLanguage({languageID: 'qru'}, done);
  });    
  it('Should let us verify the project info', function(done) {
    var proj = gaasClient.project(projectId);
    proj.getInfo({}, function(err, proj2) {
      if(err) { done(err); return; }
      expect(proj2.readerKey).to.be.a('string');
      expect(proj2.id).to.equal(projectId);
      expect(proj2.sourceLanguage).to.equal('en');
      expect(proj2.targetLanguages).to.include('es');
      expect(proj2.targetLanguages).to.not.include('qru');
      expect(proj2.targetLanguages).to.include('zxx');
      done();
    });
  });
}); 

describe('gaasClient.listProjects()', function() {
  it('Should let us list projects including ' + projectId + ' but not ' + projectId2, function(done) {
    gaasClient.listProjects({}, function(err, projList) {
      if(err) { done(err); return; }
      if(VERBOSE) console.dir(projList);
      expect(projList).to.include.keys(projectId);
      expect(projList).to.not.include.keys(projectId2);
      // if(CLEANSLATE) expect(projList).to.be.empty()
      done();
    }, done);
  });
});



describe('gaasClient.project('+projectId+').remove()', function() {
  it('Should let us delete', function(done) {
    var proj = gaasClient.project(projectId);
    proj.remove({}, function cb(err, resp) {
      if(err) { done(err); return; }
      done();
    }, done);
  });
});


describe('gaasClient.listProjects()', function() {
  it('Should let us list projects, not including ' + projectId + ' or ' + projectId2, function(done) {
    gaasClient.listProjects({}, function(err, projList) {
      if(err) { done(err); return; }
      if(VERBOSE) console.dir(projList);
      expect(projList).to.not.include.keys(projectId);
      expect(projList).to.not.include.keys(projectId2);
      // if(CLEANSLATE) expect(projList).to.be.empty()
      done();
    }, done);
  });
});

*/
