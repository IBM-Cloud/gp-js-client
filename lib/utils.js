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

"use strict";
const url = require('url');
/**
 * 
 * @param {*} f 
 * @ignore
 */
const Fields = module.exports.Fields = function Fields(f) {
  if(typeof(f)==="string") {
    f = f.split(/[, ]/);
  }
  this.fields = f;
};

/**
 * Given a parameter 'opts' return a 'fields' parameter in comma-separated form.
 * @ignore
 */
Fields.prototype.processFields = function processFields(opts) {
  if(!opts) opts = {};
  var fields = [];
  if(opts.fields) {
    fields = opts.fields.split(',');
  }
  for(var i in this.fields) {
    if(opts[this.fields[i]]) {
      fields.push(this.fields[i]);
    }
  }
  opts.fields = fields.join(',');
  if(opts.fields === "") {
    opts.fields = undefined;
  }
  return opts.fields;
};

/**
 * Copy all properties from props to o
 * @param {object} o - target of properties
 * @param {object} props - source of properties (map)
 * @ignore
 */
const copyProps = module.exports.copyProps = function copyProps(o, props) {
  if ( props ) {
    // copy properties to this
    for(var k in props) {
      if(props.hasOwnProperty(k)) {
        o[k] = props[k];
      }
    }
  }
};

/**
 * Init a subsidiary client object from a Client
 * @param {Object} o - client object to init
 * @param {Client} gp - parent g11n-pipeline client object
 * @param {Object} props - properties to inherit
 * @ignore
 */
module.exports.initSubObject = function initSubObject(o, gp, props) {
  copyProps(o, props);
  Object.defineProperty(o, 'gp', {
    configurable: true, enumerable: false, value: gp, writable: false
  });
  o.serviceInstance = gp.getServiceInstance(o); // get the service instance ID
};

// TODO: remove underscore
module.exports._initSubObject = module.exports.initSubObject;

/**
 * Convert a String into a Date
 * @param {String} d - input, if not a string it is ignored
 * @return {Date}
 * @ignore
 */
module.exports.datify = function datify(d) {
  if(typeof d !== 'string') {
    return d;
  } else {
    return new Date(d);
  }
};

/**
 * Return a list of missing fields. Special cases the instanceId field.
 * @param obj obj containing fields
 * @param fields array of fields to require
 * @return array of which fields are missing
 * @ignore
 */
module.exports.isMissingField = function isMissingField(obj, fields) {
  var missing = [];
  for(var k in fields) {
    if(fields[k] === 'instanceId' && obj.isAdmin) continue; // skip instanceId for admin instances
    if(!obj[fields[k]]) {
      missing.push(fields[k]);
    }
  }
  return missing;
};

/**
 * Verify REST result object. Use this
 * @param {Object} resp - value from swagger promise
 * @return {Object|Promise} result or rejected as a .then() or .catch() — unpacked (inner obj)
 * @ignore
 */
module.exports.verifyRest = function verifyRest(resp) {
  if(resp.ok && resp.obj && resp.obj.status === 'SUCCESS') {
    return resp.obj; // unpack
  } else {
    return module.exports.RESTError(resp);
  }
};

/**
 * This is similar to verifyRest, except that it always errors (returns a Promise.reject)
 * @ignore
 */
module.exports.verifyError = function verifyError(e) {
  if(e.response) {
    return module.exports.RESTError(e.response);
  } else {
    return Promise.reject(e); // re-wrap.
  }
};

/**
 * @ignore
 */
module.exports.verifyPromise = function verifyPromise(p) {
  return p
    .then(module.exports.verifyRest)
    .catch(module.exports.verifyError); // catch any error and unpack the REST status
}

/**
 * Unpack an error object from the REST machinery.
 * @ignore
 */
module.exports.RESTError = function RESTError(resp) {
  let e;
  const hostname = (url.parse(resp.url||'').hostname) || '(unknown server)';
  const theHost = '[g11n-pipeline@' + hostname +']: ';
  const statusStr = theHost + resp.status + ':' + resp.statusText + ' ';
  if(resp.obj && resp.obj.status !== "SUCCESS") {
    if (resp.obj.message) {
      e = Error(statusStr + resp.obj.message);
    } else {
      e = Error(statusStr + resp.obj.status)
    }
  } else {
    e = Error(statusStr);
  }
  e.response = resp; // back link
  return Promise.reject(e);
};

/**
 * @ignore
 */
module.exports._normalizeUrl = function _normalizeUrl(u) {
  u = exports.removeTrailing(u,"/"); // take off the trailing slash
  u = module.exports.addTrailing(u,"/rest"); // add the trailing /rest
  return u;
}

/**
 * Remove trailing text from a string
 * @param {string} str - Input string
 * @param {string} chr - Text to be removed
 * @ignore
 */
module.exports.removeTrailing = function removeTrailing(str, chr) {
  if (!str || (str=="")) return str;
  var newIdx = str.length-chr.length;
  if(newIdx < 0) return str;
  if (str.substring(newIdx, str.length) === chr) {
    return str.substring(0, newIdx);
  } else {
    return str;
  }
};

/**
 * Add trailing text from a string
 * @param {string} str - Input string
 * @param {string} chr - Text to be added (ignored if already present)
 * @ignore
 */
module.exports.addTrailing = function addTrailing(str, chr) {
  if (!str || (str=="")) return str;
  var newIdx = str.length-chr.length;
  if(newIdx < 0) return str;
  if (str.substring(newIdx, str.length) === chr) {
    return str; // already there
  } else {
    return str+chr; // append
  }
};

/**
 * Fix up arguments to implement ([opts], [cb])
 * On exit, opts will be {} unless there was a parameter in opts.
 * On exit, if cb is set, it needs to be called for depromisify
 * Usage:
 *   fn(opts, cb) {
 *   opts = utils.fixArgs(arguments);
 *   if((cb = arguments[1])) {
 *     return this.fn(opts);
 *   } else {
 *     return promise…
 *   }
 * @param {Object[]} args - the “arguments” param to be fixed (arguments[0] and arguments[1] may be modified)
 * @return {Object} opts - returns arguments[0].
 * @ignore
 */
module.exports.fixArgs = function fixArgs(args) {
  // console.dir({in: args});
  const OPTS = 0;
  const CB   = 1;
  if (!args[OPTS]/* && !args[CB]*/) {
    // fn(null, …) -> fn({}, …)
    args[OPTS] = {};
  } else if (typeof args[OPTS] === 'function' && !args[CB]) {
    // fn(cb, null) -> fn({}, cb)
    args[CB] = args[OPTS];
    args[OPTS] = {};
  }
  // console.dir({out: args});
  return args[OPTS];
};

/**
 * Unpack a promise into a callback
 * @param {Promise} p - the promise
 * @param {Function} cb - the callback (err, value)
 * @return {Promise} - the end of the promise chain
 * @ignore
 */
module.exports.depromise = function depromise(p, cb) {
  // if(!p.then) return cb(null, p)
  return p
    .then(d => cb(null, d))
    .catch(e => cb(e)); // does return the promise, but no unhandled rejection.
};
