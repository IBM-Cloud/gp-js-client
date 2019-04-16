/*
* Copyright IBM Corp. 2015-2018
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

const Client = require('./client');
const minimist = require('minimist');
const verbs = require('./gpcli-verbs');
const {readJson} = require('./utils');
const manifest = require('../package');
const process = require('process');
/* eslint no-console: "off" */

/**
 * Command line interface to the Globalization Pipeline.
 * Example usage:
 * ```js
 * const Cli = require('g11n-pipeline/lib/gpcli');
 * new Cli(Cli.parseArgs(process.argv)).run().then(…);
 * ```
 */
class Cli {
  /**
     * Options to be used with minimist.
     * See https://www.npmjs.com/package/minimist#var-argv--parseargsargs-opts
     */
  static get parseOpts() {
    return {
      string: [],
      boolean: [ 'help' ],
      alias: {
        serviceUrl: 's',
        instanceId: 'i',
        user: 'u',
        password: 'p',
        apikey: 'a',
        iam_endpoint: 'A',
        jsonCreds: 'j',
        bundle: 'b',
        outputFormat: 'F',
        status: 'S',
        languages: 'l',
        file: 'f',
        flatten: 'T'
      }
    };
  }
  /**
     * Parse the args with miminist
     * @param {Object} argv - argv from process.argv
     */
  static parseArgs(argv) {
    return minimist(argv.slice(2), Cli.parseOpts);
  }
  /**
    * To use from a script: `new Cli(Cli.parseArgs(process.argv))`
    * @param {Object} argv - a minimist-compatible argv array (i.e. { "config": "config.json", "_": [ "list" ] })
    * @param {String[]} argv._ - array of non-option arguments (i.e. 'list', 'ping', etc.)
    */
  constructor(argv) {
    this.argv = argv;
    this._ = this.argv._;
    if (this._ && this._.length > 1) {
      throw Error('Please supply exactly one verb.');
    }
    this.verb = (argv.help)?'help':(this._[0]||'help');
  }

  /**
   * Filter the result according to the --outputFormat option.
   * Use:  `cli.run().then((result) => cli.filter(result))`
   */
  filter(result) {
    switch(this.argv.outputFormat) {
    case 'json':
      return JSON.stringify(result);
    case 'line':
      if( Array.isArray(result) ) {
        return result.join('\n');
      } else if( typeof result === 'object' ) {
        return Object.keys(result).join('\n');
      } else {
        // not array
        return result;
      }
    case 'none':
      return null;

      // Default case: return object.
    case 'compact':
    default:
      return result;
    }
  }

  /**
   * Run the verb, returning a Promise with the result.
   * If you call this multiple times, it will run multiple times.
   * @return {Promise<Object>} the result (verb dependent)
   */
  async run() {
    if (this.verb === 'help') {
      if(!this.argv.outputFormat) {
        // assume json output for structured help
        this.argv.outputFormat = 'json';
      }
      // Special verb.
      return Cli.help;
    }

    const credentials = await this.getCredentials();
    const client = new Client({credentials});

    if( verbs[this.verb] ) {
      return verbs[this.verb].call(this, client, this.argv, this);
    } else {
      return Promise.reject(`Unknown verb: ${this.verb}`);
    }
  }

  /**
   * @param {Object} argv - args
   * @returns {Object} credentials
   */
  async getCredentials() {
    if ( this.argv.jsonCreds ) {
      const credentials =  await readJson(this.argv.jsonCreds);
      // unpack if nested
      if(credentials.credentials) return credentials.credentials;
      return credentials;
    } else {
      const {GP_URL, GP_INSTANCE_ID, GP_USER_ID, GP_PASSWORD, GP_IAM_API_KEY, GP_IAM_ENDPOINT} = process.env;
      const credentials = {
        url: this.argv.serviceUrl || GP_URL,
        userId: this.argv.user || GP_USER_ID,
        password: this.argv.password || GP_PASSWORD,
        instanceId: this.argv.instanceId || GP_INSTANCE_ID,
        apikey: this.argv.apikey || GP_IAM_API_KEY,
        iam_endpoint: this.argv.iam_endpoint || GP_IAM_ENDPOINT
      };
        // TODO: validate
      return credentials;
    }
  }

  static get help() {
    return {
      about: 'Globalization Pipeline CLI',
      options:
        Object.keys(this.parseOpts.alias).map((o) => `--${o}`),
      verbs:
        Object.keys(verbs),
      url: manifest.repository.url,
      version: manifest.version
    };
  }
}

module.exports = Cli;
