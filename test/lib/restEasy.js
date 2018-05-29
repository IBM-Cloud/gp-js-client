/*
 * IBM Globalization
 * IBM Confidential / Copyright (C) IBM Corp. 2018
 */

/**
 * catch filter for 409 Conflict
 * @param {Error} e
 */
module.exports.conflict = function conflict(e) {
  if(e.response && e.response.status === 409) {
    return Promise.resolve({notAnError: e});
  } else {
    throw e;
  }
};

module.exports.notFound = function notFound(e) {
  if(e.response && e.response.status === 404) {
    return Promise.resolve({notAnError: e});
  } else {
    throw e;
  }
};

