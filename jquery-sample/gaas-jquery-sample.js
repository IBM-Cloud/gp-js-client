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

var gaasClient;
var gaasProject;

window.onload = function() {
    $('#hello').text('(loading)');
    
    gaasClient = gaas.getClient(sampleconfig);
    
    gaasProject = gaasClient.project(sampleconfig.project);
    
    gaasProject.getResourceData({languageID:'es'}, function cb(err, resp) {
        /*
            'resp' looks like this (on success):
              var resp = {
                  data: {
                          "hello":  "Hello world", 
                          ...  (all other k/v pairs )
                  },
                  ...
              };
              
              For this sample we are only printing out one, 'hello'
        */
        if(err) { 
            $('#hello').text('ERR: ' + err.toString());
        } else {
            $('#hello').text(resp.data.hello);
        }
    });
};