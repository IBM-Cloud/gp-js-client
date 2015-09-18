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

var shim = require('./shimcb.js');
var utils = require('./utils.js');
var SwaggerClient =  require('swagger-client');
var Q = require('q');
var GaasHmac = require('./gaas-hmac');

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

exports.exampleCredentials = {
  uri: "Globalization Pipeline URI",
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
    throw new Error("gaas: missing 'credentials' " + needAll);
  }
  var missingField = isMissingField(this._options.credentials, Object.keys(exports.exampleCredentials));
  if(missingField.length !== 0) {
    throw new Error("gaas: missing credentials fields: \"" + missingField.join(' ') + "\" - expected: " + exampleCredentialsString);
  }
  
  if( this._options.credentials.instanceId ) {
    this._options.serviceInstance = this._options.credentials.instanceId;
  }

  this._schema = null;
  this._options.credentials.uri = removeTrailing(this._options.credentials.uri, '/');  
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
    var schemaUrl = credentials.uri + '/rest/swagger.json';
    if(debugREST) console.log('.. fetching ' + schemaUrl);
    
    var authorizations;
    
    if (this._options.basicAuth) {
      authorizations = {
        "basic-auth": new SwaggerClient.PasswordAuthorization(credentials.userId, credentials.password)
      };
    } else {
      authorizations = {
        "gaas-hmac": new GaasHmac("gaas-hmac", credentials.userId, credentials.password)
      };
    }
    
    var that = this;
    this.swaggerClient = new SwaggerClient({
      url: schemaUrl,
      authorizations: authorizations,
      success: function() {
        if(that.swaggerClient.ready === true) {
          cb(null, arg, that.swaggerClient.apis);
        } else {
          if(debugREST) {
            console.log('.. swagger not ready yet');
          }
          cb(Error('Internal error: Swagger API was not ready in time'), arg);
        }
      },
      failure: function(err) {
        // Swagger returned an error
        cb(err, arg);
      }
    });
  }
};

function RESTError(message, obj) {
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
  } else {
    e = Error(message);
  }
  e.obj = obj;
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
 * @return {Promise}
 */
 Client.prototype.restCall = function restCall(fn, restArg) {
   var deferred = Q.defer();
   if(typeof(fn)==="string") {
     fn = fn.split('.');
   }
   this.ready({}, function onReady(err, cbArg, apis) {
     if(err) {
       deferred.reject(err);
     } else {
       var base = apis;
       for(var i in fn) {
         if(!base.hasOwnProperty(fn[i])) {
           deferred.reject(Error('No REST operation: ' + fn.slice(0,i+1).join('.') + ' in ' + fn.join('.')));
           return;
         } else {
           base = base[fn[i]];
         }
       }
       if(typeof(base) !== 'function') {
           deferred.reject(Error('REST specifier is a leaf, not a function: ' +  fn.join('.')));
           return;
       }
       
       // call the REST function
       try {
         base(restArg, function onRestSuccess(resp) {
            if(resp && resp.status === 500) {
              // server returned an internal error
              deferred.reject(RESTError('Internal server error', resp.obj || resp));
            } else if (resp && resp.obj && 'SUCCESS' !== resp.obj.status) {
              // REST returned an error
              deferred.reject(RESTError('Server returned REST err, status:' + resp.obj.status ), resp.obj || resp);
            } else {
              // SUCCESS!
              deferred.resolve(resp.obj );
            }
          }, function onRestFail(resp) {
            
            if(resp && resp.status === 500) {
              deferred.reject(RESTError('Fail: Internal server error ', resp.data || resp));
            } else {
              deferred.reject(RESTError('Error', (resp.obj || resp)));
            }
          });
       } catch(e) {
         deferred.reject(e);
       }
     }
   });
   return deferred.promise;
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
 * @param {basicCallback} cb - callback. If omitted, a promise is returned.
 * @return {Promise}
 */
Client.prototype.getBundleList = function getBundleList(opts, cb) {
  var deferred = shim.wrap(cb);
  
  var serviceInstance = this.getServiceInstance(opts);
  assert(serviceInstance && serviceInstance!== "", "Could not find a service instance");
  
  this.restCall("bundle.getBundleList", {serviceInstanceId: serviceInstance})
  .then(function(restData) {
    deferred.resolve(restData.bundleIds);
  },
  deferred.reject);

  return shim.return(deferred);
};


/**
 * This function returns a map from source language(s) to target language(s).
 * @param {object} args
 * @param {supportedTranslationsCallback} cb - If omitted, a promise is returned.
 * @return {Promise}
 */
Client.prototype.supportedTranslations = function supportedTranslations(args, cb) {
  var deferred = shim.wrap(cb);

  this.getServiceInfo(args)
  .then(function(data) { 
    deferred.resolve(data.supportedTranslation); 
  }, deferred.reject);

  return shim.return(deferred);
};

/**
 * Get information about this service
 * @param {object} args
 * @param {basicCallback} cb - If omitted, a promise is returned.
 * @return {Promise}
 */
Client.prototype.getServiceInfo = function getServiceInfo(args, cb) {
  var deferred = shim.wrap(cb);

  this.restCall("service.getServiceInfo", args)
  .then(deferred.resolve, deferred.reject);

  return shim.return(deferred);
};

/**
 * Do we have access to the server?
 * @param {object} args - (ignored)
 * @param {callback} cb - if omitted, a promise is returned
 * @return {Promise}
 */
Client.prototype.ping = Client.prototype.getServiceInfo;

// --- user stuff ---
Client.prototype.createUser = function createUser(args, cb) {
  var deferred = shim.wrap(cb);
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
  })
  .then(deferred.resolve, deferred.reject);
  
  return shim.return(deferred);
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
 * @param {Client} gaas - parent GaaS client object
 * @param {Object} props - properties to inherit
 */
function Bundle(gaas, props) {
  if ( props ) {
    // copy properties to this
    for(var k in props) {
      this[k] = props[k];
    }
  }
  this.gaas = gaas; // actually Client
  this.serviceInstance = gaas.getServiceInstance(this); // get the service instance ID
  assert(this.id, "Property 'id' missing (bundle ID)");
}

/**
 * @return {Promise}
 */
Bundle.prototype.delete = function deleteBundle(opts) {
  return this.gaas.restCall("bundle.deleteBundle",
     {serviceInstanceId: this.serviceInstance, bundleId: this.id});
};

/**
 * @param {Object} body - see API docs
 * @return {Promise}
 */
Bundle.prototype.create = function createBundle(body) {
  assert(body, 'Need to provide the “body” parameter.');
  return this.gaas.restCall("bundle.createBundle",
     {serviceInstanceId: this.serviceInstance, bundleId: this.id, body: body});
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
 * @return {Promise}
 */
Bundle.prototype.getInfo = function getBundleInfo(opts) {
  if(!opts) opts = {};
  opts.fields = Bundle.prototype.getInfoFields.processFields(opts);
  return this.gaas.restCall("bundle.getInfo",
     {serviceInstanceId: this.serviceInstance, bundleId: this.id, fields: opts.fields});
};

// TODO: bundle.updateBundle

/**
 * Todo
 */
Bundle.prototype.getResourceStrings = function getResourceStrings(opts) {
  
};

/**
 * Upload some resource strings
 * @param {Object} opts - options
 * @param {String} opts.languageId - language to update
 * @param {Object} opts.strings - strings to update
 * @return {Promise}
 */
Bundle.prototype.uploadResourceStrings = function updateResourceStrings(opts) {
  assert(opts, 'Need to provide opts');
  return this.gaas.restCall("bundle.uploadResourceStrings",
  {
    serviceInstanceId: this.serviceInstance, bundleId: this.id,
    languageId: opts.languageId,
    body: opts.strings
  });
}

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
