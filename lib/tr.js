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
}

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
