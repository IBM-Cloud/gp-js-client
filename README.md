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

APIs which take a callback use this pattern:

`obj.function( { /*params*/ } ,  function callback(err, ...))`

* params: an object containing input parameters, if needed.
* `err`: if truthy, indicates an error has occured.
* `...`: other parameters (optionally)

All language identifiers are [IETF BCP47](http://tools.ietf.org/html/bcp47) codes.

API reference
===
<a name="module_gaas"></a>
## gaas
**Author:** Steven R. Loomis  

* [gaas](#module_gaas)
  * [~Client](#module_gaas..Client)
    * [.ping](#module_gaas..Client+ping) ⇒ <code>Promise</code>
    * [.apis()](#module_gaas..Client+apis) ⇒ <code>Object</code>
    * [.ready(arg, cb)](#module_gaas..Client+ready)
    * [.restCall(fn, restArg)](#module_gaas..Client+restCall) ⇒ <code>Promise</code>
    * [.getServiceInstance(opts)](#module_gaas..Client+getServiceInstance) ⇒ <code>String</code>
    * [.getBundleList(opts, cb)](#module_gaas..Client+getBundleList) ⇒ <code>Promise</code>
    * [.supportedTranslations(args, cb)](#module_gaas..Client+supportedTranslations) ⇒ <code>Promise</code>
    * [.getServiceInfo(args, cb)](#module_gaas..Client+getServiceInfo) ⇒ <code>Promise</code>

<a name="module_gaas..Client"></a>
### gaas~Client
**Kind**: inner class of <code>[gaas](#module_gaas)</code>  

* [~Client](#module_gaas..Client)
  * [.ping](#module_gaas..Client+ping) ⇒ <code>Promise</code>
  * [.apis()](#module_gaas..Client+apis) ⇒ <code>Object</code>
  * [.ready(arg, cb)](#module_gaas..Client+ready)
  * [.restCall(fn, restArg)](#module_gaas..Client+restCall) ⇒ <code>Promise</code>
  * [.getServiceInstance(opts)](#module_gaas..Client+getServiceInstance) ⇒ <code>String</code>
  * [.getBundleList(opts, cb)](#module_gaas..Client+getBundleList) ⇒ <code>Promise</code>
  * [.supportedTranslations(args, cb)](#module_gaas..Client+supportedTranslations) ⇒ <code>Promise</code>
  * [.getServiceInfo(args, cb)](#module_gaas..Client+getServiceInfo) ⇒ <code>Promise</code>

<a name="module_gaas..Client+ping"></a>
#### client.ping ⇒ <code>Promise</code>
Do we have access to the server?

**Kind**: instance property of <code>[Client](#module_gaas..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | (ignored) |
| cb | <code>callback</code> | if omitted, a promise is returned |

<a name="module_gaas..Client+apis"></a>
#### client.apis() ⇒ <code>Object</code>
Get the REST APIs. Use with ready()

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  
**Returns**: <code>Object</code> - - Map of API operations, otherwise null if not ready.  
<a name="module_gaas..Client+ready"></a>
#### client.ready(arg, cb)
Verify that the client is ready before proceeding.

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| arg | <code>Object</code> | arg option, passed to cb on success or failure |
| cb | <code>function</code> | callback (called with (null, arg, apis) on success |

<a name="module_gaas..Client+restCall"></a>
#### client.restCall(fn, restArg) ⇒ <code>Promise</code>
Call a REST function. Verify the results.
cb is called with the same context.

This is designed for internal implementation.

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>Array</code> | function name, such as ["admin","getServiceInfo"] |
| restArg | <code>Object</code> | args to the REST call |

<a name="module_gaas..Client+getServiceInstance"></a>
#### client.getServiceInstance(opts) ⇒ <code>String</code>
Get the serviceInstance id from a parameter or from the 
client's default.

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  
**Returns**: <code>String</code> - - the service instance ID if found  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | can be a map, or falsy. |
| opts.serviceInstance | <code>String</code> | the service instance |

<a name="module_gaas..Client+getBundleList"></a>
#### client.getBundleList(opts, cb) ⇒ <code>Promise</code>
Get a list of the bundles

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> |  |
| opts.serviceInstance | <code>String</code> | optional service instance |
| cb | <code>basicCallback</code> | callback. If omitted, a promise is returned. |

<a name="module_gaas..Client+supportedTranslations"></a>
#### client.supportedTranslations(args, cb) ⇒ <code>Promise</code>
This function returns a map from source language(s) to target language(s).

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> |  |
| cb | <code>supportedTranslationsCallback</code> | If omitted, a promise is returned. |

<a name="module_gaas..Client+getServiceInfo"></a>
#### client.getServiceInfo(args, cb) ⇒ <code>Promise</code>
Get information about this service

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> |  |
| cb | <code>basicCallback</code> | If omitted, a promise is returned. |


*docs autogenerated via [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)*


Support
===
You can post questions about using this service in the developerWorks Answers site
using the tag "[Globalization](https://developer.ibm.com/answers/topics/globalization/)".

LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)
