/*	
 * Copyright IBM Corp. 2017
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

const utils = require('./utils.js');

/**
 * This class represents a request for professional editing of machine-translated content.
 * @class TranslationRequest
 */
function TranslationRequest(gp, props) {
  utils.initSubObject(this, gp, props);
  // turn some string dates into date objects
  if(this.createdAt) {
    this.createdAt = utils.datify(this.createdAt);
  }
  if(this.startedAt) {
    this.startedAt = utils.datify(this.startedAt);
  }
  if(this.translatedAt) {
    this.translatedAt = utils.datify(this.translatedAt);
  }
  if(this.mergedAt) {
    this.mergedAt = utils.datify(this.mergedAt);
  }
  if(this.estimatedCompletion) {
    this.estimatedCompletion = utils.datify(this.estimatedCompletion);
  }
}

/**
 * Fetch the full record for this translation request.
 */
TranslationRequest.prototype.getInfo = function getTranslationRequest(opts, cb) {
  if( !cb ) {
    cb = opts;
    opts = {};
  }

  const serviceInstance = opts.serviceInstanceId || this.serviceInstance;
  const requestId = opts.requestId || this.id;
  const that = this;

  this.gp.restCall("translation_request.getTranslationRequest", {serviceInstanceId: serviceInstance, requestId: requestId}, function(err, resp) {
      if(err) return cb(err); // bail out, error.
      const newTr = new TranslationRequest(that.gp, resp.translationRequest);
      newTr.id = resp.id;
      return cb(null, newTr);
  });
};

/**
 * Delete this translation request.
 * @param {Object} [opts={}]
 * @param {BasicCallBack} cb
 */
TranslationRequest.prototype.delete = function deleteTranslationRequest(opts, cb) {
  if( !cb ) {
    cb = opts;
    opts = {};
  }

  const serviceInstance = opts.serviceInstanceId || this.serviceInstance;
  const requestId = opts.requestId || this.id;
  const that = this;

  return this.gp.restCall("translation_request.deleteTranslationRequest", {serviceInstanceId: serviceInstance, requestId: requestId}, cb);
};

/**
 * Create a translation request with the specified options
 * @param {Object} [opts={}] - Options object - if present, overrides values in this
 */
TranslationRequest.prototype.create = function createTranslationRequest(opts, cb) {
  if( !cb ) {
    cb = opts;
    opts = {};
  }
  const translationRequest = {};
  utils.copyProps(translationRequest, this); // first, props from obj
  utils.copyProps(translationRequest, opts); // then, extra opts

  // clear out stuff
  delete(translationRequest.serviceInstance);
  delete(translationRequest.gp);

  const that = this;

  this.gp.restCall("translation_request.createTranslationRequest",
     {serviceInstanceId: this.serviceInstance, body: translationRequest}, function(err, resp) {
      if(err) return cb(err); // bail out, error.
      const newTr = new TranslationRequest(that.gp, resp.translationRequest);
      newTr.id = resp.id;
      return cb(null, newTr);
     });
};

module.exports = TranslationRequest;
