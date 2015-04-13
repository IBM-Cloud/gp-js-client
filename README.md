JavaScript Client for IBM Bluemix Globalization-as-a-Service
===
<!--
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
-->

# What is this?

This is a JavaScript client and sample code for the
[IBM Globalization](https://www.ng.bluemix.net/docs/#services/Globalization/index.html#globalization)
Bluemix service.

# jQuery

There is an experimental sample showing jQuery use in the `jquery` directory.

# Node.js

Presently, the client is only available for [node.js](http://nodejs.org) client, but is expected to
support other JavaScript platforms, including browser frameworks.


## Quickstart - Bluemix

Load the gaas client object as follows (using [cfenv](https://www.npmjs.com/package/cfenv) )

    var appEnv = require('cfenv').getAppEnv();
    var gaasClient = require('gaas').getClient({
       credentials:  appEnv.getService(/IBM Globalization.*/).credentials
    });

Or, if you are providing credentials manually:

    var gaasClient = require('gaas').getClient({
     credentials: {
        uri: 'https://<GaaS server URL>',
        api_key: '<your API key>'
     }
    });

Note that `api_key` can be from the bound service credentials, or else a "reader key" as
visible in the IBM Globalization service dashboard.

To load the key "hello" in Spanish from the project named "world" you can use this code:

    var myProject = gaasClient.project('world');

    myProject.getResourceEntry({
          resKey: 'hello',
          languageID: 'es'
        },
        function(err, entry) {
            if(err) {
                console.error(err); return;
            } else if(entry.value) {
                console.log( entry.value ); // Print out the value!
            } else {
                console.error('Status is ' + entry.translationStatus); // may be: 'inProgress' or 'failed'
            }
    });


API convention
==

Many of the APIs have this pattern:

`obj.function( { /*params*/ } ,  function callback(err, ...))`

* `err`: if truthy, indicates an error has occured.
* `...`: other parameters (optionally)

All language ids are IETF BCP47 codes.

API reference
===
<a name="module_gaas"></a>
#gaas
**Author**: Steven R. Loomis  
**Members**

* [gaas](#module_gaas)
  * [callback: gaas~basicCallback](#module_gaas..basicCallback)
  * [callback: gaas~supportedTranslationsCallback](#module_gaas..supportedTranslationsCallback)
  * [callback: gaas~projectInfoCallback](#module_gaas..projectInfoCallback)
  * [callback: gaas~resourceCallback](#module_gaas..resourceCallback)
  * [callback: gaas~resourceCallback](#module_gaas..resourceCallback)
  * [callback: gaas~listCallback](#module_gaas..listCallback)
  * [class: gaas~Client](#module_gaas..Client)
    * [client.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
    * [client.ping(args, cb)](#module_gaas..Client#ping)
    * [client.project(projectID, props)](#module_gaas..Client#project)
    * [client.listProjects(args)](#module_gaas..Client#listProjects)
  * [class: gaas~ResourceData](#module_gaas..ResourceData)
  * [class: gaas~ResourceEntry](#module_gaas..ResourceEntry)
  * [class: gaas~Project](#module_gaas..Project)
    * [project.create(args, cb)](#module_gaas..Project#create)
    * [project.remove(args, cb)](#module_gaas..Project#remove)
    * [project.getInfo()](#module_gaas..Project#getInfo)
    * [project.addTargetLanguages(args, cb)](#module_gaas..Project#addTargetLanguages)
    * [project.getResourceData(args, cb)](#module_gaas..Project#getResourceData)
    * [project.updateResourceData(args, cb)](#module_gaas..Project#updateResourceData)
    * [project.deleteLanguage(args, cb)](#module_gaas..Project#deleteLanguage)
    * [project.getResourceEntry(args, cb)](#module_gaas..Project#getResourceEntry)

<a name="module_gaas..basicCallback"></a>
##callback: gaas~basicCallback
**Params**

- err `object` - if(err), error  
- result `object` - any result data  

**Scope**: inner typedef of [gaas](#module_gaas)  
**Type**: `function`  
<a name="module_gaas..supportedTranslationsCallback"></a>
##callback: gaas~supportedTranslationsCallback
**Params**

- err `object` - if(err), error  
- translations `Object.<string, Array.<string>>` - source : [target...] languages  

**Scope**: inner typedef of [gaas](#module_gaas)  
**Type**: `function`  
<a name="module_gaas..projectInfoCallback"></a>
##callback: gaas~projectInfoCallback
**Params**

- err `object` - if(err), error  
- project `Project` - the updated Project object with the latest data  

**Scope**: inner typedef of [gaas](#module_gaas)  
**Type**: `function`  
<a name="module_gaas..resourceCallback"></a>
##callback: gaas~resourceCallback
**Params**

- err `object` - if(err), error  
- resource `ResourceData` - the specified resource data  
  - data `Object.<string, string>` - the translated key/value pairs  
  - inProgress `Array.<string>` - a list of the keys that are still in progress  
  - failed `Array.<string>` - a list of the keys that failed to translate  

**Scope**: inner typedef of [gaas](#module_gaas)  
**Type**: `function`  
<a name="module_gaas..resourceCallback"></a>
##callback: gaas~resourceCallback
**Params**

- err `object` - if(err), error  
- entry `ResourceEntry` - the specified resource entry  
  - value `string` - the entry's string value  
  - translationStatus `string` - the entry's translation status  

**Scope**: inner typedef of [gaas](#module_gaas)  
**Type**: `function`  
<a name="module_gaas..listCallback"></a>
##callback: gaas~listCallback
**Params**

- err `object` - if(err), error  
- projects `Object.<string, Project>` - map from project ID to project object  

**Scope**: inner typedef of [gaas](#module_gaas)  
**Type**: `function`  
<a name="module_gaas..Client"></a>
##class: gaas~Client
**Members**

* [class: gaas~Client](#module_gaas..Client)
  * [client.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
  * [client.ping(args, cb)](#module_gaas..Client#ping)
  * [client.project(projectID, props)](#module_gaas..Client#project)
  * [client.listProjects(args)](#module_gaas..Client#listProjects)

<a name="module_gaas..Client#supportedTranslations"></a>
###client.supportedTranslations(args, cb)
This function returns a map from source language(s) to target language(s).

**Params**

- args `object`  
- cb `supportedTranslationsCallback`  

<a name="module_gaas..Client#ping"></a>
###client.ping(args, cb)
Do we have access to the server?

**Params**

- args `object` - (ignored)  
- cb `callback`  

<a name="module_gaas..Client#project"></a>
###client.project(projectID, props)
Create a new Project object for further access.Note that this function doesn't create the project or fetch any information.

**Params**

- projectID `string`  
- props `object` - optional properties to set on the object  

<a name="module_gaas..Client#listProjects"></a>
###client.listProjects(args)
List the projects available

**Params**

- args `object` - currently not used  

<a name="module_gaas..ResourceData"></a>
##class: gaas~ResourceData
**Members**

* [class: gaas~ResourceData](#module_gaas..ResourceData)

<a name="module_gaas..ResourceEntry"></a>
##class: gaas~ResourceEntry
**Members**

* [class: gaas~ResourceEntry](#module_gaas..ResourceEntry)

<a name="module_gaas..Project"></a>
##class: gaas~Project
**Members**

* [class: gaas~Project](#module_gaas..Project)
  * [project.create(args, cb)](#module_gaas..Project#create)
  * [project.remove(args, cb)](#module_gaas..Project#remove)
  * [project.getInfo()](#module_gaas..Project#getInfo)
  * [project.addTargetLanguages(args, cb)](#module_gaas..Project#addTargetLanguages)
  * [project.getResourceData(args, cb)](#module_gaas..Project#getResourceData)
  * [project.updateResourceData(args, cb)](#module_gaas..Project#updateResourceData)
  * [project.deleteLanguage(args, cb)](#module_gaas..Project#deleteLanguage)
  * [project.getResourceEntry(args, cb)](#module_gaas..Project#getResourceEntry)

<a name="module_gaas..Project#create"></a>
###project.create(args, cb)
Create the project

**Params**

- args `object` - parameters for creation  
  - sourceLanguage `string` - BCP47 langauge tag of translation source  
  - targetLanguages `Array.<string>` - optional array of BCP47 language tags for translation target  
- cb `basicCallback`  

<a name="module_gaas..Project#remove"></a>
###project.remove(args, cb)
Remove the project

**Params**

- args `object` - (ignored)  
- cb `basicCallback`  

<a name="module_gaas..Project#getInfo"></a>
###project.getInfo()
Fetch project information. The callback is givena new Project object with updated information.

<a name="module_gaas..Project#addTargetLanguages"></a>
###project.addTargetLanguages(args, cb)
Add target languages to the project

**Params**

- args `object`  
  - newTargetLanguages `Array.<string>` - array of 1 or more languages to add  
- cb `basicCallback`  

<a name="module_gaas..Project#getResourceData"></a>
###project.getResourceData(args, cb)
Get resourcedata for one language

**Params**

- args `object`  
  - languageID `string` - which BCP47 language to get info for  
- cb `resourceCallback`  

<a name="module_gaas..Project#updateResourceData"></a>
###project.updateResourceData(args, cb)
Update resource data and/or retry translation

**Params**

- args `object`  
  - languageID `string` - language to update (source or target)  
  - body `object`  
  - replace `boolean` - if true, replace ALL resource keys instead of just appending  
  - retry `boolean` - if true, retry translation  
  - data `Object.<string, string>` - key/value pairs to update  
- cb `basicCallback`  

<a name="module_gaas..Project#deleteLanguage"></a>
###project.deleteLanguage(args, cb)
Delete a target language from the project.(Source languages cannot be deleted)

**Params**

- args `object`  
  - languageID `string` - BCP47 id of language to delete  
- cb `basicCallback`  

<a name="module_gaas..Project#getResourceEntry"></a>
###project.getResourceEntry(args, cb)
Get a single ResourceEntry

**Params**

- args `object`  
  - languageID `string` - langauge name to fetch  
  - resKey `string` - key name to fetch  
- cb `entryCallback`  



*docs autogenerated via [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)*


LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)
