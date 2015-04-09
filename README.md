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
**Author**: Steven R. Loomis  
**Members**

* [gaas](#module_gaas)
  * [class: gaas~Client](#module_gaas..Client)
    * [client.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
    * [client.ping(args, cb)](#module_gaas..Client#ping)
    * [client.project(projectID, props)](#module_gaas..Client#project)
    * [client.listProjects(params)](#module_gaas..Client#listProjects)
  * [class: gaas~Project](#module_gaas..Project)
    * [project.create()](#module_gaas..Project#create)
    * [project.remove()](#module_gaas..Project#remove)
    * [project.getInfo()](#module_gaas..Project#getInfo)

<a name="module_gaas..Client"></a>
####class: gaas~Client
**Members**

* [class: gaas~Client](#module_gaas..Client)
  * [client.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
  * [client.ping(args, cb)](#module_gaas..Client#ping)
  * [client.project(projectID, props)](#module_gaas..Client#project)
  * [client.listProjects(params)](#module_gaas..Client#listProjects)

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
Create a new Project object for further access.Note that this function doesn't create teh project or fetch any information.

**Params**

- projectID `string`  
- props `object` - optional properties to set on the object  

<a name="module_gaas..Client#listProjects"></a>
#####client.listProjects(params)
List the projects available

**Params**

- params `object` - currently not used  

<a name="module_gaas..Project"></a>
####class: gaas~Project
**Members**

* [class: gaas~Project](#module_gaas..Project)
  * [project.create()](#module_gaas..Project#create)
  * [project.remove()](#module_gaas..Project#remove)
  * [project.getInfo()](#module_gaas..Project#getInfo)

<a name="module_gaas..Project#create"></a>
#####project.create()
Create the project

<a name="module_gaas..Project#remove"></a>
#####project.remove()
Remove the project

<a name="module_gaas..Project#getInfo"></a>
#####project.getInfo()
Get project info


  

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
