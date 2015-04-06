/**
 * @author Steven R. Loomis
 */

var version = "v1";
var urlStub = "/"+version+"/service/";

var swaggerClient = require('swagger-client');

var debugURL = false;

function removeTrailing(str, chr) {
    if (!str || (str=="")) return str;
    var newIdx = str.length-chr.length;
    if(newIdx < 0) return str;
    if (str.substring(newIdx, str.length) == chr) {
        return str.substring(0, newIdx);
    } else {
        return str;
    }
};

function Client(options) {
    this._options = options;
    // cleanup..
    if ( this._options.vcap ) {
      if ( typeof(this._options.vcap) === 'string' ) {
        this._options.vcap = JSON.parse(this._options.vcap);
      }

      var foundService  = null;
      if ( this._options.vcap["IBM Globalization"] ) {
        foundService = this._options.vcap["IBM Globalization"][0];
      }

      if ( foundService ) {
        if ( this._options.url === undefined ) {
          this._options.url = foundService.credentials.uri;
        }
        if ( this._options.api === undefined ) {
          this._options.api = foundService.credentials.api_key;
        }
      }
    }

    if ( !this._options.url ) {
      throw "No { url: ... }  defined for gaas client";
    }

    this._options.url = removeTrailing(this._options.url, '/v1/');
    this._options.url = removeTrailing(this._options.url, '/v1');
    this._options.url = removeTrailing(this._options.url, '/');
    this._schema = null;
    if ( debugURL ) console.log('just created a client with ' + JSON.stringify(options));
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
    var funcname = 'rest_' + func;
    //console.log('Adding '+funcname);
    obj.prototype.rest_help.push(funcname);

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
                } else if(err.obj) {
                  onFailure(err.obj);
                } else {
                    onFailure(err);
                }
            });
        }, function someFailure(err) {
            if(err && err.status) {
                onFailure({error: 'error status returned', status: err.status});
            } else if(err.obj) {
              onFailure(err.obj);
            } else {
              onFailure(err);
            }
        }, [this._addAuth(args)]);
    };
}

function addApis(obj, apiList) {
    obj.prototype.rest_help = [];
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

// now, the 'simple' apis.

// no change.
Client.prototype.getInfo = Client.prototype.rest_getInfo;

Client.prototype.createProject = function(opts, onSuccess, onFailure) {
    // add default project id
    if( !opts.hasOwnProperty('id') ) {
        opts.id = this._options.project;
    }
    // wrap with body.
    if( !opts.hasOwnProperty('body') ) {
        opts = { body: opts };
    }
    this.rest_createProject(opts, onSuccess, onFailure);
};

Client.prototype.deleteProject = function(opts, onSuccess, onFailure) {
    // add default project id
    if( !opts.hasOwnProperty('projectID') ) {
        opts.projectID = this._options.project;
    }
    this.rest_deleteProject(opts, onSuccess, onFailure);
};

Client.prototype.getProject = function(opts, onSuccess, onFailure) {
    // add default project id
    if( !opts.hasOwnProperty('projectID') ) {
        opts.projectID = this._options.project;
    }
    this.rest_getProject(opts, onSuccess, onFailure);
};

Client.prototype.updateProject = function(opts, onSuccess, onFailure) {
    if( !opts.hasOwnProperty('body')) {
        opts = { body: opts };
    }
    if( !opts.body.hasOwnProperty('replace') ) {
        opts.body.replace = true;
    }
    if( !opts.hasOwnProperty('projectID') ) {
        opts.projectID = this._options.project;
    }
    if( opts.body.hasOwnProperty('languageID') ) {
        opts.languageID = opts.body.languageID;
    }
    this.rest_updateProject( opts, onSuccess, onFailure );
}

Client.prototype.getResourceData = function(opts, onSuccess, onFailure) {
    if( !opts.hasOwnProperty('projectID') ) {
        opts.projectID = this._options.project;
    }
    this.rest_getResourceData( opts, onSuccess, onFailure );
}
Client.prototype.getResourceEntry = function(opts, onSuccess, onFailure) {
    if( !opts.hasOwnProperty('projectID') ) {
        opts.projectID = this._options.project;
    }
    this.rest_getResourceData( opts, onSuccess, onFailure );
}

// for testing
Client.prototype._getUrl = function _getUrl() {
  return this._options.url;
};

module.exports = client;
