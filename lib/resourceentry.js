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
/**
 * @author Steven R. Loomis
 */
// for node v4
"use strict";

/**
 * @ignore
 */
var utils = require('./utils.js');
// const Consts = require('./consts');
const assert = require('assert');


/**
 * Globalization Pipeline individual resource entry accessor
 * @prop {String} resourceKey - key for the resource
 * @prop {string} updatedBy - the user which last updated this entry
 * @prop {Date} updatedAt - when this entry was updated
 * @prop {string} value - the translated value of this entry
 * @prop {string} sourceValue - the source value of this entry
 * @prop {boolean} reviewed - indicator of whether this entry has been reviewed
 * @prop {string} translationStatus - status of this translation: 
 * `source_language`, `translated`, `in_progress`, or `failed`
 * @prop {Object.<string,string>} entry.metadata - user metadata for this entry
 * @prop {string} partnerStatus - status of partner integration
 * @prop {number} sequenceNumber - relative sequence of this entry
 * @prop {string[]} notes - optional notes to translator
 * 
 * @see Bundle~entries
 */
class ResourceEntry {
  /*
    * Note: this constructor is not usually called directly, use Bundle.entry(...)
    * Creating this object does not modify any data.
    * @param {Bundle} bundle - parent Bundle object
    * @param {Object} props - properties to inherit
    */
  constructor(bundle, props) {
    utils._initSubObject(this, bundle.gp, props);
    this.bundle = bundle;
    assert(this.resourceKey, "Property 'resourceKey' missing (user ID)");

    // fixups:
    if (this.updatedAt) {
      this.updatedAt = utils.datify(this.updatedAt);
    }
  }


  /**
     * Load this entry's information. Callback is given
     * another ResourceEntry but one with all current data filled in.
     * @param {Object} [opts={}] - options
     * @param {ResourceEntry~getInfoCallback} cb - callback (err, ResourceEntry)
     */
  getInfo(opts, cb) {
    opts = utils.fixArgs(arguments);
    if ((cb = arguments[1])) {
      return utils.depromise(this.getInfo(opts), cb);
    }
    var that = this;
    return this.bundle.getEntryInfo({
      languageId: this.languageId,
      resourceKey: this.resourceKey
    })
      .then(data => {
        // REST response doesn’t include these
        data.resourceEntry.languageId = that.languageId;
        data.resourceEntry.resourceKey = that.resourceKey;
        // Always return at least an empty metadata object
        data.resourceEntry.metadata = data.resourceEntry.metadata || {};
        return new ResourceEntry(that.bundle, data.resourceEntry);
      });
  }

  /**
     * Callback called by ResourceEntry~getInfo()
     * @callback ResourceEntry~getInfoCallback
     * @param {object} err -  error, or null
     * @param {ResourceEntry} entry - On success, the new or updated ResourceEntry object.
     */

  /**
     * Update this resource entry's fields.
     * @param {string} opts.value - string value to update
     * @param {boolean} opts.reviewed - optional boolean indicating if value was reviewed
     * @param {object} opts.metadata - optional metadata to update
     * @param {string[]} opts.notes - optional notes to translator
     * @param {string} opts.partnerStatus - translation status maintained by partner
     * @param {string} opts.sequenceNumber - sequence number of the entry (only for the source language)
     */
  update(opts, cb) {
    opts = utils.fixArgs(arguments);
    if ((cb = arguments[1])) {
      return utils.depromise(this.update(opts), cb);
    }

    return this.bundle.updateEntryInfo({

      // from this
      languageId: this.languageId,
      resourceKey: this.resourceKey,

      // parameters
      body: opts
    });
  }
}

module.exports = ResourceEntry; // for docs