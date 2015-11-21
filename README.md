Globalization Pipeline client
=============================

This is a JavaScript SDK for the
[Globalization Pipeline](https://www.ng.bluemix.net/docs/#services/Globalization/index.html#globalization)
Bluemix service. The Globalization Pipeline service makes it easy for you to provide your global customers
with Bluemix applications translated into the languages in which they work.

The SDK currently supports Node.js.

Node.js
-------

The remainder of this document explains how to use the Globalization service
with the [Node.js](http://nodejs.org) client.

For a working Bluemix application sample,
see [gp-nodejs-sample](https://github.com/IBM-Bluemix/gp-nodejs-sample).

[![npm version](https://badge.fury.io/js/g11n-pipeline.svg)](https://badge.fury.io/js/g11n-pipeline)

## Quickstart - Bluemix

Add `g11n-pipeline` to your project, as well as `cfenv`.

    npm install --save g11n-pipeline cfenv

Load the gaas client object as follows (using [cfenv](https://www.npmjs.com/package/cfenv) ).

    var appEnv = require('cfenv').getAppEnv();
    var gpClient = require('g11n-pipeline').getClient({
       appEnv: appEnv
    });
    
## Using

To fetch the strings for a bundle named "hello", first create a bundle accessor:

    var mybundle = gpClient.bundle('hello');

Then, call the `getStrings` function with a callback:

    mybundle.getStrings({ languageId: 'es'}, function (err, result) {
        if (err) {
            // handle err..
            console.error(err);
        } else {
            var myStrings = result.resourceStrings;
            console.dir(myStrings);
        }
    });

This code snippet will output the translated strings such as the following:

    {
        hello:   '¡Hola!',
        goodbye: '¡Adiós!',
        …
    }

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

    return Q.ninvoke(bundle, "delete", {});
    return Q.ninvoke(gpClient, "getBundleList", {});

Also, note that there are aliases from the swagger doc function names
to the convenience name. For example, `bundle.uploadResourceStrings` can be 
used in place of `bundle.uploadStrings`.

All language identifiers are [IETF BCP47](http://tools.ietf.org/html/bcp47) codes.

API reference
===
**Author:** Steven R. Loomis  

* [g11n-pipeline](#module_g11n-pipeline)
  * _static_
    * [.serviceRegex](#module_g11n-pipeline.serviceRegex)
    * [.exampleCredentials](#module_g11n-pipeline.exampleCredentials)
  * _inner_
    * [~Client](#module_g11n-pipeline..Client)
      * [.ping](#module_g11n-pipeline..Client+ping)
      * [.getBundleList(opts, cb)](#module_g11n-pipeline..Client+getBundleList)
      * [.supportedTranslations(args, cb)](#module_g11n-pipeline..Client+supportedTranslations)
      * [.getServiceInfo(args, cb)](#module_g11n-pipeline..Client+getServiceInfo)
      * [.createUser(args, cb)](#module_g11n-pipeline..Client+createUser)
      * [.deleteUser(args, cb)](#module_g11n-pipeline..Client+deleteUser)
      * [.bundle(opts)](#module_g11n-pipeline..Client+bundle) ⇒ <code>Bundle</code>
    * [~Bundle](#module_g11n-pipeline..Bundle)
      * [new Bundle(gp, props)](#new_module_g11n-pipeline..Bundle_new)
      * [.getInfoFields](#module_g11n-pipeline..Bundle+getInfoFields)
      * [.delete(opts, cb)](#module_g11n-pipeline..Bundle+delete)
      * [.create(body, cb)](#module_g11n-pipeline..Bundle+create)
      * [.getInfo(opts, cb)](#module_g11n-pipeline..Bundle+getInfo)
      * [.getStrings(opts, cb)](#module_g11n-pipeline..Bundle+getStrings)
      * [.getEntryInfo(opts, cb)](#module_g11n-pipeline..Bundle+getEntryInfo)
      * [.uploadStrings(opts, cb)](#module_g11n-pipeline..Bundle+uploadStrings)
      * [.update(opts, cb)](#module_g11n-pipeline..Bundle+update)
      * [.updateStrings(opts, cb)](#module_g11n-pipeline..Bundle+updateStrings)
      * [.updateEntryInfo(opts, cb)](#module_g11n-pipeline..Bundle+updateEntryInfo)
    * [~getClient(params)](#module_g11n-pipeline..getClient) ⇒ <code>Client</code>

<a name="module_g11n-pipeline.serviceRegex"></a>
### g11n-pipeline.serviceRegex
a Regex for matching the service.
Usage: var credentials = require('cfEnv')
     .getAppEnv().getServiceCreds(gp.serviceRegex);

**Kind**: static property of <code>[g11n-pipeline](#module_g11n-pipeline)</code>  
**Properties**

| Name |
| --- |
| serviceRegex | 

<a name="module_g11n-pipeline.exampleCredentials"></a>
### g11n-pipeline.exampleCredentials
Example credentials

**Kind**: static property of <code>[g11n-pipeline](#module_g11n-pipeline)</code>  
**Properties**

| Name |
| --- |
| exampleCredentials | 

<a name="module_g11n-pipeline..Client"></a>
### g11n-pipeline~Client
**Kind**: inner class of <code>[g11n-pipeline](#module_g11n-pipeline)</code>  

  * [~Client](#module_g11n-pipeline..Client)
    * [.ping](#module_g11n-pipeline..Client+ping)
    * [.getBundleList(opts, cb)](#module_g11n-pipeline..Client+getBundleList)
    * [.supportedTranslations(args, cb)](#module_g11n-pipeline..Client+supportedTranslations)
    * [.getServiceInfo(args, cb)](#module_g11n-pipeline..Client+getServiceInfo)
    * [.createUser(args, cb)](#module_g11n-pipeline..Client+createUser)
    * [.deleteUser(args, cb)](#module_g11n-pipeline..Client+deleteUser)
    * [.bundle(opts)](#module_g11n-pipeline..Client+bundle) ⇒ <code>Bundle</code>

<a name="module_g11n-pipeline..Client+ping"></a>
#### client.ping
Do we have access to the server?

**Kind**: instance property of <code>[Client](#module_g11n-pipeline..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | (ignored) |
| cb | <code>callback</code> |  |

<a name="module_g11n-pipeline..Client+getBundleList"></a>
#### client.getBundleList(opts, cb)
Get a list of the bundles.
Note: This function may be deprecated soon, but won't be removed.

**Kind**: instance method of <code>[Client](#module_g11n-pipeline..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> |  |
| opts.serviceInstance | <code>String</code> | optional service instance |
| cb | <code>[bundleListCallback](#Client..bundleListCallback)</code> | callback: (err, array-of-ids) |

<a name="module_g11n-pipeline..Client+supportedTranslations"></a>
#### client.supportedTranslations(args, cb)
This function returns a map from source language(s) to target language(s).

**Kind**: instance method of <code>[Client](#module_g11n-pipeline..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> |  |
| cb | <code>supportedTranslationsCallback</code> | (err, map-of-languages) |

<a name="module_g11n-pipeline..Client+getServiceInfo"></a>
#### client.getServiceInfo(args, cb)
Get information about this service

**Kind**: instance method of <code>[Client](#module_g11n-pipeline..Client)</code>  

| Param | Type |
| --- | --- |
| args | <code>object</code> | 
| cb | <code>basicCallback</code> | 

<a name="module_g11n-pipeline..Client+createUser"></a>
#### client.createUser(args, cb)
Create a user
Note: This function may be deprecated soon, but won't be removed.

**Kind**: instance method of <code>[Client](#module_g11n-pipeline..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> |  |
| args.type | <code>string</code> | User type (ADMINISTRATOR, TRANSLATOR, or READER) |
| args.displayName | <code>string</code> | Optional display name for the user. This can be any string. |
| args.comment | <code>string</code> | Optional comment |
| args.bundles | <code>Array</code> | set of accessible bundle ids or ['*'] to mean “all bundles” |
| args.metadata | <code>Object</code> | optional key/value pairs for user metadata |
| args.externalId | <code>string</code> | optional external user ID for your application’s use |
| cb | <code>basicCallback</code> |  |

<a name="module_g11n-pipeline..Client+deleteUser"></a>
#### client.deleteUser(args, cb)
Delete a user.
Note: This function may be deprecated soon, but won't be removed.

**Kind**: instance method of <code>[Client](#module_g11n-pipeline..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | TBD |
| args.userId | <code>string</code> | user ID to be deleted. |
| cb | <code>basicCallback</code> |  |

<a name="module_g11n-pipeline..Client+bundle"></a>
#### client.bundle(opts) ⇒ <code>Bundle</code>
Create a bundle access object.
This doesn’t create the bundle itself, just a handle object.
Call create() on the bundle to create it.

**Kind**: instance method of <code>[Client](#module_g11n-pipeline..Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | String (id) or map {id: bundleId, serviceInstance: serviceInstanceId} |

<a name="module_g11n-pipeline..Bundle"></a>
### g11n-pipeline~Bundle
**Kind**: inner class of <code>[g11n-pipeline](#module_g11n-pipeline)</code>  

  * [~Bundle](#module_g11n-pipeline..Bundle)
    * [new Bundle(gp, props)](#new_module_g11n-pipeline..Bundle_new)
    * [.getInfoFields](#module_g11n-pipeline..Bundle+getInfoFields)
    * [.delete(opts, cb)](#module_g11n-pipeline..Bundle+delete)
    * [.create(body, cb)](#module_g11n-pipeline..Bundle+create)
    * [.getInfo(opts, cb)](#module_g11n-pipeline..Bundle+getInfo)
    * [.getStrings(opts, cb)](#module_g11n-pipeline..Bundle+getStrings)
    * [.getEntryInfo(opts, cb)](#module_g11n-pipeline..Bundle+getEntryInfo)
    * [.uploadStrings(opts, cb)](#module_g11n-pipeline..Bundle+uploadStrings)
    * [.update(opts, cb)](#module_g11n-pipeline..Bundle+update)
    * [.updateStrings(opts, cb)](#module_g11n-pipeline..Bundle+updateStrings)
    * [.updateEntryInfo(opts, cb)](#module_g11n-pipeline..Bundle+updateEntryInfo)

<a name="new_module_g11n-pipeline..Bundle_new"></a>
#### new Bundle(gp, props)

| Param | Type | Description |
| --- | --- | --- |
| gp | <code>Client</code> | parent g11n-pipeline client object |
| props | <code>Object</code> | properties to inherit |

<a name="module_g11n-pipeline..Bundle+getInfoFields"></a>
#### bundle.getInfoFields
List of fields usable with Bundle.getInfo()

**Kind**: instance property of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  
<a name="module_g11n-pipeline..Bundle+delete"></a>
#### bundle.delete(opts, cb)
Delete this bundle.

**Kind**: instance method of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  

| Param | Type |
| --- | --- |
| opts | <code>Object</code> | 
| cb | <code>basicCallback</code> | 

<a name="module_g11n-pipeline..Bundle+create"></a>
#### bundle.create(body, cb)
Create this bundle.

**Kind**: instance method of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> | - |
| body.sourceLanguage | <code>string</code> | bcp47 id of source language such as 'en' |
| body.targetLanguages | <code>Array</code> | optional array of target languages |
| body.metadata | <code>Object</code> | optional metadata for the bundle |
| body.partner | <code>string</code> | optional ID of partner assigned to translate this bundle |
| cb | <code>basicCallback</code> |  |

<a name="module_g11n-pipeline..Bundle+getInfo"></a>
#### bundle.getInfo(opts, cb)
Get bundle info

**Kind**: instance method of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | Options object |
| opts.fields | <code>String</code> | Comma separated list of fields |
| opts.translationStatusMetricsByLanguage | <code>Boolean</code> | Optional field (false by default) |
| opts.reviewStatusMetricsByLanguage | <code>Boolean</code> | Optional field (false by default) |
| opts.partnerStatusMetricsByLanguage | <code>Boolean</code> | Optional field (false by default) |
| cb | <code>basicCallback</code> | callback (err, { updatedBy, updatedAt, sourceLanguage, targetLanguages, readOnly, metadata, partner} ) |

<a name="module_g11n-pipeline..Bundle+getStrings"></a>
#### bundle.getStrings(opts, cb)
Fetch one entry's strings

**Kind**: instance method of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language to fetch |
| opts.resourceKey | <code>String</code> | resource to fetch |
| cb | <code>basicCallback</code> | callback (err, { resourceStrings: { strings … } }) |

<a name="module_g11n-pipeline..Bundle+getEntryInfo"></a>
#### bundle.getEntryInfo(opts, cb)
Fetch one entry's info
Note: This function may be deprecated soon, but won't be removed.

**Kind**: instance method of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language to fetch |
| opts.resourceKey | <code>String</code> | resource to fetch |
| cb | <code>basicCallback</code> | callback (err, { resourceEntry: { updatedBy, updatedAt, value, sourceValue, reviewed, translationStatus, metadata, partnerStatus } }  ) |

<a name="module_g11n-pipeline..Bundle+uploadStrings"></a>
#### bundle.uploadStrings(opts, cb)
Upload resource strings, replacing all current contents for the language

**Kind**: instance method of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language to update |
| opts.strings | <code>Object.&lt;string, string&gt;</code> | strings to update |
| cb | <code>basicCallback</code> |  |

<a name="module_g11n-pipeline..Bundle+update"></a>
#### bundle.update(opts, cb)
**Kind**: instance method of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.targetLanguages | <code>array</code> | optional: list of target languages to update |
| opts.readOnly | <code>boolean</code> | optional: set this bundle to be readonly or not |
| opts.metadata | <code>object</code> | optional: metadata to update |
| opts.partner | <code>string</code> | optional: partner id to update |
| cb | <code>basicCallback</code> | callback |

<a name="module_g11n-pipeline..Bundle+updateStrings"></a>
#### bundle.updateStrings(opts, cb)
Update some strings in a language.

**Kind**: instance method of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.strings | <code>Object.&lt;string, string&gt;</code> | strings to update. |
| opts.resync | <code>Boolean</code> | optional: If true, resynchronize strings in the target language and resubmit previously-failing translation operations |
| cb | <code>basicCallback</code> |  |

<a name="module_g11n-pipeline..Bundle+updateEntryInfo"></a>
#### bundle.updateEntryInfo(opts, cb)
Note: This function may be deprecated soon, but won't be removed.

**Kind**: instance method of <code>[Bundle](#module_g11n-pipeline..Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.value | <code>string</code> | string value to update |
| opts.reviewed | <code>boolean</code> | optional boolean indicating if value was reviewed |
| opts.metadata | <code>object</code> | optional metadata to update |
| opts.partnerStatus | <code>string</code> | translation status maintained by partner |
| cb | <code>basicCallback</code> |  |

<a name="module_g11n-pipeline..getClient"></a>
### g11n-pipeline~getClient(params) ⇒ <code>Client</code>
Construct a g11n-pipeline client. 
params.credentials is required unless params.appEnv is supplied.

**Kind**: inner method of <code>[g11n-pipeline](#module_g11n-pipeline)</code>  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> | configuration params |
| params.appEnv | <code>Object</code> | pass the result of cfEnv.getAppEnv(). Ignored if params.credentials is supplied. |
| params.credentials | <code>Object.&lt;string, string&gt;</code> | Bound credentials as from the CF service broker (overrides appEnv) |
| params.credentials.url | <code>string</code> | service URL. (should end in '/translate') |
| params.credentials.userId | <code>string</code> | service API key. |
| params.credentials.password | <code>string</code> | service API key. |
| params.credentials.instanceId | <code>string</code> | instance ID |



*docs autogenerated via [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)*


Support
===
You can post questions about using this service in the developerWorks Answers site
using the tag "[globalization-pipeline](https://developer.ibm.com/answers/topics/globalization-pipeline
/)".

LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)

Copyright IBM Corp. 2015
