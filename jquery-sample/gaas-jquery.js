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


var gaas = (function(){
    var _exports = {
        version: "v2"
    };
    
    _exports.getClient = function getClient(params) {
        return new Client(params);
    };


    function Client(options) {
        this._options = options;
        //   var needAll = ' - expected {credentials: { uri: ...,  api_key: ... }}';
        // if ( !this._options.credentials ) {
        //   throw new Error("gaas: missing 'credentials' " + needAll);
        // } else if ( !this._options.credentials.uri ) {
        //   throw new Error("gaas: missing 'credentials.uri'   " + needAll);
        // } else if ( !this._options.credentials.api_key ) {
        //   throw new Error("gaas: missing 'credentials.api_key'  " + needAll);
        // }
        this._options.credentials.uri = removeTrailing(this._options.credentials.uri, '/');
    };
    
    /** @class Project */
    function Bundle(gaas, bundleId, props) {
      if ( props ) {
        // copy properties to this
        for(var k in props) {
          this[k] = props[k];
        }
      }
      this.gaas = gaas; // actually Client
      this.bundleId = bundleId;
    }
   
   
   /**
    * Get resourcedata for one language
    * @param {object} args
    * @param {string} args.languageID - which BCP47 language to get info for
    * @param {resourceCallback} cb
    */
   Bundle.prototype.getResourceStrings = function getResourceStrings(args, cb) {
     var that = this;
     args.projectID = this.id;
     this.gaas.rest_getResourceStrings(args, function(err, resp) {
       if(err) {
         cb(err);
       } else if(resp.resourceStrings) {
         cb(null, new ResourceData(that, resp.resourceStrings), resp);
       } else {
         cb(Error("Response was lacking resource information"));
       }
     });
   };
    
/** @class ResourceData */
function ResourceData(project, props) {
  if ( props ) {
    // copy properties to this
    for(var k in props) {
      this[k] = props[k];
    }
  }
  this.project = project;
}

/**
 * Create a new Project object for further access.
 * Note that this function doesn't create the project or fetch any information.
 * @param {string} projectID
 * @param {object} props - optional properties to set on the object
 */
Client.prototype.bundle = function project(projectID, props) {
  return new Bundle(this, projectID, props);
};

/**
 * Core implementation.
 * All of the rest is syntactic sugar.
 */
 Client.prototype.rest_getResourceStrings = function rest_getResourceData(params, cb) {
    var that = this;
     var url = this._options.credentials.uri + 
          '/rest' +
          '/' + this._options.credentials.instanceId +
          '/' + _exports.version + // v2
          '/bundles' +
          '/' + this._options.bundleId +
          '/' + params.languageID;
          
     console.log('GET ' + url);
     //params = this._addAuth(params); // add api key
     $.ajax({
       
       beforeSend: function(x) {
         x.setRequestHeader('Authorization',
         'Basic ' + window.btoa(that._options.credentials.userId+
                          ':'+that._options.credentials.password));
       },
       //username: this._options.credentials.userId,
       // password: this._options.credentials.password,
       dataType: "json",
       url: url,
       //data: data,
       // BASIC AUTH
       success: function(json) {
           if(!json) { cb(Error('No JSON returned!'));  }
           else if(!json.status) { cb(Error('No status returned!'));  }
           else if(json.status !== 'SUCCESS') { cb(Error('RESTful error: ' + json.status)); }
           else { cb(null, json);  }
       },
       error: cb
     });     
 };

        
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

    return _exports;
})();

