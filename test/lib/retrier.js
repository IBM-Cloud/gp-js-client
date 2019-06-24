/*
 * Copyright IBM Corp. 2015,2019
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

const delay = require('delay');

// await in loop is needed for this module.
/* eslint-disable no-await-in-loop */

/**
 * Get a retry function with default opts
 * @param {Object} defaultOpts overrides for the specific retrier
 */
function getRetrier(defaultOpts) {
  /**
     * @param {Function} fn function to call
     * @param {Object} opts options to use
     */
  return async function retrier(fn, opts) {
    const newOpts = { fn };
    Object.assign(newOpts, defaultOpts || {});
    Object.assign(newOpts, opts || {});

    const {retries, verbose, pause, arg} = newOpts;

    for(var i=1; i<=retries; i++) {
      if(verbose) console.log('retrier: try ', i, 'of', retries);
      const {result, err} = await (fn(arg)
        .then(result => ({result}))
        .catch(err => ({err})));

      if(!err) {
        if(verbose) console.log('retrier: OK on try ', i, 'of', retries);
        return result; // We have a result: Could be falsy.
      }
      if(verbose) console.log('retrier: Fail on try ', i, 'of', retries);

      if(i === retries) {
        if(verbose) console.error('retrier: too many retries');
        return Promise.reject(err);
      } else {
        if(verbose) console.log('retrier: err:', err);
        if(pause) await delay(pause);
      }
    }
  }
}

module.exports.getRetrier = getRetrier;