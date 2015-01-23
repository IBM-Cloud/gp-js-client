/**
 * @author Steven R. Loomis
 */

var rest = require('rest');
var mime = require('rest/interceptor/mime');
var errorCode = require('rest/interceptor/errorCode');
var pathPrefix = require('rest/interceptor/pathPrefix');

var urlStub = "/v1/service/";

function removeTrailing(str, chr) {
    if (!str || (str=="")) return str;
    if (str[str.length-1] == chr) {
        return str.substring(0, str.length-1);
    } else {
        return str;
    }
};

function Client(options) {
    this._options = options;
    this._options.url = removeTrailing(this._options.url, '/');
    this.client = rest.wrap(mime, { mime: 'application/json' })
                      .wrap(pathPrefix, { prefix: this._options.url + urlStub })
                      .wrap(errorCode, { code: 500 });
    console.log('just created a client with ' + JSON.stringify(options));
};

function client(options) {
    return new Client(options);
};

// // This won't really go anywhere, but tests the call API
// Client.prototype.ping = function ping(onSuccess, onFailure) {
//     rest(this._options.url + urlPing).then(onSuccess).otherwise(onFailure);
// };

Client.prototype.translate = function ping(opts, onSuccess, onFailure) {
    this.client({
        method: 'POST',
        path: 'translate',
        entity: { 
            api_key: this._options.api,
            project_id: this._options.project,
            source: opts.source,
            target: opts.target,
            data: opts.data,
        },
    })
    .then(onSuccess).otherwise(onFailure);
};

module.exports = client;
