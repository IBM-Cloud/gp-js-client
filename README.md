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

`obj.function( { /*params*/ } ,  onSuccess, onFailure)`

`onSuccess()` is given an object with various contents.

`onFailure()` is called with an error message if it is an error.


All language ids are IETF BCP47 codes.

API reference
===
  **Author:** Steven R. Loomis  

* [gaas](#module_gaas)
  * [~Client](#module_gaas..Client)
    * [.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
    * [.ping(args, cb)](#module_gaas..Client#ping)
    * [.project(projectID, props)](#module_gaas..Client#project)
    * [.listProjects(params)](#module_gaas..Client#listProjects)
  * [~Project](#module_gaas..Project)
    * [.create()](#module_gaas..Project#create)
    * [.remove()](#module_gaas..Project#remove)
    * [.getInfo()](#module_gaas..Project#getInfo)
  * [~supportedTranslationsCallback](#module_gaas..supportedTranslationsCallback) : <code>function</code>
  * [~listCallback](#module_gaas..listCallback) : <code>function</code>

<a name="module_gaas..Client"></a>
### gaas~Client
**Kind**: inner class of <code>[gaas](#module_gaas)</code>  

* [~Client](#module_gaas..Client)
  * [.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
  * [.ping(args, cb)](#module_gaas..Client#ping)
  * [.project(projectID, props)](#module_gaas..Client#project)
  * [.listProjects(params)](#module_gaas..Client#listProjects)

<a name="module_gaas..Client#supportedTranslations"></a>
#### client.supportedTranslations(args, cb)
This function returns a map from source language(s) to target language(s).

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  

| Param | Type |
| --- | --- |
| args | <code>object</code> | 
| cb | <code>supportedTranslationsCallback</code> | 

<a name="module_gaas..Client#ping"></a>
#### client.ping(args, cb)
Do we have access to the server?

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | (ignored) |
| cb | <code>callback</code> |  |

<a name="module_gaas..Client#project"></a>
#### client.project(projectID, props)
Create a new Project object for further access.Note that this function doesn't create teh project or fetch any information.

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| projectID | <code>string</code> |  |
| props | <code>object</code> | optional properties to set on the object |

<a name="module_gaas..Client#listProjects"></a>
#### client.listProjects(params)
List the projects available

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  
**Praram**: <code>listCallback</code>  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | currently not used |

<a name="module_gaas..Project"></a>
### gaas~Project
**Kind**: inner class of <code>[gaas](#module_gaas)</code>  

* [~Project](#module_gaas..Project)
  * [.create()](#module_gaas..Project#create)
  * [.remove()](#module_gaas..Project#remove)
  * [.getInfo()](#module_gaas..Project#getInfo)

<a name="module_gaas..Project#create"></a>
#### project.create()
Create the project

**Kind**: instance method of <code>[Project](#module_gaas..Project)</code>  
<a name="module_gaas..Project#remove"></a>
#### project.remove()
Remove the project

**Kind**: instance method of <code>[Project](#module_gaas..Project)</code>  
<a name="module_gaas..Project#getInfo"></a>
#### project.getInfo()
Get project info

**Kind**: instance method of <code>[Project](#module_gaas..Project)</code>  
<a name="module_gaas..supportedTranslationsCallback"></a>
### gaas~supportedTranslationsCallback : <code>function</code>
**Kind**: inner typedef of <code>[gaas](#module_gaas)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | if(err), error |
| translations | <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> | source : [target...] languages |

<a name="module_gaas..listCallback"></a>
### gaas~listCallback : <code>function</code>
**Kind**: inner typedef of <code>[gaas](#module_gaas)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | if(err), error |
| projects | <code>Object.&lt;string, Project&gt;</code> | map from project ID to project object |

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
