/*
 * Copyright IBM Corp. 2015-2019
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

const {readJson} = require('./utils');

// These functions are called with this signature:
// - 'this' is the GP client
// - args: (client, verb, argv, Cli)
module.exports = {
  /**
     * Return a list of bundles
     */
  list: (client) => client.bundles().then((bundles) => Object.keys(bundles)),

  /**
     * true if all is OK
     */
  ping: (client) => client.ping().then((m) => (m.status === 'SUCCESS')),

  /**
     * client info
     */
  info: (client) => client.getServiceInfo(),

  /**
     * client info
     */
  instanceInfo: (client) => client.getServiceInstanceInfo(),

  /**
   * get bundle metadata
   */
  show: (client, argv) => client.bundle(argv.bundle).getInfo(),

  /**
   * Create bundle
   */
  create: (client, argv) => client.bundle(argv.bundle).create({
    sourceLanguage: argv.languages.split(',')[0],
    targetLanguages: argv.languages.split(',').slice(1)
  }),

  update: (client, argv) => client.bundle(argv.bundle).update({
    targetLanguages: argv.languages.split(',')
  }),

  /**
   * Delete bundle
   */
  delete: (client, argv) => client.bundle(argv.bundle).delete(),

  import: async (client, argv) => client.bundle(argv.bundle)
    .uploadStrings({
      languageId: argv.languages,
      strings: await readJson(argv.file)
    }),
  export: (client, argv) => client.bundle(argv.bundle)
    .getStrings({languageId: argv.languages})
    .then(r => r.resourceStrings),
  /**
   * show trs
   */
  trs: (client, argv) => client.trs({status: argv.status}),

  /**
   * show doctrs
   */
  docTrs: (client, argv) => client.docTrs({status: argv.status})

};