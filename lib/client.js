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

/**
 * Construct a GaaS client
 * @function gaas.getClient
 * @param {object} params - configuration params
 * @param {Object.<string,string>} params.credentials - Bound credentials
 * @param {string} params.credentials.uri - service URL. (should end in '/translate')
 * @param {string} params.credentials.api_key - service API key.
 * @returns {Client}
 */
exports.getClient = function getClient(params) {
  return new Client(params);
};

/** @class Client */
function Client(options) {
  this._options = options;
  this._swaggerClient = require('swagger-client');
  var needAll = ' - expected {credentials: { uri: ...,  api_key: ... }}';

  if ( !this._options.credentials ) {
    throw new Error("gaas: missing 'credentials' " + needAll);
  } else if ( !this._options.credentials.uri ) {
    throw new Error("gaas: missing 'credentials.uri'   " + needAll);
  } else if ( !this._options.credentials.api_key ) {
    throw new Error("gaas: missing 'credentials.api_key'  " + needAll);
  }

  this._schema = null;
  this._options.credentials.uri = removeTrailing(this._options.credentials.uri, '/');
  //this._swaggerClient.authorizations.add("api-key", new this._swaggerClient.ApiKeyAuthorization("api-key",options.api_key,"query"));
  if ( debugURL ) console.log('just created a client with ' + JSON.stringify(options));
};

Client.prototype.version = version;

/**
 * Add auth key. modifies input.
 * @ignore
 */
Client.prototype._addAuth = function _addAuth(opts) {
  opts["api-key"] = this._options.credentials.api_key;
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
    var schemaUrl = this._options.credentials.uri + '/rest/swagger.json';
    if(debugREST) console.log('.. fetching ' + schemaUrl);
    var that = this;
    this._api = new this._swaggerClient({
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
        } else if(!that._api[par]) {
          cb(Error(funcname+': GaaS Swagger API could not be fetched (network or internal error? section "'+par+'" missing.)'));
        } else if(!that._api[par][func]) {
          cb(Error(funcname+': GaaS Swagger API could not be fetched (network or internal error? section "'+par+':'+par+'" missing.)'));
        } else {
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
        }
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
 * @callback basicCallback
 * @param {object} err - if(err), error
 * @param {object} result - any result data
 */

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

/** @class ResourceData */
function ResourceData(project, props) {
  if ( props ) {
    // copy properties to this
    for(var k in props) {
      this[k] = props[k];
    }
  }
  this.project = project;
}

/** @class ResourceEntry */
function ResourceEntry(project, props) {
  if ( props ) {
    // copy properties to this
    for(var k in props) {
      this[k] = props[k];
    }
  }
  this.project = project;
}

/** @class Project */
function Project(gaas, projectID, props) {
  if ( props ) {
    // copy properties to this
    for(var k in props) {
      this[k] = props[k];
    }
  }
  this.gaas = gaas; // actually Client
  this.id = projectID;
}

/**
 * Create the project
 * @param {object} args - parameters for creation
 * @param {string} args.sourceLanguage - BCP47 langauge tag of translation source
 * @param {string[]} args.targetLanguages - optional array of BCP47 language tags for translation target
 * @param {basicCallback} cb
 */
Project.prototype.create = function create(args, cb) {
  this.gaas.rest_createProject({ body: { id: this.id,
                                         sourceLanguage: args.sourceLanguage,
                                         targetLanguages: args.targetLanguages
                                       }}, cb);
};

/**
 * Remove the project
 * @param {object} args - (ignored)
 * @param {basicCallback} cb
 */
Project.prototype.remove = function remove(args, cb) {
  this.gaas.rest_deleteProject({ projectID: this.id}, cb);
};

/**
 * @callback projectInfoCallback
 * @param {object} err - if(err), error
 * @param {Project} project - the updated Project object with the latest data
 */

/**
 * Fetch project information. The callback is given
 * a new Project object with updated information.
 * @params {object} args - (ignored)
 * @params {projectInfoCallback} cb
 */
Project.prototype.getInfo = function getInfo(args, cb) {
  var that = this;
  this.gaas.rest_getProject({ projectID: this.id }, function mySuccess(err, resp) {
    if(err) {
      cb(err);
    } else if(resp.project) {
      cb(null, that.gaas.project(that.id, resp.project)); // copy detailed data
    } else {
      cb(Error("Response was lacking project information"));
    }
  });
};

/**
 * Add target languages to the project
 * @param {object} args
 * @param {string[]} args.newTargetLanguages - array of 1 or more languages to add
 * @param {basicCallback} cb
 */
Project.prototype.addTargetLanguages = function addTargetLanguages(args0, cb) {
  var args = {
      body: args0,
      projectID: this.id
  };
  this.gaas.rest_updateProject(args, cb);
};

/**
 * @callback resourceCallback
 * @param {object} err - if(err), error
 * @param {ResourceData} resource - the specified resource data
 * @param {Object.<string, string>} resource.data - the translated key/value pairs
 * @param {string[]} resource.inProgress - a list of the keys that are still in progress
 * @param {string[]} resource.failed - a list of the keys that failed to translate
 */

/**
 * Get resourcedata for one language
 * @param {object} args
 * @param {string} args.languageID - which BCP47 language to get info for
 * @param {resourceCallback} cb
 */
Project.prototype.getResourceData = function getResourceData(args, cb) {
  var that = this;
  args.projectID = this.id;
  this.gaas.rest_getResourceData(args, function(err, resp) {
    if(err) {
      cb(err);
    } else if(resp.resourceData) {
      cb(null, new ResourceData(that, resp.resourceData), resp);
    } else {
      cb(Error("Response was lacking resource information"));
    }
  });
};

/**
 * Update resource data and/or retry translation
 * @param {object} args
 * @param {string} args.languageID - language to update (source or target)
 * @param {object} args.body
 * @param {boolean} args.body.replace - if true, replace ALL resource keys instead of just appending
 * @param {boolean} args.body.retry - if true, retry translation
 * @param {Object.<string, string>} args.body.data - key/value pairs to update
 * @param {basicCallback} cb
 */
Project.prototype.updateResourceData = function updateResourceData(args, cb) {
  args.projectID = this.id;
  this.gaas.rest_updateResourceData(args, cb);
};

/**
 * Delete a target language from the project.
 * (Source languages cannot be deleted)
 * @param {object} args
 * @param {string} args.languageID - BCP47 id of language to delete
 * @param {basicCallback} cb
 */
Project.prototype.deleteLanguage = function deleteLanguage(args, cb) {
  args.projectID = this.id;
  this.gaas.rest_deleteLanguage(args, cb);
};

/**
 * @callback resourceCallback
 * @param {object} err - if(err), error
 * @param {ResourceEntry} entry - the specified resource entry
 * @param {string} entry.value - the entry's string value
 * @param {string} entry.translationStatus - the entry's translation status
 */

/**
 * Get a single ResourceEntry
 * @param {object} args
 * @param {string} args.languageID - langauge name to fetch
 * @param {string} args.resKey - key name to fetch
 * @param {entryCallback} cb
 */
Project.prototype.getResourceEntry = function getResourceEntry(args, cb) {
  var that = this;
  args.projectID = this.id;
  this.gaas.rest_getResourceEntry(args, function(err, resp) {
    if(err) {
      cb(err);
    } else if (resp.resourceEntry) {
      cb(null, new ResourceEntry(that, resp.resourceEntry), resp);
    } else {
      cb(Error("Response was lacking resource entry information"));
    }
  });
};

/**
 * Create a new Project object for further access.
 * Note that this function doesn't create the project or fetch any information.
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
 * @param {object} args - currently not used
 * @praram {listCallback} cb - callback
 */
Client.prototype.listProjects = function listProjects(args, cb) {
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
  return this._options.credentials.uri;
};

var assert = require('assert');
var version = "v2";
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
