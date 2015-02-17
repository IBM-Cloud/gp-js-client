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

/**
 * Add auth key. modifies input.
 */
Client.prototype._addAuth = function _addAuth(opts) {
    opts["api-key"] = this._options.api;
    return opts;
};

Client.prototype._fetchApi = function _fetchApi(onSuccess, onFailure, args) {
    //console.log('args=');
    //console.dir(args);
    // TODO: if api is a string, return it as a failure?
    if(this._api) {
        //console.log('.. already had api..');
        onSuccess.apply(this, args);
    } else {
        var schemaUrl = this._options.url + '/v1/api-docs';
        //console.log('.. fetching ' + schemaUrl);
        var that = this;
        this._api = new swaggerClient.SwaggerApi({
            url: schemaUrl,
            success: function() {
                if(that._api.ready === true) {
                    //console.log(' API is ready, passing: ');
                    //console.dir(args);
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

// Client.prototype.getProjectList = function getProjectList(args, onSuccess, onFailure) {
//     this._fetchApi(function getProjectList2(args2) {
//         this._api.projects.getProjectList(args2, function(resp) {
//             onSuccess(resp.obj);
//         }, onFailure);
//     }, onFailure, [this._addAuth(args)]);
// }

function addApi(obj, par, func) {
    var funcname = func;
    //console.log('Adding '+funcname);
    obj.prototype.help.push(funcname);

    obj.prototype[funcname] = function someApi(args, onSuccess, onFailure) {
        this._fetchApi(function someApiInner(args2) {
            this._api[par][func](args2, function(resp) {
                if(resp && resp.status === 500) {
                    onFailure({error: 'error status returned', status: err.status});
                } else if (resp && resp.obj && resp.obj.status !== 'success') {
                    onFailure(resp.obj);
                } else {
                    onSuccess(resp.obj);
                }
            }, function someApiFailure(err) {
                if(err && err.status === 500) {
                    onFailure({error: 'error status returned', status: err.status});
                } else {
                    onFailure(err);
                }
            });
        }, function someFailure(err) {
            if(err && err.status) {
                onFailure({error: 'error status returned', status: err.status});
            } else {
                onFailure(err);
            }
        }, [this._addAuth(args)]);
    };
}

function addApis(obj, apiList) {
    obj.prototype.help = [];
    for(var api in apiList) {
        var sub = apiList[api];
        if(typeof(sub) === 'string') {
            addApi(obj, sub);
        } else {
            for(var n in sub) {
                addApi(obj, api, sub[n]);
             }
        }
    }
}



addApis(Client, 
        require('./taas-client-list.js')
       );


// Client.prototype.translate = function ping(opts, onSuccess, onFailure) {
// };

module.exports = client;
