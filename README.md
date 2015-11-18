JavaScript Client for Globalization Pipeline on IBM Bluemix
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

# What is this?

This is a JavaScript SDK for the
[Globalization Pipeline](https://www.ng.bluemix.net/docs/#services/Globalization/index.html#globalization)
Bluemix service. The Globalization Pipeline service makes it easy for you to provide your global customers
with Bluemix applications translated into the languages in which they work.

The SDK currently supports Node.js, and also provides some sample code showing
how to use the service from jQuery.

# jQuery Sample

There is an experimental sample showing use of the use in the `jquery-sample` directory.
See the [Readme](./jquery-sample/README.md) in that directory for more details.

# Node.js

The remainder of this document explains how to use the Globalization service
with the [Node.js](http://nodejs.org) client.

For a working Bluemix application sample,
see [g11n-pipeline-nodejs-hello](https://github.com/IBM-Bluemix/g11n-pipeline-nodejs-hello).

## Quickstart - Bluemix

Add `g11n-pipeline` to your project, as well as `cfenv`.

    npm install --save g11n-pipeline cfenv

Load the gaas client object as follows (using [cfenv](https://www.npmjs.com/package/cfenv) ).

    var appEnv = require('cfenv').getAppEnv();
    var gpClient = require('g11n-pipeline').getClient({
       credentials:  appEnv.getService(/(gp-|g11n-pipeline).*/).credentials
    });

## Testing

See [TESTING.md](TESTING.md)

API convention
==

APIs take a callback and use this general pattern:

    gpClient.function( { /*params*/ } ,  function callback(err, ...))

* params: an object containing input parameters, if needed.
* `err`: if truthy, indicates an error has occured.
* `...`: other parameters (optional)

These APIs may be promisified easily using a library such as `Q`'s
[nfcall](http://documentup.com/kriskowal/q/#adapting-node):

    return Q.nfcall(gpClient.function, /*params…*/);

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
    * [.bundle(opts)](#module_gaas..Client+bundle) ⇒ <code>Bundle</code>
  * [~Bundle](#module_gaas..Bundle)
    * [new Bundle(gaas, props)](#new_module_gaas..Bundle_new)
    * [.getInfoFields](#module_gaas..Bundle+getInfoFields)
    * [.delete()](#module_gaas..Bundle+delete) ⇒ <code>Promise</code>
    * [.create(body)](#module_gaas..Bundle+create) ⇒ <code>Promise</code>
    * [.getInfo(opts)](#module_gaas..Bundle+getInfo) ⇒ <code>Promise</code>
    * [.getResourceStrings()](#module_gaas..Bundle+getResourceStrings)
    * [.uploadResourceStrings(opts)](#module_gaas..Bundle+uploadResourceStrings) ⇒ <code>Promise</code>

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
  * [.bundle(opts)](#module_gaas..Client+bundle) ⇒ <code>Bundle</code>

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

<a name="module_gaas..Client+bundle"></a>
#### client.bundle(opts) ⇒ <code>Bundle</code>
Create a bundle access object.
This doesn’t create the bundle itself, just a lightweight
accessor object.

**Kind**: instance method of <code>[Client](#module_gaas..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | String (id) or map {id: bundleId, serviceInstance: serviceInstanceId} |

<a name="module_gaas..Bundle"></a>
### gaas~Bundle
**Kind**: inner class of <code>[gaas](#module_gaas)</code>  

* [~Bundle](#module_gaas..Bundle)
  * [new Bundle(gaas, props)](#new_module_gaas..Bundle_new)
  * [.getInfoFields](#module_gaas..Bundle+getInfoFields)
  * [.delete()](#module_gaas..Bundle+delete) ⇒ <code>Promise</code>
  * [.create(body)](#module_gaas..Bundle+create) ⇒ <code>Promise</code>
  * [.getInfo(opts)](#module_gaas..Bundle+getInfo) ⇒ <code>Promise</code>
  * [.getResourceStrings()](#module_gaas..Bundle+getResourceStrings)
  * [.uploadResourceStrings(opts)](#module_gaas..Bundle+uploadResourceStrings) ⇒ <code>Promise</code>

<a name="new_module_gaas..Bundle_new"></a>
#### new Bundle(gaas, props)

| Param | Type | Description |
| --- | --- | --- |
| gaas | <code>Client</code> | parent GaaS client object |
| props | <code>Object</code> | properties to inherit |

<a name="module_gaas..Bundle+getInfoFields"></a>
#### bundle.getInfoFields
List of fields usable with Bundle.getInfo()

**Kind**: instance property of <code>[Bundle](#module_gaas..Bundle)</code>  
<a name="module_gaas..Bundle+delete"></a>
#### bundle.delete() ⇒ <code>Promise</code>
**Kind**: instance method of <code>[Bundle](#module_gaas..Bundle)</code>  
<a name="module_gaas..Bundle+create"></a>
#### bundle.create(body) ⇒ <code>Promise</code>
**Kind**: instance method of <code>[Bundle](#module_gaas..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> | see API docs |

<a name="module_gaas..Bundle+getInfo"></a>
#### bundle.getInfo(opts) ⇒ <code>Promise</code>
Get bundle info

**Kind**: instance method of <code>[Bundle](#module_gaas..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | Options object |
| opts.fields | <code>String</code> | Comma separated list of fields |
| opts.translationStatusMetricsByLanguage | <code>Boolean</code> | Optional field (false by default) |
| opts.reviewStatusMetricsByLanguage | <code>Boolean</code> | Optional field (false by default) |
| opts.partnerStatusMetricsByLanguage | <code>Boolean</code> | Optional field (false by default) |

<a name="module_gaas..Bundle+getResourceStrings"></a>
#### bundle.getResourceStrings()
Todo

**Kind**: instance method of <code>[Bundle](#module_gaas..Bundle)</code>  
<a name="module_gaas..Bundle+uploadResourceStrings"></a>
#### bundle.uploadResourceStrings(opts) ⇒ <code>Promise</code>
Upload some resource strings

**Kind**: instance method of <code>[Bundle](#module_gaas..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language to update |
| opts.strings | <code>Object</code> | strings to update |


*docs autogenerated via [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)*


Support
===
You can post questions about using this service in the developerWorks Answers site
using the tag "[Globalization](https://developer.ibm.com/answers/topics/globalization/)".

LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)
