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

const Client = require('./client.js');
const Consts = require('./consts.js');
const utils = require('./utils.js');

/**
 * @author Steven R. Loomis
 */

/**
 * Create a GP client.
 * Returns a promise to the client.
 * params.credentials is required unless params.appEnv is supplied.
 * Required either: (userId & password) or (apikey & iam_endpoint)
 * @param {Object} params - configuration params
 * @param {Object} params.appEnv - pass the result of cfEnv.getAppEnv(). Ignored if params.credentials is supplied.
 * @param {Object.<string,string>} params.credentials - Bound credentials as from the CF service broker (overrides appEnv)
 * @param {string} params.credentials.url - service URL. (should end in '/translate')
 * @param {string} params.credentials.userId - GP auth userid.
 * @param {string} params.credentials.password - GP auth password.
 * @param {string} params.credentials.apikey - IAM apikey
 * @param {string} params.credentials.iam_endpoint - IAM endpoint
 * @param {string} params.credentials.instanceId - instance ID
 * @function connect
 * @returns {Promise<Client>}
 */
exports.connect = async function connect(params) {
  const client = new Client(params);
  await client.swaggerClient; // ensure the client is ready
  return client;
};

// re export these…
exports.serviceRegex = Consts.serviceRegex;
exports.exampleCredentials = Consts.exampleCredentials;
exports.exampleCredentialsString = Consts.exampleCredentialsString;
exports._normalizeUrl = utils._normalizeUrl;
