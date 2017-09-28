Globalization Pipeline Client for JavaScript
============================================

This is the JavaScript SDK for the
[Globalization Pipeline](https://github.com/IBM-Bluemix/gp-common#globalization-pipeline)
Bluemix service. 
The Globalization Pipeline service makes it easy for you to provide your global customers
with Bluemix applications translated into the languages in which they work. 
This SDK currently supports:

* [Node.js](http://nodejs.org)
* Web Browsers via [Browserify](#browserify)

[![npm version](https://badge.fury.io/js/g11n-pipeline.svg)](https://badge.fury.io/js/g11n-pipeline)
[![Build Status](https://travis-ci.org/IBM-Bluemix/gp-js-client.svg?branch=master)](https://travis-ci.org/IBM-Bluemix/gp-js-client)
[![Coverage Status](https://coveralls.io/repos/github/IBM-Bluemix/gp-js-client/badge.svg)](https://coveralls.io/github/IBM-Bluemix/gp-js-client)
[![Coverity Status](https://img.shields.io/coverity/scan/9399.svg)](https://scan.coverity.com/projects/ibm-bluemix-gp-js-client)

### News

* ⚠ Please note that support for Node v0.12 [has been dropped in version 2.0 of this SDK](https://github.com/IBM-Bluemix/gp-js-client/issues/55). See the [Node.js LTS schedule](https://github.com/nodejs/LTS).

## Sample

For a working Bluemix application sample,
see [gp-nodejs-sample](https://github.com/IBM-Bluemix/gp-nodejs-sample).

## Quickstart

* You should familiarize yourself with the service itself. A
good place to begin is by reading the
[Quick Start Guide](https://github.com/IBM-Bluemix/gp-common#quick-start-guide)
and the official
[Getting Started with IBM Globalization ](https://www.ng.bluemix.net/docs/services/GlobalizationPipeline/index.html) documentation.
The documentation explains how to find the service on Bluemix, create a new service instance, create a new bundle, and access the translated messages.

* Next, add `g11n-pipeline` to your project, as well as `cfenv` and `optional`.

    npm install --save g11n-pipeline cfenv optional

* Load the client object as follows (using [cfenv](https://www.npmjs.com/package/cfenv) ).

```javascript
var optional = require('optional');
var appEnv = require('cfenv').getAppEnv();
var gpClient = require('g11n-pipeline').getClient(
  optional('./local-credentials.json')   // if it exists, use local-credentials.json
    || {appEnv: appEnv}                  // otherwise, the appEnv
);
```

* For local testing, create a `local-credentials.json` file with the credentials
as given in the bound service:

      {
        "credentials": {
          "url": "https://…",
          "userId": "…",
          "password": "……",
          "instanceId": "………"
        }
      }

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

### Translation Requests

To create a Translation request:

```javascript
    gpClient.tr({
      name: 'My first TR',
      domains: [ 'HEALTHC' ],

      emails: ['my_real_email@me.example.com'],
      partner: 'IBM',
      targetLanguagesByBundle: {
          bundle1: [ 'es', 'fr', 'de' ], // review bundle1’s Spanish, etc… 
          bundle2: [ 'zh-Hans' ]   // review bundle2’s Simplified Chinese…
      },
      notes: [ 'This is a mobile health advice application.' ],
      status: 'SUBMITTED' // request to submit it right away.
    })
    .create((err, tr) => {
        if(err) { … handle err … }

        console.log('TR submitted with ID:', tr.id);
        console.log('Estimated completion:', 
            tr.estimatedCompletion.toLocaleString());
    });
```

To then check on the status of that request:

```javascript
    gpClient.tr('333cfaecabdedbd8fa16a24b626848d6')
    .getInfo((err, tr) => {
        if(err) { … handle err … }

        console.log('Current status:', tr.status);
    });
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

## Browserify

The gp-js-client can be used in a web browser via [browserify](https://www.npmjs.com/package/browserify#example).

You can call the g11n-pipeline API just as from Node.js:
```js
// mycode.js
const gp = require('g11n-pipeline');
gp.getClient({/*...*/}) // do some great stuff here
```

And then, package up the code for the browser:
```
npm i --save g11n-pipeline
npm i -g browserify
browserify mycode.js > bundle.js
```

Finally, include the bundle in your HTML:
```html
<script src="./bundle.js"></script>
```


API convention
==

APIs may take a callback OR return a promise, and use this general pattern

### Promise mode

* ⚠ _please note that the apidocs [haven’t been updated yet](https://github.com/IBM-Bluemix/gp-js-client/issues/85) to note that 
the callback `cb` is optional and that Promises are returned by most functions.

```javascript
    gpClient.function( { /* opts */ })
    .then( result => /* do something with result */)
    .catch( err => /* do something with err */ );
```


* opts: an object containing input parameters, if needed.

### Callback mode

Prior to v2.0, only the callback model was supported. This is still supported.

```javascript
    gpClient.function( { /*opts*/ } ,  function callback(err, result))
```

* opts: an object containing input parameters, if needed.
* callback: a callback with:
    - `err`: if truthy, indicates an error has occured.
    -`result`: the operation’s result


Sometimes the `opts` object is optional. If this is the case, the
API doc will indicate it with this notation:  `[opts]`
For example,  `bundle.getInfo(cb)` and `bundle.getInfo({}, cb)`  are equivalent.


Also, note that there are aliases from the swagger doc function names
to the convenience name. For example, `bundle.uploadResourceStrings` can be 
used in place of `bundle.uploadStrings`.

All language identifiers are [IETF BCP47](http://tools.ietf.org/html/bcp47) codes.

API reference
===

## Classes

<dl>
<dt><a href="#Bundle">Bundle</a></dt>
<dd><p>Accessor object for a Globalization Pipeline bundle</p>
</dd>
<dt><a href="#Client">Client</a></dt>
<dd><p>Client object for Globalization Pipeline</p>
</dd>
<dt><a href="#ResourceEntry">ResourceEntry</a></dt>
<dd><p>Globalization Pipeline individual resource entry accessor</p>
</dd>
<dt><a href="#TranslationRequest">TranslationRequest</a></dt>
<dd></dd>
<dt><a href="#User">User</a></dt>
<dd><p>Globalization Pipeline user access object</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#serviceRegex">serviceRegex</a></dt>
<dd><p>a Regex for matching the service.
Usage: <code>var credentials = require(&#39;cfEnv&#39;)
     .getAppEnv().getServiceCreds(gp.serviceRegex);</code>
(except that it needs to match by label)</p>
</dd>
<dt><a href="#exampleCredentials">exampleCredentials</a></dt>
<dd><p>Example credentials such as for documentation.</p>
</dd>
<dt><a href="#exampleCredentialsString">exampleCredentialsString</a></dt>
<dd><p>Example credentials string</p>
</dd>
<dt><a href="#version">version</a></dt>
<dd><p>Current version</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getClient">getClient(params)</a> ⇒ <code><a href="#Client">Client</a></code></dt>
<dd><p>Construct a g11n-pipeline client. 
params.credentials is required unless params.appEnv is supplied.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ExternalService">ExternalService</a> : <code>Object</code></dt>
<dd><p>info about external services available</p>
</dd>
<dt><a href="#basicCallback">basicCallback</a> : <code>function</code></dt>
<dd><p>Basic Callback used throughout the SDK</p>
</dd>
<dt><a href="#WordCountsInfo">WordCountsInfo</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Bundle"></a>

## Bundle
Accessor object for a Globalization Pipeline bundle

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| updatedBy | <code>string</code> | userid that updated this bundle |
| updatedAt | <code>Date</code> | date when the bundle was last updated |
| sourceLanguage | <code>string</code> | bcp47 id of the source language |
| targetLanguages | <code>Array.&lt;string&gt;</code> | array of target langauge bcp47 ids |
| readOnly | <code>boolean</code> | true if this bundle can only be read |
| metadata | <code>Object.&lt;string, string&gt;</code> | array of user-editable metadata |


* [Bundle](#Bundle)
    * [new Bundle(gp, props)](#new_Bundle_new)
    * _instance_
        * [.getInfoFields](#Bundle+getInfoFields)
        * [.delete([opts], cb)](#Bundle+delete)
        * [.create(body, cb)](#Bundle+create)
        * [.getInfo([opts], cb)](#Bundle+getInfo)
        * [.languages()](#Bundle+languages) ⇒ <code>Array.&lt;String&gt;</code>
        * [.getStrings(opts, cb)](#Bundle+getStrings)
        * [.entry(opts)](#Bundle+entry)
        * [.entries(opts, cb)](#Bundle+entries)
        * [.uploadStrings(opts, cb)](#Bundle+uploadStrings)
        * [.update(opts, cb)](#Bundle+update)
        * [.updateStrings(opts, cb)](#Bundle+updateStrings)
    * _inner_
        * [~getInfoCallback](#Bundle..getInfoCallback) : <code>function</code>
        * [~listEntriesCallback](#Bundle..listEntriesCallback) : <code>function</code>

<a name="new_Bundle_new"></a>

### new Bundle(gp, props)
Note: this constructor is not usually called directly, use Client.bundle(id)


| Param | Type | Description |
| --- | --- | --- |
| gp | [<code>Client</code>](#Client) | parent g11n-pipeline client object |
| props | <code>Object</code> | properties to inherit |

<a name="Bundle+getInfoFields"></a>

### bundle.getInfoFields
List of fields usable with Bundle.getInfo()

**Kind**: instance property of [<code>Bundle</code>](#Bundle)  
<a name="Bundle+delete"></a>

### bundle.delete([opts], cb)
Delete this bundle.

**Kind**: instance method of [<code>Bundle</code>](#Bundle)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | options |
| cb | [<code>basicCallback</code>](#basicCallback) |  |  |

<a name="Bundle+create"></a>

### bundle.create(body, cb)
Create this bundle with the specified params.
Note that on failure, such as an illegal language being specified,
the bundle is not created.

**Kind**: instance method of [<code>Bundle</code>](#Bundle)  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> |  |
| body.sourceLanguage | <code>string</code> | bcp47 id of source language such as 'en' |
| body.targetLanguages | <code>Array</code> | optional array of target languages |
| body.metadata | <code>Object</code> | optional metadata for the bundle |
| body.partner | <code>string</code> | optional ID of partner assigned to translate this bundle |
| body.notes | <code>Array.&lt;string&gt;</code> | optional note to translators |
| cb | [<code>basicCallback</code>](#basicCallback) |  |

<a name="Bundle+getInfo"></a>

### bundle.getInfo([opts], cb)
Get bundle info. Returns a new Bundle object with additional fields populated.

**Kind**: instance method of [<code>Bundle</code>](#Bundle)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | Options object |
| opts.fields | <code>String</code> |  | Comma separated list of fields |
| opts.translationStatusMetricsByLanguage | <code>Boolean</code> |  | Optional field (false by default) |
| opts.reviewStatusMetricsByLanguage | <code>Boolean</code> |  | Optional field (false by default) |
| opts.partnerStatusMetricsByLanguage | <code>Boolean</code> |  | Optional field (false by default) |
| cb | [<code>getInfoCallback</code>](#Bundle..getInfoCallback) |  | callback (err, Bundle ) |

<a name="Bundle+languages"></a>

### bundle.languages() ⇒ <code>Array.&lt;String&gt;</code>
Return all of the languages (source and target) for this bundle.
The source language will be the first element.
Will return undefined if this bundle was not returned by getInfo().

**Kind**: instance method of [<code>Bundle</code>](#Bundle)  
<a name="Bundle+getStrings"></a>

### bundle.getStrings(opts, cb)
Fetch one language's strings

**Kind**: instance method of [<code>Bundle</code>](#Bundle)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opts | <code>Object</code> |  | options |
| opts.languageId | <code>String</code> |  | language to fetch |
| [opts.fallback] | <code>boolean</code> | <code>false</code> | Whether if source language value is used if translated value is not available |
| [opts.fields] | <code>string</code> |  | Optional fields separated by comma |
| cb | [<code>basicCallback</code>](#basicCallback) |  | callback (err, { resourceStrings: { strings… } }) |

<a name="Bundle+entry"></a>

### bundle.entry(opts)
Create an entry object. Doesn't fetch data,

**Kind**: instance method of [<code>Bundle</code>](#Bundle)  
**See**: ResourceEntry~getInfo  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language |
| opts.resourceKey | <code>String</code> | resource key |

<a name="Bundle+entries"></a>

### bundle.entries(opts, cb)
List entries. Callback is called with a map of 
resourceKey to ResourceEntry objects.

**Kind**: instance method of [<code>Bundle</code>](#Bundle)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language to fetch |
| cb | <code>listEntriesCallback</code> | Callback with (err, map of resourceKey:ResourceEntry ) |

<a name="Bundle+uploadStrings"></a>

### bundle.uploadStrings(opts, cb)
Upload resource strings, replacing all current contents for the language

**Kind**: instance method of [<code>Bundle</code>](#Bundle)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.languageId | <code>String</code> | language to update |
| opts.strings | <code>Object.&lt;string, string&gt;</code> | strings to update |
| cb | [<code>basicCallback</code>](#basicCallback) |  |

<a name="Bundle+update"></a>

### bundle.update(opts, cb)
**Kind**: instance method of [<code>Bundle</code>](#Bundle)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.targetLanguages | <code>array</code> | optional: list of target languages to update |
| opts.readOnly | <code>boolean</code> | optional: set this bundle to be readonly or not |
| opts.metadata | <code>object</code> | optional: metadata to update |
| opts.partner | <code>string</code> | optional: partner id to update |
| opts.notes | <code>Array.&lt;string&gt;</code> | optional notes to translator |
| cb | [<code>basicCallback</code>](#basicCallback) | callback |

<a name="Bundle+updateStrings"></a>

### bundle.updateStrings(opts, cb)
Update some strings in a language.

**Kind**: instance method of [<code>Bundle</code>](#Bundle)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | options |
| opts.strings | <code>Object.&lt;string, string&gt;</code> | strings to update. |
| opts.languageId | <code>String</code> | language to update |
| opts.resync | <code>Boolean</code> | optional: If true, resynchronize strings  in the target language and resubmit previously-failing translation operations |
| cb | [<code>basicCallback</code>](#basicCallback) |  |

<a name="Bundle..getInfoCallback"></a>

### Bundle~getInfoCallback : <code>function</code>
Callback returned by Bundle~getInfo().

**Kind**: inner typedef of [<code>Bundle</code>](#Bundle)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| bundle | [<code>Bundle</code>](#Bundle) | bundle object with additional data |
| bundle.updatedBy | <code>string</code> | userid that updated this bundle |
| bundle.updatedAt | <code>Date</code> | date when the bundle was last updated |
| bundle.sourceLanguage | <code>string</code> | bcp47 id of the source language |
| bundle.targetLanguages | <code>Array.&lt;string&gt;</code> | array of target langauge bcp47 ids |
| bundle.readOnly | <code>boolean</code> | true if this bundle can only be read |
| bundle.metadata | <code>Object.&lt;string, string&gt;</code> | array of user-editable metadata |
| bundle.translationStatusMetricsByLanguage | <code>Object</code> | additional metrics information |
| bundle.reviewStatusMetricsByLanguage | <code>Object</code> | additional metrics information |

<a name="Bundle..listEntriesCallback"></a>

### Bundle~listEntriesCallback : <code>function</code>
Called by entries()

**Kind**: inner typedef of [<code>Bundle</code>](#Bundle)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| entries | <code>Object.&lt;string, ResourceEntry&gt;</code> | map from resource key to ResourceEntry object.  The .value field will be filled in with the string value. |

<a name="Client"></a>

## Client
Client object for Globalization Pipeline

**Kind**: global class  

* [Client](#Client)
    * _instance_
        * [.version](#Client+version)
        * [.url](#Client+url) ⇒ <code>String</code>
        * [.supportedTranslations([opts], cb)](#Client+supportedTranslations)
        * [.getServiceInfo([opts], cb)](#Client+getServiceInfo)
        * [.getServiceInstanceInfo([opts], cb)](#Client+getServiceInstanceInfo)
        * [.ping(args, cb)](#Client+ping)
        * [.createUser(opts, cb)](#Client+createUser)
        * [.user(id)](#Client+user) ⇒ [<code>User</code>](#User)
        * [.users([opts], cb)](#Client+users)
        * [.bundles([opts], cb)](#Client+bundles)
        * [.bundle(opts)](#Client+bundle) ⇒ [<code>Bundle</code>](#Bundle)
        * [.tr(opts)](#Client+tr) ⇒ [<code>TranslationRequest</code>](#TranslationRequest)
        * [.trs([opts], cb)](#Client+trs)
    * _inner_
        * [~supportedTranslationsCallback](#Client..supportedTranslationsCallback) : <code>function</code>
        * [~serviceInfoCallback](#Client..serviceInfoCallback) : <code>function</code>
        * [~serviceInstanceInfoCallback](#Client..serviceInstanceInfoCallback) : <code>function</code>
        * [~listUsersCallback](#Client..listUsersCallback) : <code>function</code>
        * [~listBundlesCallback](#Client..listBundlesCallback) : <code>function</code>

<a name="Client+version"></a>

### client.version
Version number of the REST service used. Currently ‘V2’.

**Kind**: instance property of [<code>Client</code>](#Client)  
<a name="Client+url"></a>

### client.url ⇒ <code>String</code>
Return the URL used for this client.

**Kind**: instance property of [<code>Client</code>](#Client)  
**Returns**: <code>String</code> - - the URL  
<a name="Client+supportedTranslations"></a>

### client.supportedTranslations([opts], cb)
This function returns a map from source language(s) to target language(s).
Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>object</code> | <code>{}</code> | ignored |
| cb | [<code>supportedTranslationsCallback</code>](#Client..supportedTranslationsCallback) |  | (err, map-of-languages) |

<a name="Client+getServiceInfo"></a>

### client.getServiceInfo([opts], cb)
Get global information about this service, not specific to one service instance.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>object</code> | <code>{}</code> | ignored argument |
| cb | [<code>serviceInfoCallback</code>](#Client..serviceInfoCallback) |  |  |

<a name="Client+getServiceInstanceInfo"></a>

### client.getServiceInstanceInfo([opts], cb)
Get information about our specific service instance.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>object</code> | <code>{}</code> | options |
| [opts.serviceInstance] | <code>string</code> |  | request a specific service instance’s info |
| cb | [<code>serviceInstanceInfoCallback</code>](#Client..serviceInstanceInfoCallback) |  |  |

<a name="Client+ping"></a>

### client.ping(args, cb)
Verify that there is access to the server. An error result
will be returned if there is a problem. On success, the data returned
can be ignored. (Note: this is a synonym for getServiceInfo())

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>object</code> | (ignored) |
| cb | [<code>basicCallback</code>](#basicCallback) |  |

<a name="Client+createUser"></a>

### client.createUser(opts, cb)
Create a user

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>object</code> |  |
| opts.type | <code>string</code> | User type (ADMINISTRATOR, TRANSLATOR, or READER) |
| opts.displayName | <code>string</code> | Optional display name for the user.  This can be any string and is displayed in the service dashboard. |
| opts.comment | <code>string</code> | Optional comment |
| opts.bundles | <code>Array</code> | set of accessible bundle ids. Use `['*']` for “all bundles” |
| opts.metadata | <code>Object.&lt;string, string&gt;</code> | optional key/value pairs for user metadata |
| opts.externalId | <code>string</code> | optional external user ID for your application’s use |
| cb | [<code>getUserCallback</code>](#User..getUserCallback) | passed a new User object |

<a name="Client+user"></a>

### client.user(id) ⇒ [<code>User</code>](#User)
Create a user access object.
This doesn’t create the user itself,
nor query the server, but is just a handle object.
Use createUser() to create a user.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Object</code> | String (id) or map {id: bundleId, serviceInstance: serviceInstanceId} |

<a name="Client+users"></a>

### client.users([opts], cb)
List users. Callback is called with an array of 
user access objects.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | options |
| cb | [<code>listUsersCallback</code>](#Client..listUsersCallback) |  | callback |

<a name="Client+bundles"></a>

### client.bundles([opts], cb)
List bundles. Callback is called with an map of 
bundle access objects.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | options |
| cb | [<code>listBundlesCallback</code>](#Client..listBundlesCallback) |  | given a map of Bundle objects |

<a name="Client+bundle"></a>

### client.bundle(opts) ⇒ [<code>Bundle</code>](#Bundle)
Create a bundle access object.
This doesn’t create the bundle itself, just a handle object.
Call create() on the bundle to create it.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | String (id) or map {id: bundleId, serviceInstance: serviceInstanceId} |

<a name="Client+tr"></a>

### client.tr(opts) ⇒ [<code>TranslationRequest</code>](#TranslationRequest)
Create a Translation Request access object.
This doesn’t create the TR itself, just a handle object.
Call create() on the translation request to create it.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>string</code> \| <code>Object.&lt;string, Object&gt;</code> | Can be a string (id) or map with values (for a new TR). See TranslationRequest. |

<a name="Client+trs"></a>

### client.trs([opts], cb)
List Translation Requests. Callback is called with an map of 
TR access objects.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | optional map of options |
| cb | [<code>getTranslationRequestsCallback</code>](#TranslationRequest..getTranslationRequestsCallback) |  | callback yielding a map of Translation Requests |

<a name="Client..supportedTranslationsCallback"></a>

### Client~supportedTranslationsCallback : <code>function</code>
Callback returned by supportedTranslations()

**Kind**: inner typedef of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| languages | <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> | map from source language to array of target languages Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese. |

<a name="Client..serviceInfoCallback"></a>

### Client~serviceInfoCallback : <code>function</code>
Callback used by getServiceInfo()

**Kind**: inner typedef of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| info | <code>Object</code> | detailed information about the service |
| info.supportedTranslation | <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> | map from source language to array of target languages Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese. |
| info.supportedHumanTranslation | <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> | map from source language to array of target languages  supported for human translation. Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese. |
| info.externalServices | [<code>Array.&lt;ExternalService&gt;</code>](#ExternalService) | info about external services available |

<a name="Client..serviceInstanceInfoCallback"></a>

### Client~serviceInstanceInfoCallback : <code>function</code>
Callback returned by getServiceInstanceInfo()

**Kind**: inner typedef of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| instanceInfo | <code>object</code> | Additional information about the service instance |
| instanceInfo.updatedBy | <code>string</code> | information about how our service instance was updated |
| instanceInfo.updatedAt | <code>date</code> | when the instance was last updated |
| instanceInfo.region | <code>string</code> | the Bluemix region name |
| instanceInfo.cfServiceInstanceId | <code>string</code> | the CloudFoundry service instance ID |
| instanceInfo.serviceId | <code>string</code> | this is equivalent to the service instance ID |
| instanceInfo.orgId | <code>string</code> | this is the Bluemix organization ID |
| instanceInfo.spaceId | <code>string</code> | this is the Bluemix space ID |
| instanceInfo.planId | <code>string</code> | this is the Bluemix plan ID |
| instanceInfo.htServiceEnabled | <code>boolean</code> | true if the Human Translation service is enabled |
| instanceInfo.usage | <code>object</code> | usage information |
| instanceInfo.usage.size | <code>number</code> | the size of resource data used by the Globalization Pipeline instance in bytes |
| instanceInfo.disabled | <code>boolean</code> | true if this service has been set as disabled by Bluemix |

<a name="Client..listUsersCallback"></a>

### Client~listUsersCallback : <code>function</code>
Called by users()

**Kind**: inner typedef of [<code>Client</code>](#Client)  
**See**: User  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| users | <code>Object.&lt;string, User&gt;</code> | map from user ID to User object |

<a name="Client..listBundlesCallback"></a>

### Client~listBundlesCallback : <code>function</code>
Bundle list callback

**Kind**: inner typedef of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| bundles | <code>Object.&lt;string, Bundle&gt;</code> | map from bundle ID to Bundle object |

<a name="ResourceEntry"></a>

## ResourceEntry
Globalization Pipeline individual resource entry accessor

**Kind**: global class  
**See**: Bundle~entries  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| resourceKey | <code>String</code> | key for the resource |
| updatedBy | <code>string</code> | the user which last updated this entry |
| updatedAt | <code>Date</code> | when this entry was updated |
| value | <code>string</code> | the translated value of this entry |
| sourceValue | <code>string</code> | the source value of this entry |
| reviewed | <code>boolean</code> | indicator of whether this entry has been reviewed |
| translationStatus | <code>string</code> | status of this translation:  `source_language`, `translated`, `in_progress`, or `failed` |
| entry.metadata | <code>Object.&lt;string, string&gt;</code> | user metadata for this entry |
| partnerStatus | <code>string</code> | status of partner integration |
| sequenceNumber | <code>number</code> | relative sequence of this entry |
| notes | <code>Array.&lt;string&gt;</code> | optional notes to translator |


* [ResourceEntry](#ResourceEntry)
    * _instance_
        * [.getInfo([opts], cb)](#ResourceEntry+getInfo)
        * [.update()](#ResourceEntry+update)
    * _inner_
        * [~getInfoCallback](#ResourceEntry..getInfoCallback) : <code>function</code>

<a name="ResourceEntry+getInfo"></a>

### resourceEntry.getInfo([opts], cb)
Load this entry's information. Callback is given
another ResourceEntry but one with all current data filled in.

**Kind**: instance method of [<code>ResourceEntry</code>](#ResourceEntry)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | options |
| cb | [<code>getInfoCallback</code>](#ResourceEntry..getInfoCallback) |  | callback (err, ResourceEntry) |

<a name="ResourceEntry+update"></a>

### resourceEntry.update()
Update this resource entry's fields.

**Kind**: instance method of [<code>ResourceEntry</code>](#ResourceEntry)  

| Param | Type | Description |
| --- | --- | --- |
| opts.value | <code>string</code> | string value to update |
| opts.reviewed | <code>boolean</code> | optional boolean indicating if value was reviewed |
| opts.metadata | <code>object</code> | optional metadata to update |
| opts.notes | <code>Array.&lt;string&gt;</code> | optional notes to translator |
| opts.partnerStatus | <code>string</code> | translation status maintained by partner |
| opts.sequenceNumber | <code>string</code> | sequence number of the entry (only for the source language) |

<a name="ResourceEntry..getInfoCallback"></a>

### ResourceEntry~getInfoCallback : <code>function</code>
Callback called by ResourceEntry~getInfo()

**Kind**: inner typedef of [<code>ResourceEntry</code>](#ResourceEntry)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| entry | [<code>ResourceEntry</code>](#ResourceEntry) | On success, the new or updated ResourceEntry object. |

<a name="TranslationRequest"></a>

## TranslationRequest
**Kind**: global class  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | Translation Request ID |
| serviceInstance | <code>string</code> |  | the Service Instance that this Translation Request belongs to |
| partner | <code>string</code> |  | the three letter Partner ID to be used. Use 'IBM' for the Professional Plan |
| name | <code>string</code> |  | descriptive title for this translation request |
| targetLanguagesByBundle | <code>Object.&lt;String, Array.&lt;String&gt;&gt;</code> |  | map from Bundle ID to array of target languages |
| emails | <code>Array.&lt;String&gt;</code> |  | array of email addresses for the requester |
| domains | [<code>Array.&lt;TranslationDomain&gt;</code>](#TranslationDomain) |  | A list of applicable translation domains. |
| status | [<code>TranslationRequestStatus</code>](#TranslationRequestStatus) |  | Status of this TR. |
| wordCountsByBundle | <code>Object.&lt;String, WordCountsInfo&gt;</code> |  | map of bundle IDs to word count data |
| updatedBy | <code>string</code> |  | last updated user ID |
| updatedAt | <code>Date</code> |  | date when the TR was updated |
| createdAt | <code>Date</code> |  | date when the TR was first submitted |
| estimatedCompletion | <code>Date</code> |  | date when the TR is expected to be complete |
| startedAt | <code>Date</code> |  | date when the TR was accepted for processing |
| translatedAt | <code>Date</code> |  | date when the TR had completed translation review |
| mergedAt | <code>Date</code> |  | date when the TR was merged back into the target bundles |
| notes | <code>Array.&lt;String&gt;</code> | <code>[]</code> | optional array of notes to the translators |
| metadata | <code>Object.&lt;string, string&gt;</code> |  | array of user-defined metadata |


* [TranslationRequest](#TranslationRequest)
    * [new TranslationRequest(gp, props)](#new_TranslationRequest_new)
    * _instance_
        * [.getInfo([opts], cb)](#TranslationRequest+getInfo)
        * [.delete([opts], cb)](#TranslationRequest+delete)
        * [.create([opts], cb)](#TranslationRequest+create)
        * [.update(opts, cb)](#TranslationRequest+update)
    * _inner_
        * [~getTranslationRequestsCallback](#TranslationRequest..getTranslationRequestsCallback) : <code>function</code>
        * [~getTranslationRequestCallback](#TranslationRequest..getTranslationRequestCallback) : <code>function</code>

<a name="new_TranslationRequest_new"></a>

### new TranslationRequest(gp, props)
This class represents a request for professional editing of machine-translated content.
Note: this constructor is not usually called directly, use Client.tr(id) or Client.tr({fields…})


| Param | Type | Description |
| --- | --- | --- |
| gp | [<code>Client</code>](#Client) | parent g11n-pipeline client object |
| props | <code>Object</code> | properties to inherit |

<a name="TranslationRequest+getInfo"></a>

### translationRequest.getInfo([opts], cb)
Fetch the full record for this translation request.
Example:  `client.tr('1dec633b').getInfo((err, tr) => { console.log(tr.status); });`

**Kind**: instance method of [<code>TranslationRequest</code>](#TranslationRequest)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | Options object - if present, overrides values in `this` |
| cb | [<code>getTranslationRequestCallback</code>](#TranslationRequest..getTranslationRequestCallback) |  |  |

<a name="TranslationRequest+delete"></a>

### translationRequest.delete([opts], cb)
Delete this translation request.

**Kind**: instance method of [<code>TranslationRequest</code>](#TranslationRequest)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | Options object - if present, overrides values in `this` |
| cb | <code>BasicCallBack</code> |  |  |

<a name="TranslationRequest+create"></a>

### translationRequest.create([opts], cb)
Create a translation request with the specified options. The callback returns a new TranslationRequest object
with the `id` and other fields populated.
Example:  `client.tr({ status: 'SUBMITTED', ... }).create((err, tr) => { console.log(tr.id); });`

**Kind**: instance method of [<code>TranslationRequest</code>](#TranslationRequest)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | Options object - if present, overrides values in `this` |
| cb | [<code>getTranslationRequestCallback</code>](#TranslationRequest..getTranslationRequestCallback) |  |  |

<a name="TranslationRequest+update"></a>

### translationRequest.update(opts, cb)
Update a translation request with the specified values.
If any property of `opts` is missing, that value will not be updated.

**Kind**: instance method of [<code>TranslationRequest</code>](#TranslationRequest)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | Options object - contains fields to update |
| [opts.partner] | <code>String</code> | optional: update partner. |
| [opts.name] | <code>String</code> | optional: update name |
| [opts.targetLanguagesByBundle] | <code>Object.&lt;String, Array.&lt;String&gt;&gt;</code> | optional: update target bundle/language list |
| [opts.emails] | <code>Array.&lt;String&gt;</code> | optional: update email list |
| [opts.domains] | [<code>Array.&lt;TranslationDomain&gt;</code>](#TranslationDomain) | optional: update domain list |
| [opts.status] | [<code>TranslationRequestStatus</code>](#TranslationRequestStatus) | optional: update TR status. May only change from `DRAFT` to `SUBMITTED` here. |
| [opts.metadata] | <code>Object.&lt;String, String&gt;</code> | optional: update metadata |
| cb | [<code>basicCallback</code>](#basicCallback) | callback with update status |

<a name="TranslationRequest..getTranslationRequestsCallback"></a>

### TranslationRequest~getTranslationRequestsCallback : <code>function</code>
Callback returned by trs()

**Kind**: inner typedef of [<code>TranslationRequest</code>](#TranslationRequest)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Object</code> | error, or null |
| trs | <code>Object.&lt;string, TranslationRequest&gt;</code> | map from translation request ID to TranslationRequest Example: `{ 1dec633b: {…}}` if there was just one TR, id `1dec633b` |

<a name="TranslationRequest..getTranslationRequestCallback"></a>

### TranslationRequest~getTranslationRequestCallback : <code>function</code>
Callback returned by getInfo and create

**Kind**: inner typedef of [<code>TranslationRequest</code>](#TranslationRequest)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Object</code> | error, or null |
| tr | [<code>TranslationRequest</code>](#TranslationRequest) | the returned TranslationRequest |

<a name="User"></a>

## User
Globalization Pipeline user access object

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
    * _instance_
        * [.update(opts, cb)](#User+update)
        * [.delete([opts], cb)](#User+delete)
        * [.getInfo(opts, cb)](#User+getInfo)
    * _inner_
        * [~getUserCallback](#User..getUserCallback) : <code>function</code>

<a name="new_User_new"></a>

### new User(gp, props)
Note: this constructor is not usually called directly, use Client.user(id)


| Param | Type | Description |
| --- | --- | --- |
| gp | [<code>Client</code>](#Client) | parent Client object |
| props | <code>Object</code> | properties to inherit |

<a name="User+update"></a>

### user.update(opts, cb)
Update this user. 
All fields of opts are optional. For strings, falsy = no change, empty string `''` = deletion.

**Kind**: instance method of [<code>User</code>](#User)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>object</code> | options |
| opts.displayName | <code>string</code> | User's display name - falsy = no change, empty string `''` = deletion. |
| opts.comment | <code>string</code> | optional comment - falsy = no change, empty string '' = deletion. |
| opts.bundles | <code>Array.&lt;string&gt;</code> | Accessible bundle IDs. |
| opts.metadata | <code>object.&lt;string, string&gt;</code> | User defined user metadata containg key/value pairs.  Data will be merged in. Pass in `{}` to erase all metadata. |
| opts.externalId | <code>string</code> | User ID used by another system associated with this user - falsy = no change, empty string '' = deletion. |
| cb | [<code>basicCallback</code>](#basicCallback) | callback with success or failure |

<a name="User+delete"></a>

### user.delete([opts], cb)
Delete this user. 
Note that the service managed user
(the initial users created by the service) may not be
 deleted.

**Kind**: instance method of [<code>User</code>](#User)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>Object</code> | <code>{}</code> | options |
| cb | [<code>basicCallback</code>](#basicCallback) |  | callback with success or failure |

<a name="User+getInfo"></a>

### user.getInfo(opts, cb)
Fetch user info.
The callback is given a new User instance, with
all properties filled in.

**Kind**: instance method of [<code>User</code>](#User)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | optional, ignored |
| cb | [<code>getUserCallback</code>](#User..getUserCallback) | called with updated info |

<a name="User..getUserCallback"></a>

### User~getUserCallback : <code>function</code>
Callback called by Client~createUser() and User~getInfo()

**Kind**: inner typedef of [<code>User</code>](#User)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>object</code> | error, or null |
| user | [<code>User</code>](#User) | On success, the new or updated User object. |

<a name="serviceRegex"></a>

## serviceRegex
a Regex for matching the service.
Usage: `var credentials = require('cfEnv')
     .getAppEnv().getServiceCreds(gp.serviceRegex);`
(except that it needs to match by label)

**Kind**: global variable  
**Properties**

| Name |
| --- |
| serviceRegex | 

<a name="exampleCredentials"></a>

## exampleCredentials
Example credentials such as for documentation.

**Kind**: global variable  
**Properties**

| Name |
| --- |
| exampleCredentials | 

<a name="exampleCredentialsString"></a>

## exampleCredentialsString
Example credentials string

**Kind**: global variable  
**Properties**

| Name |
| --- |
| exampleCredentialsString | 

<a name="version"></a>

## version
Current version

**Kind**: global variable  
<a name="TranslationRequestStatus"></a>

## TranslationRequestStatus : <code>enum</code>
Possible status values for Translation Requests

**Kind**: global enum  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| DRAFT | <code>string</code> | The translation request has not been submitted for processing. It may modified or cancelled. |
| SUBMITTED | <code>string</code> | The translation request has been submitted for processing, but has not been accepted by the partner yet. |
| STARTED | <code>string</code> | Work has started on the translation request. |
| TRANSLATED | <code>string</code> | All work has been completed on the translation request. It has not been merged into the target resource data yet. |
| MERGED | <code>string</code> | The translation results have been merged into the original resource bundles. |

<a name="TranslationDomain"></a>

## TranslationDomain : <code>enum</code>
Possible translation domains. These provide hints as to the type of translation expected.

**Kind**: global enum  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| AEROMIL | <code>string</code> | <code>&quot;Aerospace and the military-industrial complex&quot;</code> | 
| CNSTRCT | <code>string</code> | <code>&quot;Construction&quot;</code> | 
| GDSSVCS | <code>string</code> | <code>&quot;Goods and service&quot;</code> | 
| EDUCATN | <code>string</code> | <code>&quot;Education&quot;</code> | 
| FINSVCS | <code>string</code> | <code>&quot;Financial Services&quot;</code> | 
| GOVPUBL | <code>string</code> | <code>&quot;Government and public sector&quot;</code> | 
| HEALTHC | <code>string</code> | <code>&quot;Healthcare and social services&quot;</code> | 
| INDSTMF | <code>string</code> | <code>&quot;Industrial manufacturing&quot;</code> | 
| TELECOM | <code>string</code> | <code>&quot;Telecommunication&quot;</code> | 
| DMEDENT | <code>string</code> | <code>&quot;Digital media and entertainment&quot;</code> | 
| INFTECH | <code>string</code> | <code>&quot;Information technology&quot;</code> | 
| TRVLTRS | <code>string</code> | <code>&quot;Travel and transportation&quot;</code> | 
| INSURNC | <code>string</code> | <code>&quot;Insurance&quot;</code> | 
| ENGYUTL | <code>string</code> | <code>&quot;Energy and utilities&quot;</code> | 
| AGRICLT | <code>string</code> | <code>&quot;Agriculture&quot;</code> | 

<a name="getClient"></a>

## getClient(params) ⇒ [<code>Client</code>](#Client)
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

<a name="ExternalService"></a>

## ExternalService : <code>Object</code>
info about external services available

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of the service, such as MT for Machine Translation |
| name | <code>string</code> | The name of the service |
| id | <code>string</code> | The id of the service |
| supportedTranslation | <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> | map from source language to array of target languages Example: `{ en: ['de', 'ja']}` meaning English translates to German and Japanese. |

<a name="basicCallback"></a>

## basicCallback : <code>function</code>
Basic Callback used throughout the SDK

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Object</code> | error, or null |
| data | <code>Object</code> | Returned data |

<a name="WordCountsInfo"></a>

## WordCountsInfo : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| sourceLanguage | <code>string</code> | bcp47 id of the source language, such as 'en' |
| counts | <code>object.&lt;string, number&gt;</code> | map from target language to word count |


*docs autogenerated via [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)*

Community
===
* View or file GitHub [Issues](https://github.com/IBM-Bluemix/gp-js-client/issues)
* Connect with the open source community on [developerWorks Open](https://developer.ibm.com/open/ibm-bluemix-globalization-pipeline/node-js-sdk/)

Contributing
===
See [CONTRIBUTING.md](CONTRIBUTING.md).

License
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
