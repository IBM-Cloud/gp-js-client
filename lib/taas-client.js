/**
 * @author Steven R. Loomis
 */

var urlStub = "/v1/service/";

var swaggerNodeClient = require('swagger-node-client');

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
    this._schema = null;
    console.log('just created a client with ' + JSON.stringify(options));
};

function client(options) {
    return new Client(options);
};

Client.prototype.schema = function schema(onSuccess, onFailure, args) {
    // TODO: if schema is a string, return it as a failure?
    if(this._schema) {
        console.log('.. already had schema..');
        onSuccess.apply(this, args);
    } else {
        var fetchSchema = require('fetch-swagger-schema');
        var schemaUrl = this._options.url + '/api-docs';
        console.log('.. fetching ' + schemaUrl);
        var that = this;
        fetchSchema(schemaUrl, function(error, newSchema) {
            if(error) {
                console.error(error);
                onFailure(error);
            } else {
                that._schema = newSchema;
                console.log('.. _schema OK');
                that._api = swaggerNodeClient(this._schema);
                console.log('.. _api OK');
                onSuccess.apply(this, args);
            }
        });
    }
};

// Client.prototype.translate = function ping(opts, onSuccess, onFailure) {
// };

module.exports = client;
