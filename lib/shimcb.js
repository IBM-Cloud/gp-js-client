
/*	
 * Copyright IBM Corp. 2015
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

var Q = require('q');


/**
 * @return defer or fake-defer
 */
function shimcb(cb) {
  if(cb) {
    return {
      // fake
      reject: function(x) {
        cb(x,null);
      },
      resolve: function(x) {
        cb(null, x);
      },
      shimmed: true
    };
  } else {
    return Q.defer();
  }
}

/**
 * @param x - object to be unwrapped
 */
function ret(x) {
    return x.shimmed || x.promise;
}

module.exports = {
  wrap: shimcb,
  "return": ret
}
