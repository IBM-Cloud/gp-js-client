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

const utils = require('./utils');

class HTMLDocument {
  constructor (opts, gp) {
    utils._initSubObject(this, gp, {});
    Object.assign(this, opts);
  }

  delete() {
    return this.gp.restCall('document.deleteHtmlDocument', { serviceInstanceId: this.serviceInstanceId, documentId: this.id });
  }

  create(body) {
    return this.gp.restCall('document.createHtmlDocument',
      {
        serviceInstanceId: this.serviceInstanceId,
        documentId: this.documentId,
        body: body
      });
  }

  upload(opts) {
    const { languageId, body } = opts;
    return this.gp.restCall('document.uploadHtmlDocument', {
      serviceInstanceId: this.serviceInstanceId,
      documentId: this.documentId,
      languageId,
      body
    });
  }

  /**
   * Fetch the document’s data from the server
   */
  async getInfo() {
    const {documentData} = await this.gp.restCall('document.getHtmlDocumentData',
      {
        serviceInstanceId: this.serviceInstanceId,
        documentId: this.documentId
      });
    return this.gp.HTMLDocument(this.documentId, documentData);
  }

  /**
     * Download document
     * @param {Object} opts
     */
  download(opts) {
    if (typeof opts === 'string') {
      opts = {languageId: opts};
    }
    const serviceInstanceId = opts.serviceInstanceId || this.serviceInstanceId;
    const { languageId } = opts;
    const documentId = opts.documentId || this.documentId;
    return this.gp.swaggerClient.then((client) =>
      client.apis.document.getHtmlDocument({
        serviceInstanceId,
        documentId,
        languageId
      }))
      .then((resp) => {
        if(resp.status !== 200) throw Error(`${resp.status}: ${resp.statusText}`);
        return resp.data;
      });
  }


  get serviceInstanceId() {
    return this.gp._options.serviceInstance;
  }
  get documentId() {
    return this.id;
  }
  set documentId(id) {
    this.id = id;
  }
}

module.exports = HTMLDocument;
