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

class MarkdownDocument {
  constructor (opts, gp) {
    utils._initSubObject(this, gp, {});
    Object.assign(this, opts);
  }

  /**
   * Delete this document
   */
  delete() {
    return this.gp.restCall('document.deleteMdDocument', { serviceInstanceId: this.serviceInstanceId, documentId: this.id });
  }

  /**
   * Fetch the document’s data from the server
   */
  async getInfo() {
    const {documentData} = await this.gp.restCall('document.getMdDocumentData',
      {
        serviceInstanceId: this.serviceInstanceId,
        documentId: this.documentId
      });
    return this.gp.MarkdownDocument(this.documentId, documentData);
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
      client.apis.document.getMdDocument({
        serviceInstanceId,
        documentId,
        languageId
      }))
      .then((resp) => {
        if(resp.status !== 200) throw Error(`${resp.status}: ${resp.statusText}`);
        return resp.data;
      });
  }

  /**
   * Create a new Markdown document
   */
  create(body) {
    return this.gp.restCall('document.createMdDocument',
      {
        serviceInstanceId: this.serviceInstanceId,
        documentId: this.documentId,
        body: body
      });
  }

  /**
   * upload a Markdown document’s content
   */
  upload(opts) {
    const { languageId, body } = opts;
    return this.gp.restCall('document.uploadMdDocument', {
      serviceInstanceId: this.serviceInstanceId,
      documentId: this.documentId,
      languageId,
      body
    });
  }

  /**
   * Gets the service instance ID
   */
  get serviceInstanceId() {
    return this.gp._options.serviceInstance;
  }

  /**
   * Get the document’s identifier
   */
  get documentId() {
    return this.id;
  }

  set documentId(id) {
    this.id = id;
  }
}

module.exports = MarkdownDocument
