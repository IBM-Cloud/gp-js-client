

var Q = require('q');


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

module.exports = {
  wrap: shimcb,
  "return": function ret(x) {
    return x.shimmed || x.promise;
  }
}
