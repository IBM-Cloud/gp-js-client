/**
 * @author Steven R. Loomis
 */

var version = "v1";
var urlStub = "/"+version+"/service/";

var swaggerClient = require('swagger-client');

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
    var c = new Client(options);
    // prime the pump
    //c._fetchApi(console.log, console.error, ["(client ready)"]);
    // add api key
    swaggerClient.authorizations.add("api-key", new swaggerClient.ApiKeyAuthorization("api-key",options.api,"query"));
    return c;
};

Client.prototype.version = version;


Client.prototype._fetchApi = function _fetchApi(onSuccess, onFailure, args) {
    // TODO: if api is a string, return it as a failure?
    if(this._api) {
        console.log('.. already had api..');
        onSuccess.apply(this, args);
    } else {
        var schemaUrl = this._options.url + '/v1/api-docs';
        console.log('.. fetching ' + schemaUrl);
        var that = this;
        this._api = new swaggerClient.SwaggerApi({
            url: schemaUrl,
            success: function() {
                if(that._api.ready === true) {
                    console.log(' API is ready ');
                    onSuccess.apply(that, args);
                } else {
                    console.log('.. swagger not ready yet');
                }
            },
            failure: function(err) {
                console.error('Failure: ');
                console.error(err);
            },
        });
    }
};

// Client.prototype.translate = function ping(opts, onSuccess, onFailure) {
// };

module.exports = client;
