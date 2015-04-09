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
 * @module gaas
 */

var assert = require('assert');

var version = "v1";
var urlStub = "/"+version+"/service/";
var debugURL = false;
var debugREST = false;
/**
 * Remove trailing text from a string
 * @param {string} str - Input string
 * @param {string} chr - Text to be removed
 * @ignore
 */
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

/** @class */
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
 * @ignore
 */
Client.prototype._addAuth = function _addAuth(opts) {
  opts["api-key"] = this._options.api;
  return opts;
};

/**
 * @param {Object} args
 * @param {Function} cb
 * @ignore
 */
Client.prototype._fetchApi = function _fetchApi(args, cb) {
  if ( debugREST ) {
    console.log('args=');
    console.dir(args);
  }
  // TODO: if api is a string, return it as a failure?
  if(this._api) {
    if(debugREST) console.log('.. already had api..');
    args.unshift(null); // no err
    cb.apply(that, args);
  } else {
    var schemaUrl = this._options.url + '/v1/api-docs';
    if(debugREST) console.log('.. fetching ' + schemaUrl);
    var that = this;
    this._api = new this._swaggerClient.SwaggerApi({
      url: schemaUrl,
      success: function() {
        if(that._api.ready === true) {
          args.unshift(null); // no err
          if(debugREST) {
            console.log(' API is ready, passing: ');
            console.dir(args);
          }
          cb.apply(that, args);
        } else {
          if(debugREST) {
            console.log('.. swagger not ready yet');
          }
          cb.call(that, Error('Internal error: Swagger API was not ready in time'));
        }
      },
      failure: function(err) {
        // Swagger returned an error
        cb.call(that, err);
      }
    });
  }
};

/**
 * Add API to object
 * @param {object} obj - client to add API 
 * @param {string} par - parent of API
 * @param {string} func - Function name
 * @ignore
 */
function addApi(obj, par, func) {
  var funcname = 'rest_' + func;
  //console.log('Adding '+funcname);
  obj.prototype._rest_list.push(funcname); // add function to the list

  obj.prototype[funcname] = function someApi(args, cb) {
    if( debugREST ) {
      console.log('CALL: ' + funcname + ' == ' + par +':'+func);
      console.dir(args);
      console.dir(cb);
    }
    // fetch the API if not already fetched
    var that = this;
    this._fetchApi(
      [this._addAuth(args)],  // args to pass on to the 'real' function call - just updated params
      function apiIsFetched(err2, args2) {
        if(err2) {
          cb(err2);
          return;
        } else if(!that._api) {
          console.dir(that);
          cb(Error(funcname+': GaaS Swagger API could not be fetched (network or internal error?)'));
          return;
        }

        // call the actual Swagger-generated API with: ( {json}, onSuccess, onFailure )
        that._api[par][func](
          args2,
          function onRestSuccess(resp) {
            if(resp && resp.status === 500) {
              // server returned an internal error
              cb({error: 'error status returned', status: err.status});
            } else if (resp && resp.obj && resp.obj.status !== 'success') {
              // REST returned an error
              cb(resp.obj);
            } else {
              // SUCCESS!
              cb(null, resp.obj);
            }
          }, function onRestFail(err) {
            if(err && err.status === 500) {
              cb({error: 'error status returned', status: err.status});
            } else if(err.obj) {
              cb(err.obj);
            } else {
              cb(err);
            }
          });
      });
  };
}

/**
 * @ignore
 */
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

// this adds the rest_* functions from the list
addApis(Client, 
        require('./rest-list.js')
       );

/**
 * @callback supportedTranslationsCallback
 * @param {object} err - if(err), error
 * @param {Object.<string,string[]>} translations - source : [target...] languages
 */


/**
 * This function returns a map from source language(s) to target language(s).
 * @param {object} args
 * @param {supportedTranslationsCallback} cb
 */
Client.prototype.supportedTranslations = function supportedTranslations(args, cb) {
  this.rest_getInfo(args, function(err, resp) {
    if(err) {
      if(debugREST) {
        console.log('ST gave ' + JSON.stringify(err));
      }
      cb(err);
    } else if(resp.supportedTranslation) {
      cb(null, resp.supportedTranslation);
    } else {
      cb(new Error("'supportedTranslation' not found in server response"));
    }
  });
};

/**
 * Do we have access to the server?
 * @param {object} args - (ignored)
 * @param {callback} cb
 */
Client.prototype.ping = function ping(args, cb) {
  this.rest_getInfo({}, function(err, resp) {
    if(err) {
      cb(err);
    } else {
      cb();
    }
  });
}

/** @class */
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

/**
 * Create the project
 */
Project.prototype.create = function create(params, cb) {
  this.gaas.rest_createProject({ body: { id: this.id,
                                         sourceLanguage: params.sourceLanguage,
                                         targetLanguages: params.targetLanguages
                                       }}, cb);
};


/**
 * Remove the project
 */
Project.prototype.remove = function remove(params, cb) {
  this.gaas.rest_deleteProject({ projectID: this.id}, cb);
};

/**
 * Get project info
 */
Project.prototype.getInfo = function getInfo(params, cb) {
  var that = this;
  this.gaas.rest_getProject({ projectID: this.id }, function mySuccess(err, resp) {
    if(err) {
      cb(err);
    } else if(resp.project) {
      cb(null, that.project(that.id, resp.project)); // copy detailed data
    } else {
      cb(Error("Response was lacking project information"));
    }
  });
};

/**
 * Create a new Project object for further access.
 * Note that this function doesn't create teh project or fetch any information.
 * @param {string} projectID
 * @param {object} props - optional properties to set on the object
 */
Client.prototype.project = function project(projectID, props) {
  return new Project(this, projectID, props);
};

/**
 * @callback listCallback
 * @param {object} err - if(err), error
 * @param {Object.<string,Project>} projects - map from project ID to project object
 */

/**
 * List the projects available
 * @param {object} params - currently not used
 * @praram {listCallback} cb - callback
 */
Client.prototype.listProjects = function listProjects(params, cb) {
  var that = this;
  this.rest_getProjectList( {}, function(err, resp) {
    if(err) { cb(err); return; }
    var projects = {};
    for(var k in resp.projects) {
      var proj = that.project(resp.projects[k].id, resp.projects[k]);
      projects[proj.id] = proj;
    }
    cb(null, projects);
  });
};

/**
 * for testing. Internal.
 * @ignore
 */
Client.prototype._getUrl = function _getUrl() {
  return this._options.url;
};

// our exports
module.exports = {
  getClient: function getClient(params) {
    return new Client(params);
  }
};
