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
        version: "v1"
    };
    
    _exports.getClient = function getClient(params) {
        return new Client(params);
    };


    function Client(options) {
        this._options = options;
          var needAll = ' - expected {credentials: { uri: ...,  api_key: ... }}';
        if ( !this._options.credentials ) {
          throw new Error("gaas: missing 'credentials' " + needAll);
        } else if ( !this._options.credentials.uri ) {
          throw new Error("gaas: missing 'credentials.uri'   " + needAll);
        } else if ( !this._options.credentials.api_key ) {
          throw new Error("gaas: missing 'credentials.api_key'  " + needAll);
        }
        this._options.credentials.uri = removeTrailing(this._options.credentials.uri, '/');
    };
    
    /** @class Project */
    function Project(gaas, projectID, props) {
      if ( props ) {
        // copy properties to this
        for(var k in props) {
          this[k] = props[k];
        }
      }
      this.gaas = gaas; // actually Client
      this.id = projectID;
    }
   
   
   /**
    * Get resourcedata for one language
    * @param {object} args
    * @param {string} args.languageID - which BCP47 language to get info for
    * @param {resourceCallback} cb
    */
   Project.prototype.getResourceData = function getResourceData(args, cb) {
     var that = this;
     args.projectID = this.id;
     this.gaas.rest_getResourceData(args, function(err, resp) {
       if(err) {
         cb(err);
       } else if(resp.resourceData) {
         cb(null, new ResourceData(that, resp.resourceData), resp);
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
Client.prototype.project = function project(projectID, props) {
  return new Project(this, projectID, props);
};

/**
 * Add auth key. modifies input.
 * @ignore
 */
Client.prototype._addAuth = function _addAuth(opts) {
  //opts["api-key"] = this._options.credentials.api_key;
  return opts;
};

/**
* Manual implementation
 */
 Client.prototype.rest_getResourceData = function rest_getResourceData(params, cb) {
     var url = this._options.credentials.uri + '/' + _exports.version + '/projects/' + params.projectID + '/' + params.languageID;
     console.log('GET ' + url);
     //params = this._addAuth(params); // add api key
     $.ajax({
       dataType: "json",
       url: url,
       //data: data,
       headers: { "api-key": this._options.credentials.api_key },
       success: function(json) {
           if(!json) { cb(Error('No JSON returned!'));  }
           else if(!json.status) { cb(Error('No status returned!'));  }
           else if(json.status !== 'success') { cb(Error('RESTful error: ' + json.status)); }
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

