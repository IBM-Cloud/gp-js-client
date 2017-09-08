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
 * Construct a g11n-pipeline client. 
 * params.credentials is required unless params.appEnv is supplied.
 * @param {Object} params - configuration params
 * @param {Object} params.appEnv - pass the result of cfEnv.getAppEnv(). Ignored if params.credentials is supplied.
 * @param {Object.<string,string>} params.credentials - Bound credentials as from the CF service broker (overrides appEnv)
 * @param {string} params.credentials.url - service URL. (should end in '/translate')
 * @param {string} params.credentials.userId - service API key.
 * @param {string} params.credentials.password - service API key.
 * @param {string} params.credentials.instanceId - instance ID
 * @returns {Client}
 * @function getClient
 */ 
exports.getClient = function getClient(params) {
  return new Client(params);
};

// re export these…
exports.serviceRegex = Consts.serviceRegex;
exports.exampleCredentials = Consts.exampleCredentials;
exports.exampleCredentialsString = Consts.exampleCredentialsString;
exports._normalizeUrl = utils._normalizeUrl;
