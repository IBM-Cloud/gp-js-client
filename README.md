Globalization Pipeline Client for JavaScript
============================================

This is the JavaScript SDK for the
[Globalization Pipeline](https://www.ng.bluemix.net/docs/#services/GlobalizationPipeline/index.html#globalization)
Bluemix service. 
The Globalization Pipeline service makes it easy for you to provide your global customers
with Bluemix applications translated into the languages in which they work. 
This SDK currently supports [Node.js](http://nodejs.org).

[![npm version](https://badge.fury.io/js/g11n-pipeline.svg)](https://badge.fury.io/js/g11n-pipeline)

## Sample

For a working Bluemix application sample,
see [gp-nodejs-sample](https://github.com/IBM-Bluemix/gp-nodejs-sample).

## Quickstart - Bluemix

Add `g11n-pipeline` to your project, as well as `cfenv` and `optional`.

    npm install --save g11n-pipeline cfenv optional

Load the client object as follows (using [cfenv](https://www.npmjs.com/package/cfenv) ).
You can store a copy of the credentials in `local-credentials.json` for local
operation.

```javascript
var optional = require('optional');
var appEnv = require('cfenv').getAppEnv();
var gpClient = require('g11n-pipeline').getClient(
  optional('./local-credentials.json')   // if it exists, use local-credentials.json
    || {appEnv: appEnv}                  // otherwise, the appEnv
);
```

## Using

To fetch the strings for a bundle named "hello", first create a bundle accessor:

```javascript
    var mybundle = gpClient.bundle('hello');
```

Then, call the `getStrings` function with a callback:

```javascript
    mybundle.getStrings({ languageId: 'es'}, function (err, result) {
        if (err) {
            // handle err..
            console.error(err);
        } else {
            var myStrings = result.resourceStrings;
            console.dir(myStrings);
        }
    });
```

This code snippet will output the translated strings such as the following:

```javascript
    {
        hello:   '¡Hola!',
        goodbye: '¡Adiós!',
        …
    }
```

### Async

Note that all calls that take a callback are asynchronous.
For example, the following code:

```javascript
var bundle = client.bundle('someBundle');
bundle.create({…}, function(…){…});
bundle.uploadStrings({…}, function(…){…});
```

…will fail, because the bundle `someBundle` hasn’t been `create`d by the time the
`uploadStrings` call is made. Instead, make the `uploadStrings` call within a callback:

```javascript
var bundle = client.bundle('someBundle');
bundle.create({…}, function(…){
    …
    bundle.uploadStrings({…}, function(…){…});
});
```

## Testing

See [TESTING.md](TESTING.md)

API convention
==

APIs take a callback and use this general pattern:

```javascript
    gpClient.function( { /*params*/ } ,  function callback(err, ...))
```

* params: an object containing input parameters, if needed.
* `err`: if truthy, indicates an error has occured.
* `...`: other parameters (optional)

These APIs may be promisified easily using a library such as `Q`'s
[nfcall](http://documentup.com/kriskowal/q/#adapting-node):

```javascript
    return Q.ninvoke(bundle, "delete", {});
    return Q.ninvoke(gpClient, "getBundleList", {});
```

Also, note that there are aliases from the swagger doc function names
to the convenience name. For example, `bundle.uploadResourceStrings` can be 
used in place of `bundle.uploadStrings`.

All language identifiers are [IETF BCP47](http://tools.ietf.org/html/bcp47) codes.

API reference
===

## Classes

<dl>
<dt><a href="#Client">Client</a></dt>
<dd></dd>
<dt><a href="#Bundle">Bundle</a></dt>
<dd></dd>
<dt><a href="#User">User</a></dt>
<dd></dd>
<dt><a href="#ResourceEntry">ResourceEntry</a></dt>
<dd><p>ResourceEntry
Creating this object does not modify any data.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#serviceRegex">serviceRegex</a></dt>
<dd><p>a Regex for matching the service.
Usage: var credentials = require(&#39;cfEnv&#39;)
     .getAppEnv().getServiceCreds(gp.serviceRegex);
(except that it needs to match by label)</p>
</dd>
<dt><a href="#exampleCredentials">exampleCredentials</a></dt>
<dd><p>Example credentials</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getClient">getClient(params)</a> ⇒ <code><a href="#Client">Client</a></code></dt>
<dd><p>Construct a g11n-pipeline client. 
params.credentials is required unless params.appEnv is supplied.</p>
</dd>
<dt><a href="#isMissingField">isMissingField(obj, fields)</a> ⇒</dt>
<dd><p>Return a list of missing fields. Special cases the instanceId field.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#basicCallback">basicCallback</a> : <code>function</code></dt>
<dd><p>Basic Callback used thr</p>
</dd>
</dl>

<a name="Client"></a>
## Client
**Kind**: global class  

* [Client](#Client)
    * [new Client()](#new_Client_new)
    * _instance_
        * [.version](#Client+version)
        * [.ping](#Client+ping)
        * [.supportedTranslations(args, cb)](#Client+supportedTranslations)
        * [.getServiceInfo(args, cb)](#Client+getServiceInfo)
        * [.createUser(args, cb)](#Client+createUser)
        * [.bundle(opts)](#Client+bundle) ⇒ <code>[Bundle](#Bundle)</code>
        * [.user(id)](#Client+user) ⇒ <code>[User](#User)</code>
        * [.users(opts, cb)](#Client+users)
        * [.bundles(opts, cb)](#Client+bundles)
    * _inner_
        * [~listUsersCallback](#Client..listUsersCallback) : <code>function</code>
        * [~listBundlesCallback](#Client..listBundlesCallback) : <code>function</code>

<a name="new_Client_new"></a>
### new Client()
Client object for Globalization Pipeline

<a name="Client+version"></a>
### client.version
Version number of the REST service used. Currently ‘V2’.

**Kind**: instance property of <code>[Client](#Client)</code>  
<a name="Client+ping"></a>
### client.ping
Do we have access to the server?

**Kind**: instance property of <code>[Client](#Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | (ignored) |
| cb | <code>callback</code> |  |

<a name="Client+supportedTranslations"></a>
### client.supportedTranslations(args, cb)
This function returns a map from source language(s) to target language(s).
Example: `{ en: ['de', 'ja']}` (English translates to German and Japanese.)

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> |  |
| cb | <code>supportedTranslationsCallback</code> | (err, map-of-languages) |

<a name="Client+getServiceInfo"></a>
### client.getServiceInfo(args, cb)
Get information about this service

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Type |
| --- | --- |
| args | <code>object</code> | 
| cb | <code>[basicCallback](#basicCallback)</code> | 

<a name="Client+createUser"></a>
### client.createUser(args, cb)
Create a user

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> |  |
| args.type | <code>string</code> | User type (ADMINISTRATOR, TRANSLATOR, or READER) |
| args.displayName | <code>string</code> | Optional display name for the user. This can be any string. |
| args.comment | <code>string</code> | Optional comment |
| args.bundles | <code>Array</code> | set of accessible bundle ids or ['*'] to mean “all bundles” |
| args.metadata | <code>Object</code> | optional key/value pairs for user metadata |
| args.externalId | <code>string</code> | optional external user ID for your application’s use |
| cb | <code>[basicCallback](#basicCallback)</code> | passed a new User object |

<a name="Client+bundle"></a>
### client.bundle(opts) ⇒ <code>[Bundle](#Bundle)</code>
Create a bundle access object.
This doesn’t create the bundle itself, just a handle object.
Call create() on the bundle to create it.

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | String (id) or map {id: bundleId, serviceInstance: serviceInstanceId} |

<a name="Client+user"></a>
### client.user(id) ⇒ <code>[User](#User)</code>
Create a user access object.
This doesn’t create the user itself,
nor query the server, but is just a handle object.
Use createUser() to create a user.

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Object</code> | String (id) or map {id: bundleId, serviceInstance: serviceInstanceId} |

<a name="Client+users"></a>
### client.users(opts, cb)
List users. Callback is called with an array of 
user access objects.

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | ignored |
| cb | <code>[listUsersCallback](#Client..listUsersCallback)</code> | callback |

<a name="Client+bundles"></a>
### client.bundles(opts, cb)
List bundles. Callback is called with an map of 
bundle access objects.

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | ignored |
| cb | <code>[listBundlesCallback](#Client..listBundlesCallback)</code> | given a map of Bundle objects |

<a name="Client..listUsersCallback"></a>
### Client~listUsersCallback : <code>function</code>
Called by users()

**Kind**: inner typedef of <code>[Client](#Client)</code>  
**See**: User  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| users | <code>Object.&lt;string, User&gt;</code> | map from user ID to User object |

<a name="Client..listBundlesCallback"></a>
### Client~listBundlesCallback : <code>function</code>
Bundle list callback

**Kind**: inner typedef of <code>[Client](#Client)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| bundles | <code>Object.&lt;string, Bundle&gt;</code> | map from bundle ID to Bundle object |

<a name="Bundle"></a>
## Bundle
**Kind**: global class  

* [Bundle](#Bundle)
    * [new Bundle(gp, props)](#new_Bundle_new)
    * [.getInfoFields](#Bundle+getInfoFields)
    * [.delete(opts, cb)](#Bundle+delete)
    * [.create(body, cb)](#Bundle+create)
    * [.getInfo(opts, cb)](#Bundle+getInfo)
    * [.getStrings(opts, cb)](#Bundle+getStrings)
    * [.entry(opts)](#Bundle+entry)
    * [.uploadStrings(opts, cb)](#Bundle+uploadStrings)
    * [.update(opts, cb)](#Bundle+update)
    * [.updateStrings(opts, cb)](#Bundle+updateStrings)

<a name="new_Bundle_new"></a>
### new Bundle(gp, props)

| Param | Type | Description |
| --- | --- | --- |
| gp | <code>[Client](#Client)</code> | parent g11n-pipeline client object |
| props | <code>Object</code> | properties to inherit |

<a name="Bundle+getInfoFields"></a>
### bundle.getInfoFields
List of fields usable with Bundle.getInfo()

**Kind**: instance property of <code>[Bundle](#Bundle)</code>  
<a name="Bundle+delete"></a>
### bundle.delete(opts, cb)
Delete this bundle.

**Kind**: instance method of <code>[Bundle](#Bundle)</code>  

| Param | Type |
| --- | --- |
| opts | <code>Object</code> | 
| cb | <code>[basicCallback](#basicCallback)</code> | 

<a name="Bundle+create"></a>
### bundle.create(body, cb)
Create this bundle with the specified params.
Note that on failure, such as an illegal language being specified,
the bundle is not created.

**Kind**: instance method of <code>[Bundle](#Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> |  |
| body.sourceLanguage | <code>string</code> | bcp47 id of source language such as 'en' |
| body.targetLanguages | <code>Array</code> | optional array of target languages |
| body.metadata | <code>Object</code> | optional metadata for the bundle |
| body.partner | <code>string</code> | optional ID of partner assigned to translate this bundle |
| cb | <code>[basicCallback](#basicCallback)</code> |  |

<a name="Bundle+getInfo"></a>
### bundle.getInfo(opts, cb)
Get bundle info

**Kind**: instance method of <code>[Bundle](#Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | Options object |
| opts.fields | <code>String</code> | Comma separated list of fields |
| opts.translationStatusMetricsByLanguage | <code>Boolean</code> | Optional field (false by default) |
| opts.reviewStatusMetricsByLanguage | <code>Boolean</code> | Optional field (false by default) |
| opts.partnerStatusMetricsByLanguage | <code>Boolean</code> | Optional field (false by default) |
| cb | <code>[basicCallback](#basicCallback)</code> | callback (err, { updatedBy, updatedAt, sourceLanguage, targetLanguages, readOnly, metadata, partner} ) |

<a name="Bundle+getStrings"></a>
### bundle.getStrings(opts, cb)
Fetch one language's strings

**Kind**: instance method of <code>[Bundle](#Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language to fetch |
| cb | <code>[basicCallback](#basicCallback)</code> | callback (err, { resourceStrings: { strings … } }) |

<a name="Bundle+entry"></a>
### bundle.entry(opts)
Create an entry object. Doesn't fetch data,

**Kind**: instance method of <code>[Bundle](#Bundle)</code>  
**See**: ResourceEntry~getInfo  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language |
| opts.resourceKey | <code>String</code> | resource key |

<a name="Bundle+uploadStrings"></a>
### bundle.uploadStrings(opts, cb)
Upload resource strings, replacing all current contents for the language

**Kind**: instance method of <code>[Bundle](#Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language to update |
| opts.strings | <code>Object.&lt;string, string&gt;</code> | strings to update |
| cb | <code>[basicCallback](#basicCallback)</code> |  |

<a name="Bundle+update"></a>
### bundle.update(opts, cb)
**Kind**: instance method of <code>[Bundle](#Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.targetLanguages | <code>array</code> | optional: list of target languages to update |
| opts.readOnly | <code>boolean</code> | optional: set this bundle to be readonly or not |
| opts.metadata | <code>object</code> | optional: metadata to update |
| opts.partner | <code>string</code> | optional: partner id to update |
| cb | <code>[basicCallback](#basicCallback)</code> | callback |

<a name="Bundle+updateStrings"></a>
### bundle.updateStrings(opts, cb)
Update some strings in a language.

**Kind**: instance method of <code>[Bundle](#Bundle)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.strings | <code>Object.&lt;string, string&gt;</code> | strings to update. |
| opts.resync | <code>Boolean</code> | optional: If true, resynchronize strings in the target language and resubmit previously-failing translation operations |
| cb | <code>[basicCallback](#basicCallback)</code> |  |

<a name="User"></a>
## User
**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | the userid |
| updatedBy | <code>String</code> | gives information about which user updated this user last |
| updatedAt | <code>Date</code> | the date when the item was updated |
| type | <code>String</code> | `ADMINISTRATOR`, `TRANSLATOR`, or `READER` |
| displayName | <code>String</code> | optional human friendly name |
| metadata | <code>Object.&lt;string, string&gt;</code> | optional user-defined data |
| serviceManaged | <code>Boolean</code> | if true, the GP service is managing this user |
| password | <code>String</code> | user password |
| comment | <code>String</code> | optional user comment |
| externalId | <code>String</code> | optional User ID used by another system associated with this user |
| bundles | <code>Array.&lt;string&gt;</code> | list of bundles managed by this user |


* [User](#User)
    * [new User(gp, props)](#new_User_new)
    * [.update(opts, cb)](#User+update)
    * [.delete(cb)](#User+delete)
    * [.getInfo(opts, cb)](#User+getInfo)

<a name="new_User_new"></a>
### new User(gp, props)

| Param | Type | Description |
| --- | --- | --- |
| gp | <code>[Client](#Client)</code> | parent g11n-pipeline client object |
| props | <code>Object</code> | properties to inherit |

<a name="User+update"></a>
### user.update(opts, cb)
Update this user. 
All fields of opts are optional. For strings, falsy = no change, empty string '' = deletion.

**Kind**: instance method of <code>[User](#User)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>object</code> | options |
| opts.displayName | <code>string</code> | User's display name - falsy = no change, empty string '' = deletion. |
| opts.comment | <code>string</code> | optional comment - falsy = no change, empty string '' = deletion. |
| opts.bundles | <code>Array.&lt;string&gt;</code> | Accessible bundle IDs. |
| opts.metadata | <code>object.&lt;string, string&gt;</code> | User defined user metadata containg key/value pairs.  Data will be merged in. Pass in "{}" to erase all metadata. |
| opts.externalId | <code>string</code> | User ID used by another system associated with this user - falsy = no change, empty string '' = deletion. |
| cb | <code>[basicCallback](#basicCallback)</code> | callback with success or failure |

<a name="User+delete"></a>
### user.delete(cb)
Delete this user. 
Note that the service managed user
(the initial users created by the service) may not be
 deleted.

**Kind**: instance method of <code>[User](#User)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>[basicCallback](#basicCallback)</code> | callback with success or failure |

<a name="User+getInfo"></a>
### user.getInfo(opts, cb)
Fetch user info.
The callback is given a new User instance, with
all properties filled in.

**Kind**: instance method of <code>[User](#User)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | optional, ignored |
| cb | <code>getUserCallback</code> |  |

<a name="ResourceEntry"></a>
## ResourceEntry
ResourceEntry
Creating this object does not modify any data.

**Kind**: global class  
**See**: Bundle~entries  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| resourceKey | <code>String</code> | key for the resource |


* [ResourceEntry](#ResourceEntry)
    * [new ResourceEntry(bundle, props)](#new_ResourceEntry_new)
    * [.getInfo(opts, cb)](#ResourceEntry+getInfo)
    * [.update()](#ResourceEntry+update)

<a name="new_ResourceEntry_new"></a>
### new ResourceEntry(bundle, props)

| Param | Type | Description |
| --- | --- | --- |
| bundle | <code>[Bundle](#Bundle)</code> | parent Bundle object |
| props | <code>Object</code> | properties to inherit |

<a name="ResourceEntry+getInfo"></a>
### resourceEntry.getInfo(opts, cb)
Load this entry's information. Callback is given
another ResourceEntry but one with all current data filled in.

**Kind**: instance method of <code>[ResourceEntry](#ResourceEntry)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options (currently ignored) |
| cb | <code>[basicCallback](#basicCallback)</code> | callback (err, ResourceEntry) |

<a name="ResourceEntry+update"></a>
### resourceEntry.update()
Update this resource entry's fields.

**Kind**: instance method of <code>[ResourceEntry](#ResourceEntry)</code>  

| Param | Type | Description |
| --- | --- | --- |
| opts.value | <code>string</code> | string value to update |
| opts.reviewed | <code>boolean</code> | optional boolean indicating if value was reviewed |
| opts.metadata | <code>object</code> | optional metadata to update |
| opts.partnerStatus | <code>string</code> | translation status maintained by partner |

<a name="serviceRegex"></a>
## serviceRegex
a Regex for matching the service.
Usage: var credentials = require('cfEnv')
     .getAppEnv().getServiceCreds(gp.serviceRegex);
(except that it needs to match by label)

**Kind**: global variable  
**Properties**

| Name |
| --- |
| serviceRegex | 

<a name="exampleCredentials"></a>
## exampleCredentials
Example credentials

**Kind**: global variable  
**Properties**

| Name |
| --- |
| exampleCredentials | 

<a name="getClient"></a>
## getClient(params) ⇒ <code>[Client](#Client)</code>
Construct a g11n-pipeline client. 
params.credentials is required unless params.appEnv is supplied.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> | configuration params |
| params.appEnv | <code>Object</code> | pass the result of cfEnv.getAppEnv(). Ignored if params.credentials is supplied. |
| params.credentials | <code>Object.&lt;string, string&gt;</code> | Bound credentials as from the CF service broker (overrides appEnv) |
| params.credentials.url | <code>string</code> | service URL. (should end in '/translate') |
| params.credentials.userId | <code>string</code> | service API key. |
| params.credentials.password | <code>string</code> | service API key. |
| params.credentials.instanceId | <code>string</code> | instance ID |

<a name="isMissingField"></a>
## isMissingField(obj, fields) ⇒
Return a list of missing fields. Special cases the instanceId field.

**Kind**: global function  
**Returns**: array of which fields are missing  

| Param | Description |
| --- | --- |
| obj | obj containing fields |
| fields | array of fields to require |

<a name="basicCallback"></a>
## basicCallback : <code>function</code>
Basic Callback used thr

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Object</code> | error, or null |
| data | <code>Object</code> | Returned data |


*docs autogenerated via [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)*

Support
===
You can post questions about using this service to StackOverflow
using the tag "[globalization-pipeline](http://stackoverflow.com/questions/tagged/globalization-pipeline/)".

LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)

> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
> 
> http://www.apache.org/licenses/LICENSE-2.0
> 
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.
