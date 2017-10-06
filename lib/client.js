/*
 * Copyright IBM Corp. 2015-2017
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
// for node v4
"use strict";
/**
 * @author Steven R. Loomis
 */

// -- CALLBACKS --

/**
 * @ignore
 */
var utils = require('./utils.js');
var SwaggerClient = require('swagger-client');
var GpHmac = require('./gp-hmac');
var cfEnvUtil = require('./cfenv-credsbylabel');
const TranslationRequest = require('./tr.js');
const User = require('./user.js');
const Bundle = require('./bundle.js');
const Partner = require('./partner.js');
const Consts = require('./consts');
const assert = require('assert');
/**
 * Client object for Globalization Pipeline
 **/
class Client {
  constructor(options) {
    // parse vcap using cfenv if available
    if (options.appEnv && !options.credentials) {
      options.credentials = cfEnvUtil.getServiceCredsByLabel(options.appEnv, Consts.serviceRegex);
    }
    // try again with name
    if (options.appEnv && !options.credentials) {
      options.credentials = options.appEnv.getServiceCreds(Consts.serviceRegex);
    }
    this._options = options;
    if (!this._options.credentials) {
      throw new Error("g11n-pipeline: missing 'credentials' " + Object.keys(Consts.exampleCredentials));
    }
    var missingField = utils.isMissingField(this._options.credentials, Object.keys(Consts.exampleCredentials));
    if (missingField.length !== 0) {
      throw new Error("g11n-pipeline: missing credentials fields: \"" + missingField.join(' ') + "\" - expected: " + Consts.exampleCredentialsString);
    }

    // instanceId optional
    if (this._options.credentials.instanceId) {
      this._options.serviceInstance = this._options.credentials.instanceId;
    }

    this._options.credentials.url = utils._normalizeUrl(this._options.credentials.url);
    // if (debugURL) /*istanbul ignore next*/ console.log('just created a client with ' + JSON.stringify(options));

    // if (debugREST) /*istanbul ignore next*/ console.log(' + authorizations:' + Object.keys(authorizations));

    // instantiate the promised swagger client
    Object.defineProperty(this,
      'swaggerClient', {
        configurable: true,
        enumerable: false,
        value: this.createSwaggerClient(),
        writable: false
      });
  }

  /**
   * Version number of the REST service used. Currently ‘V2’.
   */
  get version() {
    return Consts.version;
  }

  /**
   * Return the URL used for this client.
   * @return {String} - the URL
   */
  get url() {
    return utils._normalizeUrl(this._options.credentials.url);
  }

  /**
   * Get the internal swaggerClient promise
   * @return {SwaggerClient}
   * @ignore
   */
  createSwaggerClient() {
    // const credentials = this._options.credentials;
    const schemaUrl = this._schemaUrl = this._options.credentials.url + '/swagger.json';
    // if (debugREST) /*istanbul ignore next*/ console.log('.. fetching ' + schemaUrl);

    const gphmac = new GpHmac("gp-hmac", this._options.credentials.userId, this._options.credentials.password);
    if(this._options.basicAuth) {
      // ignore basicAuth.
      // throw Error('basicAuth is not supported'); // TODO: support this- maybe?
    }
    const clientPromise = new SwaggerClient({
      url: schemaUrl,
      requestInterceptor: (req) => gphmac.apply(req) // TODO: change if we are using Basic
    });
    return clientPromise;
  }


  /**
   * Call a REST function. Verify the results.
   * cb is called with the same context.
   * 
   * This is designed for internal implementation.
   * 
   * @param {Array|String} fn - function name, such as ["service","getServiceInfo"] or "service.getServiceInfo"
   * @param {Object} restArg - args to the REST call
   * @return {Promise} - results
   * @ignore
   */
  restCall(fn, restArg) {
    if(typeof(fn)==="string") {
      fn = fn.split('.');
    }
    return this.swaggerClient
      .then(client => {
        const group = client.apis[fn[0]];
        if(!group) return Promise.reject('Not a REST group:' + fn[0]);
        const api = group[fn[1]];
        if(!api) return Promise.reject('Not a REST api: ' + fn.join('.'));
        return api(restArg)
          .then(utils.verifyRest)
          .catch(utils.verifyError);
      });
  }

  /**
   * Get the serviceInstance id from a parameter or from the 
   * client's default.
   * 
   * @param {Object} opts - can be a map, or falsy.
   * @param {String} opts.serviceInstance - the service instance
   * @return {String} - the service instance ID if found
   * @ignore
   */
  getServiceInstance(opts) {
    /*if(typeof(opts) === "string" && opts !== "") {
      return opts;
    } else*/ if (opts && opts.serviceInstance && opts.serviceInstance !== "") {
      return opts.serviceInstance;
    } else if (this._options.serviceInstance && this._options.serviceInstance !== "") {
      return this._options.serviceInstance;
    } else {
      return null;
    }
  }

  /**
   * Get a list of the bundles.
   * Note: This function may be deprecated soon, but won't be removed.
   * This is called by Client.bundles
   * 
   * @param {Object} [opts={}]
   * @param {String} [opts.serviceInstance] - optional service instance
   * @return promise to bundleIds
   * @ignore
   */
  getBundleList(opts, cb) {
    // boilerplate for promisify
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.getBundleList(opts), cb);
    }

    var serviceInstance = this.getServiceInstance(opts);
    assert(serviceInstance && serviceInstance !== "", "Could not find a service instance");

    return this.restCall('bundle.getBundleList', {
      serviceInstanceId: serviceInstance
    })
      .then(restData => restData.bundleIds);
  }

  /**
   * This function returns a map from source language(s) to target language(s).
   * Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese.
   * @param {object} [opts={}] - ignored
   * @param {Client~supportedTranslationsCallback} cb (err, map-of-languages)
   */
  supportedTranslations(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.supportedTranslations(opts), cb);
    }

    return this
      .getServiceInfo(opts)
      .then(data => data.supportedTranslation);
  }

  /**
   * Callback returned by supportedTranslations()
   * @callback Client~supportedTranslationsCallback
   * @param {object} err -  error, or null
   * @param {Object.<string,string[]>} languages - map from source language to array of target languages
   * Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese.
   */

  /**
   * Get global information about this service, not specific to one service instance.
   * @param {object} [opts={}] - ignored argument
   * @param {Client~serviceInfoCallback} cb
   */
  getServiceInfo(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.getServiceInfo(opts), cb);
    }
    return this.restCall("service.getServiceInfo", opts);
  }

  /**
   * Callback used by getServiceInfo()
   * @callback Client~serviceInfoCallback
   * @param {object} err -  error, or null
   * @param {Object} info - detailed information about the service
   * @param {Object.<string,string[]>} info.supportedTranslation - map from source language to array of target languages
   * Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese.
   * @param {Object.<string,string[]>} info.supportedHumanTranslation - map from source language to array of target languages 
   * supported for human translation.
   * Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese.
   * @param {ExternalService[]} info.externalServices - info about external services available
   */

  /**
   * Callback returned by getServiceInstanceInfo()
   * @callback Client~serviceInstanceInfoCallback
   * @param {object} err -  error, or null
   * @param {object} instanceInfo - Additional information about the service instance
   * @param {string} instanceInfo.updatedBy - information about how our service instance was updated
   * @param {date} instanceInfo.updatedAt - when the instance was last updated
   * @param {string} instanceInfo.region - the Bluemix region name
   * @param {string} instanceInfo.cfServiceInstanceId - the CloudFoundry service instance ID
   * @param {string} instanceInfo.serviceId - this is equivalent to the service instance ID
   * @param {string} instanceInfo.orgId - this is the Bluemix organization ID
   * @param {string} instanceInfo.spaceId - this is the Bluemix space ID
   * @param {string} instanceInfo.planId - this is the Bluemix plan ID
   * @param {boolean} instanceInfo.htServiceEnabled - true if the Human Translation service is enabled
   * @param {object} instanceInfo.usage - usage information
   * @param {number} instanceInfo.usage.size - the size of resource data used by the Globalization Pipeline instance in bytes
   * @param {boolean} instanceInfo.disabled - true if this service has been set as disabled by Bluemix
   */

  /**
   * Get information about our specific service instance.
   * @param {object} [opts={}] - options
   * @param {string} [opts.serviceInstance] - request a specific service instance’s info
   * @param {Client~serviceInstanceInfoCallback} cb
   */
  getServiceInstanceInfo(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.getServiceInstanceInfo(opts), cb);
    }

    const serviceInstance = this.getServiceInstance(opts);
    /// should be:
    // return this.restCall("instance.getServiceInstanceInfo", { serviceInstanceId: serviceInstance })

    // ... but the gp-rest swagger violates spec here.
    return this.swaggerClient
      .then(client => utils.verifyPromise(
        (client.apis.instance.getServiceInstanceInfo 
        || client.apis.instance.getServiceInstanceInfo1 
        || client.apis.instance.getServiceInstanceInfo2)({serviceInstanceId: serviceInstance})))
      .then(data => {
        if (data.instance.updatedAt) {
          data.instance.updatedAt = utils.datify(data.instance.updatedAt);
        }
        return data.instance;
      });
  }

  /**
   * info about external services available
   * @typedef {Object} ExternalService
   * @property {string} type - The type of the service, such as MT for Machine Translation
   * @property {string} name - The name of the service
   * @property {string} id - The id of the service
   * @property {Object.<string,string[]>} supportedTranslation - map from source language to array of target languages
   * Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese.
   */

  /**
   * Verify that there is access to the server. An error result
   * will be returned if there is a problem. On success, the data returned
   * can be ignored. (Note: this is a synonym for getServiceInfo())
   * @param {object} args - (ignored)
   * @param {basicCallback} cb
   */
  ping(args, cb) {
    // this is just a redirect to getServiceInfo
    return this.getServiceInfo(args, cb);
  }

  // --- user stuff ---
  /**
   * Create a user
   * @param {object} opts 
   * @param {string} opts.type - User type (ADMINISTRATOR, TRANSLATOR, or READER)
   * @param {string} opts.displayName - Optional display name for the user. 
   * This can be any string and is displayed in the service dashboard. 
   * @param {string} opts.comment - Optional comment
   * @param {Array} opts.bundles - set of accessible bundle ids. Use `['*']` for “all bundles”
   * @param {Object.<string, string>} opts.metadata - optional key/value pairs for user metadata
   * @param {string} opts.externalId - optional external user ID for your application’s use
   * @param {User~getUserCallback} cb - passed a new User object
   */
  createUser(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.createUser(opts), cb);
    }
    var that = this;
    var serviceInstance = this.getServiceInstance(opts);
    if (!opts.body) {
      // push these fields down into body
      opts.body = {
        "type": opts.type,
        displayName: opts.displayName,
        comment: opts.comment,
        bundles: opts.bundles,
        metadata: opts.metadata,
        externalId: opts.externalId
      };
    }
    return this.restCall("user.createUser", {
      serviceInstanceId: serviceInstance,
      serviceManaged: opts.serviceManaged,
      body: opts.body
    })
      .then(data => new User(that, data.user));
  }

  /**
   * Delete a user. ( called by User.delete )
   * Note: This function may be deprecated soon, but won't be removed.
   * @param {object} opts
   * @param {string} opts.userId - user ID to be deleted.
   * @param {string} opts.serviceInstance - override service instance
   * @param {basicCallback} cb
   * @ignore
   */
  deleteUser(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.deleteUser(opts), cb);
    }
    var serviceInstanceId = this.getServiceInstance(opts);
    return this.restCall("user.deleteUser", {
      serviceInstanceId: serviceInstanceId,
      userId: opts.userId
    });
  }


  /**
 * Create a user access object.
 * This doesn’t create the user itself,
 * nor query the server, but is just a handle object.
 * Use createUser() to create a user.
 * @param {Object} id - String (id) or map {id: bundleId, serviceInstance: serviceInstanceId}
 * @return {User}
 */
  user(id) {
    var opts;
    if(typeof(id) === "object") {
      opts = id;
    } else {
    // user passed in a string as the id
      opts = {
        id: id,
        serviceInstance: this.serviceInstance
      }; // common case, so we name the param id
    }
    // compatibility
    if(!opts.userId) {
      opts.userId = opts.id;
    } else if (!opts.id) {
      opts.id = opts.userId;
    }  
  
    assert(typeof(opts.userId) === "string",'Expected opts.userId to be a string but got ' + JSON.stringify(opts.userId));
    return new User(this, opts);
  }

  /**
 * Called by users()
 * @callback Client~listUsersCallback
 * @param {object} err -  error, or null
 * @param {Object.<string,User>} users - map from user ID to User object
 * @see User
 */

  /**
 * List users. Callback is called with an array of 
 * user access objects.
 * 
 * @param {Object} [opts={}] - options
 * @param {Client~listUsersCallback} cb - callback
 */
  users(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.users(opts), cb);
    }
    var serviceInstance = this.getServiceInstance(opts);
    var that = this;
    // Should be:
    //    return this.restCall('user.getUsers',{serviceInstanceId: serviceInstance})
    // but noncompliant swagger.json means we need to do:
    return this.swaggerClient
      .then(client => utils.verifyPromise(
        (client.apis.user.getUsers 
      || client.apis.user.getUsers1 
      || client.apis.user.getUsers2)({serviceInstanceId: serviceInstance})))
      .then(data =>  {
        const users = {};
        for(var uid in data.users) {
          if (Object.prototype.hasOwnProperty.call(data.users, uid)) {
            var u = data.users[uid]; // full user info
            u.serviceInstance = serviceInstance; // copy this
            users[uid] = that.user(u);
          }
        }
        return users;
      });
  }

  /**
 * Bundle list callback
 * @callback Client~listBundlesCallback
 * @param {object} err -  error, or null
 * @param {Object.<string,Bundle>} bundles - map from bundle ID to Bundle object
 */

  /**
 * List bundles. Callback is called with an map of 
 * bundle access objects.
 * 
 * @param {Object} [opts={}] - options
 * @param {Client~listBundlesCallback} cb - given a map of Bundle objects
 */
  bundles(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.bundles(opts), cb);
    }
    var serviceInstance = this.getServiceInstance(opts);
    var that = this;
    return this.restCall('bundle.getBundleList',
      {
        serviceInstanceId: serviceInstance
      }).then(data => {
      const bundles = {};
      for(var n in data.bundleIds) {
        if (Object.prototype.hasOwnProperty.call(data.bundleIds, n)) {
          var bid = data.bundleIds[n];
          bundles[bid] = that.bundle({id: bid, serviceInstance: serviceInstance});
        }
      }
      return bundles;
    });
  }

  /**
 * Create a bundle access object.
 * This doesn’t create the bundle itself, just a handle object.
 * Call create() on the bundle to create it.
 * @param {Object} opts - String (id) or map {id: bundleId, serviceInstance: serviceInstanceId}
 * @return {Bundle}
 */
  bundle(opts) {
    if (typeof (opts) === "string") {
      opts = { id: opts };
    }
    return new Bundle(this, opts);
  }

  /**
 * Create a Translation Request access object.
 * This doesn’t create the TR itself, just a handle object.
 * Call create() on the translation request to create it.
 * @param {string|Object.<string,Object>} opts - Can be a string (id) or map with values (for a new TR). See TranslationRequest.
 * @return {TranslationRequest}
 */
  tr(opts) {
    if (typeof (opts) === "string") {
      opts = { id: opts };
    }
    return new TranslationRequest(this, opts);
  }

  /**
   * Create a Partner access object.
   * Partner object.
   * (This API is draft and subject to change or removal.)
   * @param {string|Object.<string,Object>} opts - Can be a string (id) or map with values.
   * @return {Partner}
   * @ignore
   */
  partner(opts) {
    if(!opts) {
      opts = this._options.credentials.partnerId;
    }
    if (typeof (opts) === "string") {
      opts = { id: opts };
    }
    return new Partner(this, opts);
  }

  /**
   * List Translation Requests. Callback is called with an map of 
   * TR access objects.
   * 
   * @param {Object} [opts={}] - optional map of options
   * @param {TranslationRequest~getTranslationRequestsCallback} cb - callback yielding a map of Translation Requests
   */
  trs(opts, cb) {
    opts = utils.fixArgs(arguments);
    if ((cb = arguments[1])) {
      return utils.depromise(this.trs(opts), cb);
    }
    var serviceInstance = this.getServiceInstance(opts);
    var that = this;
    return this.restCall('translation_request.getTranslationRequests',
      {
        serviceInstanceId: serviceInstance
      }).then(data => {
      const trIds = Object.keys(data.translationRequests);
      const trs = {};
      for (var n in trIds) {
        if (Object.prototype.hasOwnProperty.call(trIds, n)) {
          var trId = trIds[n];
          trs[trId] = that.tr(data.translationRequests[trId]);
        }
      }
      return trs;
    });
  }

}
// const debugURL = false;
// const debugREST = false;

/**
 * @ignore
 */
module.exports = Client; // done this way for docs

/**
 * Basic Callback used throughout the SDK
 * @callback basicCallback
 * @param {Object} err -  error, or null
 * @param {Object} data - Returned data
 */
