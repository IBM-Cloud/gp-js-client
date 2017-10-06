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

{{>main}}

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
