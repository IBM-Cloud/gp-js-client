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
const utils = require('./utils.js');
// const Consts = require('./consts');
const assert = require('assert');


/**
 * Globalization Pipeline user access object
 * @prop {String} id - the userid
 * @prop {String} updatedBy - gives information about which user updated this user last
 * @prop {Date} updatedAt - the date when the item was updated
 * @prop {String} type - `ADMINISTRATOR`, `TRANSLATOR`, or `READER`
 * @prop {String} displayName - optional human friendly name
 * @prop {Object.<string,string>} metadata - optional user-defined data
 * @prop {Boolean} serviceManaged - if true, the GP service is managing this user 
 * @prop {String} password - user password
 * @prop {String} comment - optional user comment
 * @prop {String} externalId - optional User ID used by another system associated with this user
 * @prop {Array.<string>} bundles - list of bundles managed by this user
 */
class User {
  /**
     * Note: this constructor is not usually called directly, use Client.user(id)
     * @param {Client} gp - parent Client object
     * @param {Object} props - properties to inherit
     */
  constructor(gp, props) {
    utils._initSubObject(this, gp, props);
    this.user = this; // compatibility.
    assert(this.id, "Property 'id' missing (user ID)");
    // fixups:
    if (this.updatedAt) {
      this.updatedAt = utils.datify(this.updatedAt);
    }
  }


  /**
     * Update this user. 
     * All fields of opts are optional. For strings, falsy = no change, empty string `''` = deletion.
     * 
     * @param {object} opts - options
     * @param {string} opts.displayName - User's display name - falsy = no change, empty string `''` = deletion.
     * @param {string} opts.comment - optional comment - falsy = no change, empty string '' = deletion.
     * @param {Array.<string>} opts.bundles - Accessible bundle IDs.
     * @param {object.<string,string>} opts.metadata - User defined user metadata containg key/value pairs. 
     * Data will be merged in. Pass in `{}` to erase all metadata.
     * @param {string} opts.externalId - User ID used by another system associated with this user - falsy = no change, empty string '' = deletion.
     * @param {basicCallback} cb - callback with success or failure
     */
  update(opts, cb) {
    opts = utils.fixArgs(arguments);
    if ((cb = arguments[1])) {
      return utils.depromise(this.update(opts), cb);
    }

    var that = this;
    return that.gp.restCall('user.updateUser', {
      serviceInstanceId: this.gp.getServiceInstance(this),
      userId: that.id,
      body: {
        displayName: opts.displayName || undefined,
        comment: opts.comment || undefined,
        bundles: opts.bundles || undefined,
        metadata: opts.metadata || undefined,
        externalId: opts.externalId || undefined
      }
    })
      .then(data => that.gp.user(data.user));
  }

  /**
     * Delete this user. 
     * Note that the service managed user
     * (the initial users created by the service) may not be
     *  deleted.
     * @param {Object} [opts={}] - options
     * @param {basicCallback} cb - callback with success or failure
     */
  delete(opts, cb) {
    opts = utils.fixArgs(arguments);
    if ((cb = arguments[1])) {
      return utils.depromise(this.delete(opts), cb);
    }
    opts.userId = opts.userId || this.id;
    opts.serviceInstance = opts.serviceInstance || opts.serviceInstanceId || this.gp.getServiceInstance({ serviceInstance: this.serviceInstance });
    return this.gp.deleteUser(opts, cb);
  }


  /**
     * Fetch user info.
     * The callback is given a new User instance, with
     * all properties filled in.
     * @param {Object} opts - optional, ignored
     * @param {User~getUserCallback} cb - called with updated info
     */
  getInfo(opts, cb) {
    var that = this;
    opts = utils.fixArgs(arguments);
    if ((cb = arguments[1])) {
      return utils.depromise(this.getInfo(opts), cb);
    }
    return that.gp.restCall('user.getUser', {
      serviceInstanceId: that.gp.getServiceInstance({ serviceInstance: that.serviceInstance }),
      userId: that.id
    })
      .then(data => {
        // Always return at least an empty metadata object
        data.user.metadata = data.user.metadata || {};
        return that.gp.user(data.user);
      });
  }

  /**
     * Callback called by Client~createUser() and User~getInfo()
     * @callback User~getUserCallback
     * @param {object} err -  error, or null
     * @param {User} user - On success, the new or updated User object.
     */

}
module.exports = User; // for docs