/**
 * @author Steven R. Loomis
 */

var version = "v1";
var urlStub = "/"+version+"/service/";

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

Client.prototype.version = version;

Client.prototype.schema = function schema(onSuccess, onFailure, args) {
    // TODO: if schema is a string, return it as a failure?
    if(this._schema) {
        console.log('.. already had schema..');
        onSuccess.apply(this, args);
    } else {
        var fetchSchema = require('fetch-swagger-schema');
        var schemaUrl = this._options.url + '/v1/api-docs';
        console.log('.. fetching ' + schemaUrl);
        var that = this;
        fetchSchema(schemaUrl, function(error, newSchema) {
            if(error) {
                console.error(error);
                onFailure(error);
            } else {
                (function(schema2) { that._schema2 = schema2; })(newSchema);
                that._schema = newSchema;
                console.log('.. _schema OK:');
                console.log(that._schema);
                //that._api = swaggerNodeClient(that._schema);
                console.log('.. _api OK');
                onSuccess.apply(that, args);
            }
        });
    }
};

// Client.prototype.translate = function ping(opts, onSuccess, onFailure) {
// };

module.exports = client;
