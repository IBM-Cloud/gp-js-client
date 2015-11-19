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
 * @module g11n-pipeline
 */

var utils = require('./utils.js');
var SwaggerClient =  require('swagger-client');
var GpHmac = require('./gp-hmac');

/**
 * Construct a g11n-pipeline client. 
 * params.credentials is required unless params.appEnv is supplied.
 * @function gp.getClient
 * @param {Object} params - configuration params
 * @param {Object} params.appEnv - pass the result of cfEnv.getAppEnv(). Ignored if params.credentials is supplied.
 * @param {Object.<string,string>} params.credentials - Bound credentials as from the CF service broker (overrides appEnv)
 * @param {string} params.credentials.url - service URL. (should end in '/translate')
 * @param {string} params.credentials.userId - service API key.
 * @param {string} params.credentials.password - service API key.
 * @param {string} params.credentials.instanceId - instance ID
 * @returns {Client}
 */ 
exports.getClient = function getClient(params) {
  if(params.appEnv && !params.credentials) {
    params.credentials = params.appEnv.getServiceCreds(exports.serviceRegex);
  }
  return new Client(params);
};

/**
 * a Regex for matching the service.
 * Usage: var credentials = require('cfEnv')
 *      .getAppEnv().getServiceCreds(gp.serviceRegex);
 * @property gp.serviceRegex
 */
exports.serviceRegex = /(gp-|g11n-pipeline).*/;


exports.exampleCredentials = {
  url: "Globalization Pipeline URL",
  userId: "User ID",
  password: "secretpassword",
  instanceId: "your Instance ID"
};

var exampleCredentialsString = "credentials: " + JSON.stringify(exports.exampleCredentials);

function isMissingField(obj, fields) {
  var missing = [];
  for(var k in fields) {
    if(!obj[fields[k]]) {
      missing.push(fields[k]);
    }
  }
  return missing;
}

/** @class Client */
function Client(options) {
  this._options = options;
  if ( !this._options.credentials ) {
    throw new Error("g11n-pipeline: missing 'credentials' " + Object.keys(exports.exampleCredentials));
  }
  var missingField = isMissingField(this._options.credentials, Object.keys(exports.exampleCredentials));
  if(missingField.length !== 0) {
    throw new Error("g11n-pipeline: missing credentials fields: \"" + missingField.join(' ') + "\" - expected: " + exampleCredentialsString);
  }
  
  if( this._options.credentials.instanceId ) {
    this._options.serviceInstance = this._options.credentials.instanceId;
  }

  this._schema = null;
  this._options.credentials.url = exports._normalizeUrl(this._options.credentials.url);  
  if ( debugURL ) console.log('just created a client with ' + JSON.stringify(options));
};

Client.prototype.version = version;

Client.prototype.authorizations = {};

/**
 * Get the REST APIs. Use with ready()
 * @return {Object} - Map of API operations, otherwise null if not ready.
 */
Client.prototype.apis = function apis() {
  if(this.swaggerClient && this.swaggerClient.ready) {
    return this.swaggerClient.apis;
  } else {
    return null;
  }
}

/**
 * Verify that the client is ready before proceeding.
 * @param {Object} arg - arg option, passed to cb on success or failure
 * @param {Function} cb - callback (called with (null, arg, apis) on success
 */
Client.prototype.ready = function ready(arg, cb) {
  // TODO: if api is a string, return it as a failure?
  if(this.swaggerClient) {
    if(debugREST) console.log('.. already had api..');
    cb(null, arg, this.swaggerClient.apis);
  } else {
    var credentials = this._options.credentials;
    var schemaUrl = this._options.credentials.url + '/rest/swagger.json';
    if(debugREST) console.log('.. fetching ' + schemaUrl);
    
    var authorizations;
    
    if (this._options.basicAuth) {
      authorizations = {
        "basic-auth": new SwaggerClient.PasswordAuthorization(credentials.userId, credentials.password)
      };
    } else {
      authorizations = {
        "gp-hmac": new GpHmac("gp-hmac", credentials.userId, credentials.password)
      };
    }
    if(debugREST) console.log(' + authorizations:' + Object.keys(authorizations));
    
    var that = this;
    this.swaggerClient = new SwaggerClient({
      url: schemaUrl,
      authorizations: authorizations,
      success: function() {
        if(that.swaggerClient.ready === true) {
          if(debugREST) console.log('.. swagger loaded && ready');
          cb(null, arg, that.swaggerClient.apis);
        } else {
          if(debugREST) {
            console.log('.. swagger not ready yet');
          }
          cb(Error('Internal error: Swagger API was not ready in time'), arg);
        }
      },
      failure: function(err) {
        if(debugREST) console.log(' !! swagger returned an error:'+err);
        // Swagger returned an error
        cb(err, arg);
      }
    });
  }
};

function RESTError(message, obj) {
  if(obj instanceof Error) {
    return obj;
  }
  if((typeof obj) === "string") {
    // console.log("Got text " + obj);
    try {
      obj = JSON.parse(obj);
    } catch(e) {} 
  } else {
    // console.dir(obj);
  }
  var e;
  if(obj.status === "ERROR"  && obj.message) {
    e = Error(obj.message);
  } else if(message) {
    e = obj; // Error(obj);
  } else if(obj) {
    e = Error(obj);
  }
  e.obj = obj; // back link
  return e;
}
/**
 * Call a REST function. Verify the results.
 * cb is called with the same context.
 * 
 * This is designed for internal implementation.
 * 
 * @param {Array} fn - function name, such as ["admin","getServiceInfo"]
 * @param {Object} restArg - args to the REST call
 * @param {Function} cb
 */
 Client.prototype.restCall = function restCall(fn, restArg, cb) {
   if(!cb || typeof cb !== "function") {
     throw Error("Not a function: " + cb);
   }
   if(typeof(fn)==="string") {
     fn = fn.split('.');
   }
   this.ready({}, function onReady(err, cbArg, apis) {
     if(debugREST) { console.log('RestCall - onReady: ' + fn + ', err: ' + err );}
     if(err) {
       cb(err);
     } else {
       var base = apis;
       for(var i in fn) {
         if(!base.hasOwnProperty(fn[i])) {
           cb(Error('No REST operation: ' + fn.slice(0,i+1).join('.') + ' in ' + fn.join('.')));
           return;
         } else {
           base = base[fn[i]];
         }
       }
       if(typeof(base) !== 'function') {
           cb(Error('REST specifier is a leaf, not a function: ' +  fn.join('.')));
           return;
       }
       
       // call the REST function
       try {
         base(restArg, function onRestSuccess(resp) {
            if(resp && resp.status === 500) {
              // server returned an internal error
              cb(RESTError('Internal server error', resp.obj || resp));
            } else if (resp && resp.obj && 'SUCCESS' !== resp.obj.status) {
              // REST returned an error
              cb(RESTError('Server returned REST err, status:' + resp.obj.status ), resp.obj || resp);
            } else {
              // SUCCESS!
              cb(null, resp.obj );
            }
          }, function onRestFail(resp) {
            
            if(resp && resp.status === 500) {
              cb(RESTError('Fail: Internal server error ', resp.data || resp));
            } else {
              cb(RESTError(resp.toString(), (resp.obj || resp)));
            }
          });
       } catch(e) {
         cb(e);
       }
     }
   });
};


/**
 * Get the serviceInstance id from a parameter or from the 
 * client's default.
 * @param {Object} opts - can be a map, or falsy.
 * @param {String} opts.serviceInstance - the service instance
 * @return {String} - the service instance ID if found
 */
Client.prototype.getServiceInstance = function getServiceInstance(opts) {
  /*if(typeof(opts) === "string" && opts !== "") {
    return opts;
  } else*/ if(opts && opts.serviceInstance && opts.serviceInstance !== "") {
    return opts.serviceInstance;
  } else if(this._options.serviceInstance && this._options.serviceInstance !== "") {
    return this._options.serviceInstance;
  } else {
    return null;
  }
};

/**
 * Get a list of the bundles
 * @param {Object} opts
 * @param {String} opts.serviceInstance - optional service instance
 * @param {basicCallback} cb - callback.
 */
Client.prototype.getBundleList = function getBundleList(opts, cb) {
  var serviceInstance = this.getServiceInstance(opts);
  assert(serviceInstance && serviceInstance!== "", "Could not find a service instance");
  
  this.restCall("bundle.getBundleList", 
    {serviceInstanceId: serviceInstance},
    function(err, restData) {
      if(err) {
        cb(err);
      } else {
        cb(null, restData.bundleIds);
      }
    });
};


/**
 * This function returns a map from source language(s) to target language(s).
 * @param {object} args
 * @param {supportedTranslationsCallback} cb
 */
Client.prototype.supportedTranslations = function supportedTranslations(args, cb) {
  this.getServiceInfo(args, function(err, data) {
    if(err) {
      cb(err);
    } else {
      cb(null, data.supportedTranslation);
    }
  });
};

/**
 * Get information about this service
 * @param {object} args
 * @param {basicCallback} cb
 * 
 */
Client.prototype.getServiceInfo = function getServiceInfo(args, cb) {
  assert(cb !=null, 'cb must not be null');
  this.restCall("service.getServiceInfo", args, cb);
};

/**
 * Do we have access to the server?
 * @param {object} args - (ignored)
 * @param {callback} cb
 * 
 */
Client.prototype.ping = Client.prototype.getServiceInfo;

// --- user stuff ---
/**
 * Create a user
 * @param {object} args - TBD
 * @param {callback} cb
 */
Client.prototype.createUser = function createUser(args, cb) {

  var serviceInstance = this.getServiceInstance(args);
  
  this.restCall("user.createUser", {
    serviceInstanceId: serviceInstance,
    body: {
      "type": args.type,
      displayName: args.displayName,
      comment: args.comment,
      bundles: args.bundles,
      metadata: args.metadata,
      externalId: args.externalId
    },
    serviceManaged: args.serviceManaged
  }, cb);
};
/**
 * Delete a user
 * @param {object} args - TBD
 * @param {callback} cb
 */
Client.prototype.deleteUser = function deleteUser(args, cb) {

  var serviceInstance = this.getServiceInstance(args);
  
  this.restCall("user.deleteUser", {
    serviceInstanceId: serviceInstance,
    userId: args.userId
  }, cb);
};


// /** @class ResourceData */
// function ResourceData(project, props) {
//   if ( props ) {
//     // copy properties to this
//     for(var k in props) {
//       this[k] = props[k];
//     }
//   }
//   this.project = project;
// }

// /** @class ResourceEntry */
// function ResourceEntry(project, props) {
//   if ( props ) {
//     // copy properties to this
//     for(var k in props) {
//       this[k] = props[k];
//     }
//   }
//   this.project = project;
// }

/**
 * @class Bundle
 * @param {Client} gp - parent g11n-pipeline client object
 * @param {Object} props - properties to inherit
 */
function Bundle(gp, props) {
  if ( props ) {
    // copy properties to this
    for(var k in props) {
      this[k] = props[k];
    }
  }
  this.gp = gp; // actually Client
  this.serviceInstance = gp.getServiceInstance(this); // get the service instance ID
  assert(this.id, "Property 'id' missing (bundle ID)");
}

/**
 * Delete this bundle.
 * @param {Object} opts
 * @param {basicCallback} cb
 */
Bundle.prototype.delete = function deleteBundle(opts, cb) {
  this.gp.restCall("bundle.deleteBundle",
     {serviceInstanceId: this.serviceInstance, bundleId: this.id}, cb);
};

/**
 * @param {Object} body - see API docs
 * @param {basicCallback} cb
 * 
 */
Bundle.prototype.create = function createBundle(body, cb) {
  assert(body, 'Need to provide the “body” parameter.');
  this.gp.restCall("bundle.createBundle",
     {serviceInstanceId: this.serviceInstance, bundleId: this.id, body: body}, cb);
};

/**
 * List of fields usable with Bundle.getInfo()
 */
Bundle.prototype.getInfoFields = new utils.Fields(["translationStatusMetricsByLanguage",
                                  "reviewStatusMetricsByLanguage",
                                  "partnerStatusMetricsByLanguage"]);

/**
 * Get bundle info
 * @param {Object} opts - Options object
 * @param {String} opts.fields - Comma separated list of fields
 * @param {Boolean} opts.translationStatusMetricsByLanguage - Optional field (false by default)
 * @param {Boolean} opts.reviewStatusMetricsByLanguage - Optional field (false by default)
 * @param {Boolean} opts.partnerStatusMetricsByLanguage - Optional field (false by default)
 * @param {basicCallback} cb
 */
Bundle.prototype.getInfo = function getBundleInfo(opts, cb) {
  if(!opts) opts = {};
  opts.fields = Bundle.prototype.getInfoFields.processFields(opts);
  this.gp.restCall("bundle.getBundleInfo",
     {serviceInstanceId: this.serviceInstance, bundleId: this.id, fields: opts.fields}, function(err, data) {
       if(err) {
         cb(err);
       } else {
         cb(null, data.bundle);
       }
     });
};

/**
 * Fetch one entry's info
 * @param {Object} opts - options
 * @param {String} opts.languageId - language to fetch
 * @param {String} opts.resourceKey - resource to fetch
 * @param {basicCallback} cb
 */
Bundle.prototype.getStrings = function getStrings(opts, cb) {
  assert(opts, 'Need to provide opts');
  this.gp.restCall('bundle.getResourceStrings',{
    serviceInstanceId: this.serviceInstance, bundleId: this.id,
    languageId: opts.languageId
  }, cb);
};

/**
 * Alias.
 * @ignore
 */
Bundle.prototype.getResourceStrings = Bundle.prototype.getStrings;

/**
 * Fetch one entry's info
 * @param {Object} opts - options
 * @param {String} opts.languageId - language to fetch
 * @param {String} opts.resourceKey - resource to fetch
 * @param {basicCallback} cb
 */
Bundle.prototype.getEntryInfo = function getEntryInfo(opts, cb) {
  assert(opts, 'Need to provide opts');
  this.gp.restCall('bundle.getResourceEntryInfo',{
    serviceInstanceId: this.serviceInstance, bundleId: this.id,
    languageId: opts.languageId,
    resourceKey: opts.resourceKey
  }, cb);
};

/**
 * Alias.
 * @ignore
 */
Bundle.prototype.getResourceEntryInfo = Bundle.prototype.getEntryInfo;

/**
 * Upload some resource strings
 * @param {Object} opts - options
 * @param {String} opts.languageId - language to update
 * @param {Object} opts.strings - strings to update
 * @param {basicCallback} cb
 */
Bundle.prototype.uploadStrings = function uploadResourceStrings(opts, cb) {
  assert(opts, 'Need to provide opts');
  this.gp.restCall("bundle.uploadResourceStrings",
  {
    serviceInstanceId: this.serviceInstance, bundleId: this.id,
    languageId: opts.languageId,
    body: opts.strings
  }, cb);
};

/**
 * Alias
 * @ignore
 */
Bundle.prototype.uploadResourceStrings = Bundle.prototype.uploadStrings;

/**
 * @param {Object} opts - options
 * @param {basicCallback} cb
 */
Bundle.prototype.update = function updateBundle(opts, cb) {
  assert(opts, 'Need to provide opts');
  this.gp.restCall('bundle.updateBundle',
  {
    serviceInstanceId: this.serviceInstance, bundleId: this.id,
    targetLanguages: opts.targetLanguages,
    readOnly: opts.readOnly,
    metadata: opts.metadata,
    partner: opts.partner
  }, cb);
};

/**
 * Alias
 * @ignore
 */
Bundle.prototype.updateBundle = Bundle.prototype.update;

/**
 * @param {Object} opts - options
 * @param {basicCallback} cb
 */
Bundle.prototype.updateStrings = function updateResourceStrings(opts, cb) {
  assert(opts, 'need to provide opts');
  this.gp.restCall('bundle.updateResourceStrings',
  {
    serviceInstanceId: this.serviceInstance, bundleId: this.id,
    strings: opts.strings,
    resync: opts.resync
  }, cb);
};


/**
 * Alias.
 * @ignore
 */
Bundle.prototype.updateResourceStrings = Bundle.prototype.updateStrings;

/**
 * @param {Object} opts - options
 * @param {basicCallback} cb
 */
Bundle.prototype.updateEntryInfo = function updateResourceEntryInfo(opts, cb) {
  assert(opts, 'need to provide opts');
  this.gp.restCall('bundle.updateResourceEntryInfo',
  {
    serviceInstanceId: this.serviceInstance, bundleId: this.id,
    value: opts.value,
    reviewed: opts.reviewed,
    metadata: opts.metadata,
    partnerStatus: opts.partnerStatus
  }, cb);
};

/**
 * Alias.
 * @ignore
 */
Bundle.prototype.updateResourceEntryInfo = Bundle.prototype.updateEntryInfo;


/**
 * Create a bundle access object.
 * This doesn’t create the bundle itself, just a lightweight
 * accessor object. 
 * @param {Object} opts - String (id) or map {id: bundleId, serviceInstance: serviceInstanceId}
 * @return {Bundle}
 */
Client.prototype.bundle = function bundle(opts) {
  if(typeof(opts) === "string") {
    opts = {id: opts};
  }
  return new Bundle(this, opts);
};

/**
 * for testing. Internal.
 * @ignore
 */
Client.prototype._getUrl = function _getUrl(u) {
  return exports._normalizeUrl(u || this._options.credentials.url);
};

var assert = require('assert');
var version = "v2";
var debugURL = false;
var debugREST = false;


/**
 * @ignore
 */
exports._normalizeUrl = function _normalizeUrl(u) {
  u = removeTrailing(u,"/"); // take off the trailing slash
  u = removeTrailing(u,"/rest"); // take off the trailing /rest
  return u;
}

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
