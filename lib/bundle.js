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
 * @ignore
 */
const utils = require('./utils.js');
// const Consts = require('./consts');
const assert = require('assert');
const ResourceEntry = require('./resourceentry');

const _getInfoFields = new utils.Fields([
  "translationStatusMetricsByLanguage",
  "reviewStatusMetricsByLanguage",
  "partnerStatusMetricsByLanguage"
]);


/**
 * @author Steven R. Loomis
 */

/**
 * Accessor object for a Globalization Pipeline bundle
 * @prop {string} updatedBy - userid that updated this bundle
 * @prop {Date} updatedAt - date when the bundle was last updated
 * @prop {string} sourceLanguage - bcp47 id of the source language
 * @prop {string[]} targetLanguages - array of target langauge bcp47 ids
 * @prop {boolean} readOnly - true if this bundle can only be read
 * @prop {Object.<string,string>} metadata - array of user-editable metadata
 */
class Bundle {
  /**
     * Note: this constructor is not usually called directly, use Client.bundle(id)
     * @param {Client} gp - parent g11n-pipeline client object
     * @param {Object} props - properties to inherit
     */
  constructor(gp, props) {
    utils._initSubObject(this, gp, props);
    assert(this.id, "Property 'id' missing (bundle ID)");
  }

  /**
     * Delete this bundle.
     * @param {Object} [opts={}] - options
     * @param {basicCallback} cb
     */
  delete(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.delete(opts), cb);
    }

    return this.gp.restCall("bundle.deleteBundle",
      {
        serviceInstanceId: this.serviceInstance,
        bundleId: this.id
      });
  }

  /**
     * Create this bundle with the specified params.
     * Note that on failure, such as an illegal language being specified,
     * the bundle is not created.
     * @param {Object} body
     * @param {string} body.sourceLanguage - bcp47 id of source language such as 'en'
     * @param {Array} body.targetLanguages - optional array of target languages
     * @param {Object} body.metadata - optional metadata for the bundle
     * @param {string} body.partner - optional ID of partner assigned to translate this bundle
     * @param {string[]} body.notes - optional note to translators
     * @param {basicCallback} cb
     * 
     */
  create(body, cb) {
    body = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.create(body), cb);
    }
    assert(body, 'Need to provide the “body” parameter.');
    return this.gp.restCall("bundle.createBundle",
      { serviceInstanceId: this.serviceInstance, bundleId: this.id, body: body });
  }

  /**
     * List of fields usable with Bundle.getInfo()
     */
  get getInfoFields() {
    return _getInfoFields;
  }

  /**
     * Get bundle info. Returns a new Bundle object with additional fields populated.
     * @param {Object} [opts={}] - Options object
     * @param {String} opts.fields - Comma separated list of fields
     * @param {Boolean} opts.translationStatusMetricsByLanguage - Optional field (false by default)
     * @param {Boolean} opts.reviewStatusMetricsByLanguage - Optional field (false by default)
     * @param {Boolean} opts.partnerStatusMetricsByLanguage - Optional field (false by default)
     * @param {Bundle~getInfoCallback} cb - callback (err, Bundle )
     */
  getInfo(opts, cb) {
    opts = utils.fixArgs(arguments);
    if ((cb = arguments[1])) {
      return utils.depromise(this.getInfo(opts), cb);
    }
    opts.fields = Bundle.prototype.getInfoFields.processFields(opts);
    var that = this;
    return this.gp.restCall("bundle.getBundleInfo",
      { serviceInstanceId: this.serviceInstance, bundleId: this.id, fields: opts.fields })
      .then(data => {
        // Always return at least an empty metadata object
        data.bundle.metadata = data.bundle.metadata || {};
        // Make this a date object and not a string.
        if (data.bundle.updatedAt) {
          data.bundle.updatedAt = utils.datify(data.bundle.updatedAt);
        }
        // Copy these fields over. The REST getInfo call will not set them.
        data.bundle.id = data.bundle.id || that.id;
        data.bundle.serviceInstance = data.bundle.serviceInstance || that.serviceInstance;

        var b = that.gp.bundle(data.bundle);
        b.data = data;
        return b;
      });
  }

  /**
     * Alias.
     * @ignore
     */
  getBundleInfo(a, b) {
    return this.getInfo(a, b);
  }

  /**
     * Return all of the languages (source and target) for this bundle.
     * The source language will be the first element.
     * Will return undefined if this bundle was not returned by getInfo().
     * @return {String[]}
     */
  languages() {
    if (!this.sourceLanguage) return undefined;
    return [this.sourceLanguage].concat(this.targetLanguages || []);
  }

  /**
     * Callback returned by Bundle~getInfo(). 
     * @callback Bundle~getInfoCallback
     * @param {object} err -  error, or null
     * @param {Bundle} bundle - bundle object with additional data
     * 
     * @param {string} bundle.updatedBy - userid that updated this bundle
     * @param {Date} bundle.updatedAt - date when the bundle was last updated
     * @param {string} bundle.sourceLanguage - bcp47 id of the source language
     * @param {string[]} bundle.targetLanguages - array of target langauge bcp47 ids
     * @param {boolean} bundle.readOnly - true if this bundle can only be read
     * @param {Object.<string,string>} bundle.metadata - array of user-editable metadata
     * @param {Object} bundle.translationStatusMetricsByLanguage - additional metrics information
     * @param {Object} bundle.reviewStatusMetricsByLanguage - additional metrics information
     */
  /**
     * Fetch one language's strings
     * @param {Object} opts - options
     * @param {String} opts.languageId - language to fetch
     * @param {boolean} [opts.fallback=false] - Whether if source language value is used if translated value is not available
     * @param {string} [opts.fields] - Optional fields separated by comma
     * @param {basicCallback} cb - callback (err, { resourceStrings: { strings… } })
     */
  getStrings(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.getStrings(opts), cb);
    }
    assert(opts, 'Need to provide opts');
    assert(opts.languageId, 'Need to provide opts.languageId');
    return this.gp.restCall('bundle.getResourceStrings', {
      serviceInstanceId: this.serviceInstance, bundleId: this.id,
      languageId: opts.languageId,
      fallback: opts.fallback || false,
      fields: opts.fields
    });
  }

  /**
     * Alias.
     * @ignore
     */
  getResourceStrings(a, b) {
    return this.getStrings(a, b);
  }

  /**
     * Alias.
     * @ignore
     */
  getResourceEntryInfo(a, b) {
    return this.getEntryInfo(a, b);
  }

  /**
     * Fetch one entry's info
     * Deprecated, but won't be removed. This is called by Bundle~entry()
     * @param {Object} opts - options
     * @param {String} opts.languageId - language to fetch
     * @param {String} opts.resourceKey - resource to fetch
     * @param {ResourceEntry~getInfoCallback} cb - callback (err, { resourceEntry: { updatedBy, updatedAt, value, sourceValue, reviewed, translationStatus, metadata, partnerStatus } }  )
     * @ignore
     */
  getEntryInfo(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.getEntryInfo(opts), cb);
    }
    assert(opts, 'Need to provide opts');
    return this.gp.restCall('bundle.getResourceEntryInfo', {
      serviceInstanceId: this.serviceInstance, bundleId: this.id,
      languageId: opts.languageId,
      resourceKey: opts.resourceKey
    });
  }

  /**
     * Create an entry object. Doesn't fetch data, 
     * @see ResourceEntry~getInfo
     * @param {Object} opts - options
     * @param {String} opts.languageId - language
     * @param {String} opts.resourceKey - resource key
     */
  entry(opts) {
    assert(opts, 'need to provide opts');
    return new ResourceEntry(this, opts);
  }

  /**
     * Called by entries()
     * @callback Bundle~listEntriesCallback
     * @param {object} err - error, or null
     * @param {Object.<string,ResourceEntry>} entries - map from resource key to ResourceEntry object. 
     * The .value field will be filled in with the string value.
     */

  /**
     * List entries. Callback is called with a map of 
     * resourceKey to ResourceEntry objects.
     * 
     * @param {Object} opts - options
     * @param {String} opts.languageId - language to fetch
     * @param {listEntriesCallback} cb - Callback with (err, map of resourceKey:ResourceEntry )
     */
  entries(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.entries(opts), cb);
    }
    var that = this;
    return this.getStrings(opts)
      .then(resResult => {
        const entries = {};
        for (const kid in resResult.resourceStrings) {
          if(resResult.resourceStrings.hasOwnProperty(kid)) {
            entries[kid] = that.entry({ languageId: opts.languageId, resourceKey: kid });
            entries[kid].value = resResult.resourceStrings[kid];
          }
        }
        return entries;
      });
  }

  /**
     * Upload resource strings, replacing all current contents for the language
     * @param {Object} opts - options
     * @param {String} opts.languageId - language to update
     * @param {Object.<string,string>} opts.strings - strings to update
     * @param {basicCallback} cb
     */
  uploadStrings(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.uploadStrings(opts), cb);
    }
    assert(opts, 'Need to provide opts');
    assert(opts.languageId, 'Need to provide opts.languageId');
    assert(opts.strings, 'Need to provide opts.strings');
    return this.gp.restCall("bundle.uploadResourceStrings",
      {
        serviceInstanceId: this.serviceInstance, bundleId: this.id,
        languageId: opts.languageId,
        body: opts.strings
      });
  }

  /**
     * Alias
     * @ignore
     */
  uploadResourceStrings(a, b) {
    return this.uploadStrings(a, b);
  }

  /**
     * @param {Object} opts - options
     * @param {array} opts.targetLanguages - optional: list of target languages to update
     * @param {boolean} opts.readOnly - optional: set this bundle to be readonly or not
     * @param {object} opts.metadata - optional: metadata to update
     * @param {string} opts.partner - optional: partner id to update
     * @param {string[]} opts.notes - optional notes to translator
     * @param {basicCallback} cb - callback
     */
  update(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.update(opts), cb);
    }
    assert(opts, 'Need to provide opts');
    if (!opts.body) {
      opts.body = {
        targetLanguages: opts.targetLanguages,
        readOnly: opts.readOnly,
        metadata: opts.metadata,
        partner: opts.partner,
        notes: opts.notes
      };
    }
    return this.gp.restCall('bundle.updateBundle',
      {
        serviceInstanceId: this.serviceInstance, bundleId: this.id,
        body: opts.body
      });
  }

  /**
     * Alias
     * @ignore
     */
  updateBundle(a, b) {
    return this.update(a, b);
  }

  /**
     * Update some strings in a language.
     * @param {Object} opts - options
     * @param {Object.<string,string>} opts.strings - strings to update.
     * @param {String} opts.languageId - language to update
     * @param {Boolean} opts.resync - optional: If true, resynchronize strings 
     * in the target language and resubmit previously-failing translation operations
     * @param {basicCallback} cb
     */
  updateStrings(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.updateStrings(opts), cb);
    }
    assert(opts, 'need to provide opts');
    return this.gp.restCall('bundle.updateResourceStrings',
      {
        languageId: opts.languageId,
        serviceInstanceId: this.serviceInstance,
        bundleId: this.id,
        body: opts.strings,
        resync: opts.resync
      });
  }


  /**
     * Alias.
     * @ignore
     */
  updateResourceStrings(a, b) {
    return this.updateStrings(a, b);
  }
  /**
     * Called by ResourceEntry.update
     * @param {Object} opts - options
     * @param {string} opts.body.value - string value to update
     * @param {boolean} opts.body.reviewed - optional boolean indicating if value was reviewed
     * @param {object} opts.body.metadata - optional metadata to update
     * @param {string} opts.body.partnerStatus - translation status maintained by partner
     * @param {basicCallback} cb
     * @ignore
     */
  updateEntryInfo(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.updateEntryInfo(opts), cb);
    }
    assert(opts, 'need to provide opts');
    if (!opts.body) { // compatibility
      opts.body = {
        value: opts.value,
        reviewed: opts.reviewed,
        metadata: opts.metadata,
        partnerStatus: opts.partnerStatus
      };
    }
    return this.gp.restCall('bundle.updateResourceEntryInfo',
      {
        serviceInstanceId: this.serviceInstance,
        bundleId: this.id,
        languageId: opts.languageId,
        resourceKey: opts.resourceKey,
        body: opts.body
      });
  }

  /**
     * Alias.
     * @ignore
     */
  updateResourceEntryInfo(a, b) {
    return this.updateEntryInfo(a, b);
  }
}

module.exports = Bundle;
