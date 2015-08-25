JavaScript Client for Globalization Pipeline
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
 
 
 DON’T EDIT README.md <<<<<<<<<<<< <<<<<<<<<<<<<<<<<<<<<<< THIS MEANS YOU!
 
    Edit `template-README.md` and run `npm run docs`
 
-->

# WORK IN PROGRESS

This code is being updated for the "Beta" (v2 API) version.
It will very shortly not function with the "Experimental" (v1 API) version.

Much of the text will need to be updated.

# HOW TO USE THIS TO TEST GAAS-SERVICES (rest)

* create `local-test.properties` with the following lines:

    # Set the admin ID and password as appropriate
    GAAS_ADMIN_ID=......
    GAAS_ADMIN_PASSWORD=......
    # the server URL to use. Adjust to taste. Include trailing slash.
    GAAS_API_URL=http://localhost:9080/translate

* install [node](http://nodejs.org)
* `npm install`
* `npm test`

-----

# What is this?

This is a JavaScript client and sample code for the
IBM [Globalization Pipeline](https://www.ng.bluemix.net/docs/#services/Globalization/index.html#globalization)
Bluemix service. The Globalization Pipeline service makes it easy for you to provide your global customers
with Bluemix applications translated into the languages in which they work.

Using the client code in this project, either from node.js, or from any browser using the jQuery sample
code, your application can dynamically request translations of your application content
from the IBM Globalization service.

# jQuery Sample

There is an experimental sample showing use of the use in the `jquery-sample` directory.
See the [Readme](./jquery-sample/README.md) in that directory for more details.

# Node.js

The rest of this document explains how to use the Globalization service
with the [node.js](http://nodejs.org) client.

For a working Bluemix application sample,
see [gaas-nodejs-hello](https://github.com/IBM-Bluemix/gaas-nodejs-hello).

## Quickstart - Bluemix

Add `gaas` to your project, as well as `cfenv`.

    npm install --save gaas cfenv

Load the gaas client object as follows (using [cfenv](https://www.npmjs.com/package/cfenv) ).
Note that `/IBM Globalization.*/` will match any service *named* with something starting
with `IBM Globalization` (the default). 

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

APIs return promises, unless a callback is provided.

NOTE: The non-promise API is deprecated and will be removed before Beta (as soon
as the test code can be removed)

APIs which take a callback use this pattern:

`obj.function( { /*params*/ } ,  function callback(err, ...))`

* params: an object containing input parameters, if needed.
* `err`: if truthy, indicates an error has occured.
* `...`: other parameters (optionally)

All language identifiers are [IETF BCP47](http://tools.ietf.org/html/bcp47) codes.

API reference
===
<a name="module_gaas"></a>
#gaas
**Author**: Steven R. Loomis  
**Members**

* [gaas](#module_gaas)
  * [class: gaas~Client](#module_gaas..Client)
    * [client.ping](#module_gaas..Client#ping)
    * [client.apis()](#module_gaas..Client#apis)
    * [client.ready(arg, cb)](#module_gaas..Client#ready)
    * [client.restCall(fn, restArg)](#module_gaas..Client#restCall)
    * [client.getServiceInstance(opts)](#module_gaas..Client#getServiceInstance)
    * [client.getBundleList(opts, cb)](#module_gaas..Client#getBundleList)
    * [client.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
    * [client.getServiceInfo(args, cb)](#module_gaas..Client#getServiceInfo)
    * [client.bundle(opts)](#module_gaas..Client#bundle)
  * [class: gaas~Bundle](#module_gaas..Bundle)
    * [new gaas~Bundle(gaas, props)](#new_module_gaas..Bundle)
    * [bundle.getInfoFields](#module_gaas..Bundle#getInfoFields)
    * [bundle.delete()](#module_gaas..Bundle#delete)
    * [bundle.create(body)](#module_gaas..Bundle#create)
    * [bundle.getInfo(opts)](#module_gaas..Bundle#getInfo)

<a name="module_gaas..Client"></a>
##class: gaas~Client
**Members**

* [class: gaas~Client](#module_gaas..Client)
  * [client.ping](#module_gaas..Client#ping)
  * [client.apis()](#module_gaas..Client#apis)
  * [client.ready(arg, cb)](#module_gaas..Client#ready)
  * [client.restCall(fn, restArg)](#module_gaas..Client#restCall)
  * [client.getServiceInstance(opts)](#module_gaas..Client#getServiceInstance)
  * [client.getBundleList(opts, cb)](#module_gaas..Client#getBundleList)
  * [client.supportedTranslations(args, cb)](#module_gaas..Client#supportedTranslations)
  * [client.getServiceInfo(args, cb)](#module_gaas..Client#getServiceInfo)
  * [client.bundle(opts)](#module_gaas..Client#bundle)

<a name="module_gaas..Client#ping"></a>
###client.ping
Do we have access to the server?

**Params**

- args `object` - (ignored)  
- cb `callback` - if omitted, a promise is returned  

**Returns**: `Promise`  
<a name="module_gaas..Client#apis"></a>
###client.apis()
Get the REST APIs. Use with ready()

**Returns**: `Object` - - Map of API operations, otherwise null if not ready.  
<a name="module_gaas..Client#ready"></a>
###client.ready(arg, cb)
Verify that the client is ready before proceeding.

**Params**

- arg `Object` - arg option, passed to cb on success or failure  
- cb `function` - callback (called with (null, arg, apis) on success  

<a name="module_gaas..Client#restCall"></a>
###client.restCall(fn, restArg)
Call a REST function. Verify the results.cb is called with the same context.This is designed for internal implementation.

**Params**

- fn `Array` - function name, such as ["admin","getServiceInfo"]  
- restArg `Object` - args to the REST call  

**Returns**: `Promise`  
<a name="module_gaas..Client#getServiceInstance"></a>
###client.getServiceInstance(opts)
Get the serviceInstance id from a parameter or from the client's default.

**Params**

- opts `Object` - can be a map, or falsy.  
  - serviceInstance `String` - the service instance  

**Returns**: `String` - - the service instance ID if found  
<a name="module_gaas..Client#getBundleList"></a>
###client.getBundleList(opts, cb)
Get a list of the bundles

**Params**

- opts `Object`  
  - serviceInstance `String` - optional service instance  
- cb `basicCallback` - callback. If omitted, a promise is returned.  

**Returns**: `Promise`  
<a name="module_gaas..Client#supportedTranslations"></a>
###client.supportedTranslations(args, cb)
This function returns a map from source language(s) to target language(s).

**Params**

- args `object`  
- cb `supportedTranslationsCallback` - If omitted, a promise is returned.  

**Returns**: `Promise`  
<a name="module_gaas..Client#getServiceInfo"></a>
###client.getServiceInfo(args, cb)
Get information about this service

**Params**

- args `object`  
- cb `basicCallback` - If omitted, a promise is returned.  

**Returns**: `Promise`  
<a name="module_gaas..Client#bundle"></a>
###client.bundle(opts)
Create a bundle access object.This doesn’t create the bundle itself, just a lightweightaccessor object.

**Params**

- opts `Object` - String (id) or map {id: bundleId, serviceInstance: serviceInstanceId}  

**Returns**: `Bundle`  
<a name="module_gaas..Bundle"></a>
##class: gaas~Bundle
**Members**

* [class: gaas~Bundle](#module_gaas..Bundle)
  * [new gaas~Bundle(gaas, props)](#new_module_gaas..Bundle)
  * [bundle.getInfoFields](#module_gaas..Bundle#getInfoFields)
  * [bundle.delete()](#module_gaas..Bundle#delete)
  * [bundle.create(body)](#module_gaas..Bundle#create)
  * [bundle.getInfo(opts)](#module_gaas..Bundle#getInfo)

<a name="new_module_gaas..Bundle"></a>
###new gaas~Bundle(gaas, props)
**Params**

- gaas `Client` - parent GaaS client object  
- props `Object` - properties to inherit  

**Scope**: inner class of [gaas](#module_gaas)  
<a name="module_gaas..Bundle#getInfoFields"></a>
###bundle.getInfoFields
List of fields usable with Bundle.getInfo()

<a name="module_gaas..Bundle#delete"></a>
###bundle.delete()
**Returns**: `Promise`  
<a name="module_gaas..Bundle#create"></a>
###bundle.create(body)
**Params**

- body `Object` - see API docs  

**Returns**: `Promise`  
<a name="module_gaas..Bundle#getInfo"></a>
###bundle.getInfo(opts)
Get bundle info

**Params**

- opts `Object` - Options object  
  - fields `String` - Comma separated list of fields  
  - translationStatusMetricsByLanguage `Boolean` - Optional field (false by default)  
  - reviewStatusMetricsByLanguage `Boolean` - Optional field (false by default)  
  - partnerStatusMetricsByLanguage `Boolean` - Optional field (false by default)  

**Returns**: `Promise`  


*docs autogenerated via [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)*


Support
===
You can post questions about using this service in the developerWorks Answers site
using the tag "[Globalization](https://developer.ibm.com/answers/topics/globalization/)".

LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)
