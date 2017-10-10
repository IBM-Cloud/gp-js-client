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

/**
 * Partner object.
 * (This API is draft and subject to change or removal.)
 * @ignore
 */
class Partner {
  /**
   * Note: this constructor is not usually called directly, use Client.partner(id)
   * @param {Client} gp - parent g11n-pipeline client object
   * @param {Object} props - properties to inherit
   */
  constructor(gp, props) {
    utils._initSubObject(this, gp, props);
  }
  
  /**
   * Return the ID of this partner
   * @return {String} - partner id
   */
  get partnerId() {
    return this.id;
  }

  /**
   * return a partner id from opts or from this
   * @param {Object} opts 
   * @param {String} [opts.partnerId=this.partnerId]
   * @return {String}
   * @ignore
   */
  _getPartnerId(opts) {
    const partnerId = opts.partnerId || this.partnerId;
    return partnerId;
  }

  // disabling these.  Swagger spec conflicts, etc.

  // /**
  //  * List users. Returns a raw array, not Users object.
  //  * @param {Object} [opts]
  //  * @param {Function} [cb]
  //  * @return {Promise}
  //  */
  // getUsers(opts, cb) {
  //   opts = utils.fixArgs(arguments);
  //   if((cb = arguments[1])) {
  //     return utils.depromise(this.getUsers(opts), cb);
  //   }
  //   const partnerId = this._getPartnerId(opts);
  //   return this.gp.restCall("partner.getPartnerUsers",
  //     { partnerId: partnerId });
  // }

  // /**
  //  * Create a partner user.
  //  * @param {Object} opts
  //  * @param {Function} [cb]
  //  * @return {Promise}
  //  */
  // createUser(opts, cb) {
  //   opts = utils.fixArgs(arguments);
  //   if((cb = arguments[1])) {
  //     return utils.depromise(this.createUser(opts), cb);
  //   }
  //   const partnerId = this._getPartnerId(opts);
  //   return this.gp.restCall("partner.createPartnerUser",
  //     { partnerId: partnerId, body: opts });
  // }

  /**
   * @param [opts={}]
   * @param [opts.status] - {String} optional status for filter - comma separated - SUBMITTED, STARTED, TRANSLATED, MERGED. Can be an array.
   * @param cb
   */
  getPartnerTranslationRequests(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.getPartnerTranslationRequests(opts), cb);
    }
    const partnerId = this._getPartnerId(opts);
    opts.partnerId = opts.partnerId || partnerId;
    if(typeof opts.status === 'object') {
      opts.status = opts.status.join(',');
    }
    return this.gp.restCall("partner.getPartnerTranslationRequests", 
      opts, cb);
  }

  /**
   * @param {Object} opts 
   * @param {Function} [cb] 
   */
  updatePartnerTranslationRequest(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.updatePartnerTranslationRequest(opts), cb);
    }
    // make sure there's a partnerId.
    const partnerId = this._getPartnerId(opts);
    opts.partnerId = opts.partnerId || partnerId;
    return this.gp.restCall("partner.updatePartnerTranslationRequest",
      opts);
  }

  /**
   * delete partner translation request.
   * @param {Object} opts
   * @param {Function} [cb]
   * @return {Promise}
   */
  deletePartnerTranslationRequest(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.deletePartnerTranslationRequest(opts), cb);
    }
    // make sure there's a partnerId.
    const partnerId = this._getPartnerId(opts);
    opts.partnerId = opts.partnerId || partnerId;
    return this.gp.restCall("partner.deletePartnerTranslationRequest",
      opts);
  }

  /**
   * update partner translation request with XLIFF
   * @param {Object} opts
   * @param {Function} [cb]
   * @return {Promise}
   */
  updatePartnerTRWithXliff(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.updatePartnerTRWithXliff(opts), cb);
    }
    // make sure there's a partnerId.
    const partnerId = this._getPartnerId(opts);
    opts.partnerId = opts.partnerId || partnerId;
    return this.gp.restCall("partner.updatePartnerTRWithXliff",
      opts);
  }

  /**
   * Get the XLIFF from this TR
   * @param {Object} opts 
   * @param {Function} [cb] 
   * @return {Promise}
   */
  getPartnerXliffFromTR(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.getPartnerXliffFromTR(opts), cb);
    }
    // make sure there's a partnerId.
    const partnerId = this._getPartnerId(opts);
    opts.partnerId = opts.partnerId || partnerId;

    // this is an odd one because it's not JSON data in return.
    // so, we cannot use restCall() (yet!)
    // this.restCall("partner.getPartnerXliffFromTR", opts, cb);
    return this.gp.swaggerClient
      .then(client => 
        client.apis.partner.getPartnerXliffFromTR(opts));
  }

  /**
   * @ignore
   * @param {*} opts 
   * @param {*} cb 
   */
  createPartner(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.createPartner(opts), cb);
    }
    return this.gp.restCall("admin.createPartner", {partnerId: this._getPartnerId(opts), body: opts} );
  }
  
  /**
   * @ignore
   * @param {*} opts 
   * @param {*} cb 
   */
  deletePartner(opts, cb) {
    opts = utils.fixArgs(arguments);
    if((cb = arguments[1])) {
      return utils.depromise(this.deletePartner(opts), cb);
    }
    return this.gp.restCall("admin.deletePartner", {partnerId: this._getPartnerId(opts), body: opts} );
  }
}

module.exports = Partner;  // for docs
