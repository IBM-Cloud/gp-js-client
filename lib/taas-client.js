/**
 * @author Steven R. Loomis
 */

var rest = require('rest');

var urlStub = "/v1/service/query";

function Client(options) {
    this._options = options;
    console.log('Cool, just created a client with ' + JSON.stringify(options));
};

function client(options) {
    return new Client(options);
};

module.exports = client;
