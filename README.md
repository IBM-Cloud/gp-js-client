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

# Node.js

Presently, the client is only available for [node.js](http://nodejs.org) client, but is expected to
support other JavaScript platforms, including browser frameworks.


## Node.js - using within Bluemix

Load the gaas client object as follows:

    var gaas = require('gaas')({ vcap: process.env.VCAP_SERVICES});
    
## Testing the API

This assumes you have a bound service in Bluemix named "IBM Globalization".
Running the test will create and delete various translation projects in your service!

View the VCAP credential information, and set it as a local parameter:

    set VCAP_SERVICES = { "IBM Globalization": [ { "name": "IBM Globalization", /* etc ....... */ } ]
    npm install
    npm test

Alternately,  the following variables affect the tests (and some sample code) if `VCAP_SERVICES` is not used:

* `GAAS_PROJECT` = project name to use
* `GAAS_API_KEY` = which api key to use
* `GAAS_API_URL` = URL of the endpoint. Should end with "/translate".


Initializing the client
==

Create the client object as below. The project can be set in the client object
to set a default project name for operations.


    var gaas = require('gaas')({
     url: 'https://<address of GaaS server>/translate',
     api: '<your API key>',
     project: '<your default project name>',
    });

If you have a service bound as the name `IBM Globalization`,
you can use this to fetch credentials from VCAP:

``` js
var gaas = require('gaas');
var gaasClient = gaas.getClient({ vcap: process.env.VCAP_SERVICES, project: 'MyProject'});
```

Using APIs
==

Many of the APIs have this pattern:

`obj.function( { /*params*/ } ,  function callback(err, results...))`

* `err`, if truthy, indicates an error has occured.
* Usually `results` is a single object.

All language ids are IETF BCP47 codes.

API reference
===
**Author**: Steven R. Loomis  
**Members**

* [gaas](#module_gaas)
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
    * [project.updateResourceData(args, {boo, cb)](#module_gaas..Project#updateResourceData)
    * [project.deleteLanguage(args, cb)](#module_gaas..Project#deleteLanguage)
    * [project.getResourceEntry(args, cb)](#module_gaas..Project#getResourceEntry)

<a name="module_gaas..Client"></a>
####class: gaas~Client
**Members**

* [class: gaas~Client](#module_gaas..Client)
  * [client.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
  * [client.ping(args, cb)](#module_gaas..Client#ping)
  * [client.project(projectID, props)](#module_gaas..Client#project)
  * [client.listProjects(args)](#module_gaas..Client#listProjects)

<a name="module_gaas..Client#supportedTranslations"></a>
#####client.supportedTranslations(args, cb)
This function returns a map from source language(s) to target language(s).

**Params**

- args `object`  
- cb <code>[supportedTranslationsCallback](#supportedTranslationsCallback)</code>  

<a name="module_gaas..Client#ping"></a>
#####client.ping(args, cb)
Do we have access to the server?

**Params**

- args `object` - (ignored)  
- cb `callback`  

<a name="module_gaas..Client#project"></a>
#####client.project(projectID, props)
Create a new Project object for further access.Note that this function doesn't create the project or fetch any information.

**Params**

- projectID `string`  
- props `object` - optional properties to set on the object  

<a name="module_gaas..Client#listProjects"></a>
#####client.listProjects(args)
List the projects available

**Params**

- args `object` - currently not used  

<a name="module_gaas..ResourceData"></a>
####class: gaas~ResourceData
**Members**

* [class: gaas~ResourceData](#module_gaas..ResourceData)

<a name="module_gaas..ResourceEntry"></a>
####class: gaas~ResourceEntry
**Members**

* [class: gaas~ResourceEntry](#module_gaas..ResourceEntry)

<a name="module_gaas..Project"></a>
####class: gaas~Project
**Members**

* [class: gaas~Project](#module_gaas..Project)
  * [project.create(args, cb)](#module_gaas..Project#create)
  * [project.remove(args, cb)](#module_gaas..Project#remove)
  * [project.getInfo()](#module_gaas..Project#getInfo)
  * [project.addTargetLanguages(args, cb)](#module_gaas..Project#addTargetLanguages)
  * [project.getResourceData(args, cb)](#module_gaas..Project#getResourceData)
  * [project.updateResourceData(args, {boo, cb)](#module_gaas..Project#updateResourceData)
  * [project.deleteLanguage(args, cb)](#module_gaas..Project#deleteLanguage)
  * [project.getResourceEntry(args, cb)](#module_gaas..Project#getResourceEntry)

<a name="module_gaas..Project#create"></a>
#####project.create(args, cb)
Create the project

**Params**

- args `object` - parameters for creation  
  - sourceLanguage `string` - BCP47 langauge tag of translation source  
  - targetLanguages `Array.<string>` - optional array of BCP47 language tags for translation target  
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#remove"></a>
#####project.remove(args, cb)
Remove the project

**Params**

- args `object` - (ignored)  
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#getInfo"></a>
#####project.getInfo()
Fetch project information. The callback is givena new Project object with updated information.

<a name="module_gaas..Project#addTargetLanguages"></a>
#####project.addTargetLanguages(args, cb)
Add target languages to the project

**Params**

- args `object`  
  - newTargetLanguages `Array.<string>` - array of 1 or more languages to add  
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#getResourceData"></a>
#####project.getResourceData(args, cb)
Get resourcedata for one language

**Params**

- args `object`  
  - replace `boolean` - if true, replace ALL resource keys instead of just appending  
  - retry `boolean` - if true, retry translation  
  - languageID `string` - which BCP47 language to get info for  
- cb <code>[resourceCallback](#resourceCallback)</code>  

<a name="module_gaas..Project#updateResourceData"></a>
#####project.updateResourceData(args, {boo, cb)
Update resource data and/or retry translation

**Params**

- args `object`  
  - langaugeID `string` - langauge to update (source or target)  
- {boo   
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#deleteLanguage"></a>
#####project.deleteLanguage(args, cb)
Delete a target language from the project.(Source languages cannot be deleted)

**Params**

- args `object`  
  - languageID `string` - BCP47 id of language to delete  
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#getResourceEntry"></a>
#####project.getResourceEntry(args, cb)
Get a single ResourceEntry

**Params**

- args `object`  
  - languageID `string` - langauge name to fetch  
  - resKey `string` - key name to fetch  
- cb `entryCallback`  

<a name="module_gaas..Client"></a>
####class: gaas~Client
**Members**

* [class: gaas~Client](#module_gaas..Client)
  * [client.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
  * [client.ping(args, cb)](#module_gaas..Client#ping)
  * [client.project(projectID, props)](#module_gaas..Client#project)
  * [client.listProjects(args)](#module_gaas..Client#listProjects)

<a name="module_gaas..Client#supportedTranslations"></a>
#####client.supportedTranslations(args, cb)
This function returns a map from source language(s) to target language(s).

**Params**

- args `object`  
- cb <code>[supportedTranslationsCallback](#supportedTranslationsCallback)</code>  

<a name="module_gaas..Client#ping"></a>
#####client.ping(args, cb)
Do we have access to the server?

**Params**

- args `object` - (ignored)  
- cb `callback`  

<a name="module_gaas..Client#project"></a>
#####client.project(projectID, props)
Create a new Project object for further access.Note that this function doesn't create the project or fetch any information.

**Params**

- projectID `string`  
- props `object` - optional properties to set on the object  

<a name="module_gaas..Client#listProjects"></a>
#####client.listProjects(args)
List the projects available

**Params**

- args `object` - currently not used  

<a name="module_gaas..ResourceData"></a>
####class: gaas~ResourceData
**Members**

* [class: gaas~ResourceData](#module_gaas..ResourceData)

<a name="module_gaas..ResourceEntry"></a>
####class: gaas~ResourceEntry
**Members**

* [class: gaas~ResourceEntry](#module_gaas..ResourceEntry)

<a name="module_gaas..Project"></a>
####class: gaas~Project
**Members**

* [class: gaas~Project](#module_gaas..Project)
  * [project.create(args, cb)](#module_gaas..Project#create)
  * [project.remove(args, cb)](#module_gaas..Project#remove)
  * [project.getInfo()](#module_gaas..Project#getInfo)
  * [project.addTargetLanguages(args, cb)](#module_gaas..Project#addTargetLanguages)
  * [project.getResourceData(args, cb)](#module_gaas..Project#getResourceData)
  * [project.updateResourceData(args, {boo, cb)](#module_gaas..Project#updateResourceData)
  * [project.deleteLanguage(args, cb)](#module_gaas..Project#deleteLanguage)
  * [project.getResourceEntry(args, cb)](#module_gaas..Project#getResourceEntry)

<a name="module_gaas..Project#create"></a>
#####project.create(args, cb)
Create the project

**Params**

- args `object` - parameters for creation  
  - sourceLanguage `string` - BCP47 langauge tag of translation source  
  - targetLanguages `Array.<string>` - optional array of BCP47 language tags for translation target  
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#remove"></a>
#####project.remove(args, cb)
Remove the project

**Params**

- args `object` - (ignored)  
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#getInfo"></a>
#####project.getInfo()
Fetch project information. The callback is givena new Project object with updated information.

<a name="module_gaas..Project#addTargetLanguages"></a>
#####project.addTargetLanguages(args, cb)
Add target languages to the project

**Params**

- args `object`  
  - newTargetLanguages `Array.<string>` - array of 1 or more languages to add  
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#getResourceData"></a>
#####project.getResourceData(args, cb)
Get resourcedata for one language

**Params**

- args `object`  
  - replace `boolean` - if true, replace ALL resource keys instead of just appending  
  - retry `boolean` - if true, retry translation  
  - languageID `string` - which BCP47 language to get info for  
- cb <code>[resourceCallback](#resourceCallback)</code>  

<a name="module_gaas..Project#updateResourceData"></a>
#####project.updateResourceData(args, {boo, cb)
Update resource data and/or retry translation

**Params**

- args `object`  
  - langaugeID `string` - langauge to update (source or target)  
- {boo   
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#deleteLanguage"></a>
#####project.deleteLanguage(args, cb)
Delete a target language from the project.(Source languages cannot be deleted)

**Params**

- args `object`  
  - languageID `string` - BCP47 id of language to delete  
- cb <code>[basicCallback](#basicCallback)</code>  

<a name="module_gaas..Project#getResourceEntry"></a>
#####project.getResourceEntry(args, cb)
Get a single ResourceEntry

**Params**

- args `object`  
  - languageID `string` - langauge name to fetch  
  - resKey `string` - key name to fetch  
- cb `entryCallback`  

*docs autogenerated via [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)*

REST APIs
===

The `Client.rest_*` functions let you directly call the RESTful API.
These functions directly mirror the REST api on the Globalization service.

See the
[IBM Globalization](https://www.ng.bluemix.net/docs/#services/Globalization/index.html#globalization)
docs for the REST documention.

LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)
