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

/**
 * @author Steven R. Loomis
 */

var version = "v1";
var urlStub = "/"+version+"/service/";

var debugURL = false;

function removeTrailing(str, chr) {
  if (!str || (str=="")) return str;
  var newIdx = str.length-chr.length;
  if(newIdx < 0) return str;
  if (str.substring(newIdx, str.length) == chr) {
    return str.substring(0, newIdx);
  } else {
    return str;
  }
};

function Client(options) {
  this._options = options;
  this._swaggerClient = require('swagger-client');
  // TODO: replace with cfenv - work item 86788
  if ( this._options.vcap ) {
    if ( typeof(this._options.vcap) === 'string' ) {
      this._options.vcap = JSON.parse(this._options.vcap);
    }

    var foundService  = null;
    if ( this._options.vcap["IBM Globalization"] ) {
      foundService = this._options.vcap["IBM Globalization"][0];
    }

    if ( foundService ) {
      if ( this._options.url === undefined ) {
        this._options.url = foundService.credentials.uri;
      }
      if ( this._options.api === undefined ) {
        this._options.api = foundService.credentials.api_key;
      }
    }
  }

  if ( !this._options.url ) {
    throw new Error("No { url: ... }  defined for gaas client");
  }

  this._options.url = removeTrailing(this._options.url, '/');
  this._schema = null;
  this._swaggerClient.authorizations.add("api-key", new this._swaggerClient.ApiKeyAuthorization("api-key",options.api,"query"));
  if ( debugURL ) console.log('just created a client with ' + JSON.stringify(options));
};

Client.prototype.version = version;

/**
 * Add auth key. modifies input.
 */
Client.prototype._addAuth = function _addAuth(opts) {
  opts["api-key"] = this._options.api;
  return opts;
};

Client.prototype._fetchApi = function _fetchApi(onSuccess, onFailure, args) {
  //console.log('args=');
  //console.dir(args);
  // TODO: if api is a string, return it as a failure?
  if(this._api) {
    //console.log('.. already had api..');
    onSuccess.apply(this, args);
  } else {
    var schemaUrl = this._options.url + '/v1/api-docs';
    //console.log('.. fetching ' + schemaUrl);
    var that = this;
    this._api = new this._swaggerClient.SwaggerApi({
      url: schemaUrl,
      success: function() {
        if(that._api.ready === true) {
          //console.log(' API is ready, passing: ');
          //console.dir(args);
          onSuccess.apply(that, args);
        } else {
          console.log('.. swagger not ready yet');
        }
      },
      failure: function(err) {
        console.error('Failure: ');
        console.error(err);
      }
    });
  }
};

function addApi(obj, par, func) {
  var funcname = 'rest_' + func;
  //console.log('Adding '+funcname);
  obj.prototype._rest_list.push(funcname);

  obj.prototype[funcname] = function someApi(args, onSuccess, onFailure) {
    this._fetchApi(function someApiInner(args2) {
      this._api[par][func](args2, function(resp) {
                                  if(resp && resp.status === 500) {
                                    onFailure({error: 'error status returned', status: err.status});
                                  } else if (resp && resp.obj && resp.obj.status !== 'success') {
                                    onFailure(resp.obj);
                                  } else {
                                    onSuccess(resp.obj);
                                  }
                                }, function someApiFailure(err) {
                                  if(err && err.status === 500) {
                                    onFailure({error: 'error status returned', status: err.status});
                                  } else if(err.obj) {
                                    onFailure(err.obj);
                                  } else {
                                    onFailure(err);
                                  }
                                });
    }, function someFailure(err) {
      if(err && err.status) {
        onFailure({error: 'error status returned', status: err.status});
      } else if(err.obj) {
      onFailure(err.obj);
      } else {
        onFailure(err);
      }
    }, [this._addAuth(args)]);
  };
}

function addApis(obj, apiList) {
  obj.prototype._rest_list = [];
  for(var api in apiList) {
    var sub = apiList[api];
    if(typeof(sub) === 'string') {
      addApi(obj, sub);
    } else {
      for(var n in sub) {
        addApi(obj, api, sub[n]);
      }
    }
  }
}

addApis(Client, 
        require('./rest-list.js')
       );

Client.prototype.supportedTranslations = function supportedTranslations(args, onSuccess, onFailure) {
  this.rest_getInfo(args, function(resp) {
    if(resp.supportedTranslation) {
      onSuccess(resp.supportedTranslation);
    } else {
      onFailure(new Error("'supportedTranslation' not found in server response"));
    }
  }, onFailure);
};

// PROJECT object. Thin wrapper.
function Project(gaas, projectID, props) {
  if ( props ) {
    // copy properties to this
    for(var k in props) {
      this[k] = props[k];
    }
  }
  this.gaas = gaas;
  this.id = projectID;
}

Project.prototype.create = function create(params, onSuccess, onFailure) {
  this.gaas.rest_createProject({ body: { id: this.id,
                                 sourceLanguage: params.sourceLanguage,
                                 targetLanguages: params.targetLanguages
                                 }}, onSuccess, onFailure);
};


Project.prototype.remove = function remove(params, onSuccess, onFailure) {
  this.gaas.rest_deleteProject({ projectID: this.id}, onSuccess, onFailure);
};

Project.prototype.getInfo = function getInfo(params, onSuccess, onFailure) {
  var that = this;
  this.gaas.rest_getProject({ projectID: this.id}, function mySuccess(resp) {
    if(resp.project) {
      onSuccess(that.project(that.id, resp.project)); // copy detailed data
    } else {
      onFailure(Error("Response was lacking project information"));
    }
  }, onFailure);
};

Client.prototype.project = function project(projectID, props) {
  return new Project(this, projectID, props);
};

Client.prototype.listProjects = function listProjects(params, onSuccess, onFailure) {
  var that = this;
  this.rest_getProjectList( {}, function mySuccess(resp) {
    var projects = {};
    for(var k in resp.projects) {
      var proj = that.project(resp.projects[k].id, resp.projects[k]);
      projects[proj.id] = proj;
    }
    onSuccess(projects);
  }, onFailure);
};
// for testing. Internal.

Client.prototype._getUrl = function _getUrl() {
  return this._options.url;
};

module.exports = {
  Client: Client
};
