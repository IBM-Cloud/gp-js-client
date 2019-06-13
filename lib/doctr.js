/*
 * Copyright © IBM Corp. 2015-2018
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

const TranslationRequest = require('./tr');

/**
 * Document Translation Request.
 */
class DocumentTranslationRequest extends TranslationRequest {
  constructor(gp, props) {
    if(!props) props = {};
    // Inherit stuff
    super(gp, props);
  }
  /**
   * Get the type of this request.
   * 'doc' for document requests.
   */
  get type() {
    return 'doc';
  }

  get serviceInstanceId() {
    return this.serviceInstance;
  }

  get requestId() {
    return this.id;
  }

  /**
   * Create this TR on the server.
   * @param {Object} [opts={}] additional fields to set
   * @returns {Promise<DocumentTranslationRequest>} updated object including TR ID
   */
  async create(opts) {
    if(!opts) opts = {};
    const body = {};
    Object.assign(body, this);
    Object.assign(body, opts);

    const serviceInstanceId = body.serviceInstanceId || this.serviceInstanceId;
    const isAsync = body.async === true;
    // const requestId = body.requestId || this.requestId;
    // clear stuff
    delete (body.serviceInstance);
    delete (body.id);
    delete (body.gp);
    delete (body.async);

    const resp =
            await this.gp.restCall('translation_request.createDocumentTranslationRequest',
              {
                serviceInstanceId,
                async: isAsync,
                body });
    const { id, translationRequest } = resp;
    translationRequest.id = id;
    return new DocumentTranslationRequest(this.gp, translationRequest);
  }

  /**
   * Fetch the TR’s data from the server.
   * @returns {Promise<DocumentTranslationRequest>} The updated TR data
   */
  async getInfo(opts) {
    if (!opts) opts = {};
    const serviceInstanceId = opts.serviceInstanceId || this.serviceInstanceId;
    const requestId = opts.requestId || this.requestId;
    const summary = opts && opts.summary === true;
    const {translationRequest} =
        await this.gp.restCall('translation_request.getDocumentTranslationRequest', { serviceInstanceId,
          requestId,
          summary
        });
    translationRequest.id = requestId;
    return new DocumentTranslationRequest(this.gp, translationRequest);
  }

  /**
   * Update the TR’s data on the server.
   * @returns {Promise}
   */
  update(body) {
    // if (!body) body = {};
    const serviceInstanceId = body.serviceInstanceId || this.serviceInstanceId;
    const requestId = body.requestId || this.requestId;
    const isAsync = body.async === true;
    delete body.serviceInstance;
    delete body.requestId;
    delete body.async;

    return this.gp.restCall('translation_request.updateDocumentTranslationRequest', {
      serviceInstanceId,
      requestId,
      async: isAsync,
      body
    });
  }
  // TODO: delete
  // TODO: list, etc
}


module.exports = DocumentTranslationRequest;
