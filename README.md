Globalization Pipeline Client for JavaScript
============================================

This is the JavaScript SDK for the
[Globalization Pipeline](https://github.com/IBM-Cloud/gp-common#globalization-pipeline)
IBM Cloud service. 
The Globalization Pipeline service makes it easy for you to provide your global customers
with IBM Cloud applications translated into the languages in which they work. 
This SDK currently supports:

* [Node.js](http://nodejs.org)
* Web Browsers via [Browserify](#browserify)

[![npm version](https://badge.fury.io/js/g11n-pipeline.svg)](https://badge.fury.io/js/g11n-pipeline)
[![Build Status](https://travis-ci.org/IBM-Cloud/gp-js-client.svg?branch=master)](https://travis-ci.org/IBM-Cloud/gp-js-client)
[![Coverage Status](https://coveralls.io/repos/github/IBM-Cloud/gp-js-client/badge.svg)](https://coveralls.io/github/IBM-Cloud/gp-js-client)
[![Coverity Status](https://img.shields.io/coverity/scan/9399.svg)](https://scan.coverity.com/projects/ibm-bluemix-gp-js-client)

### News

* ⚠ Please note that at present, the 3.x version of the SDK [requires Node 8 or later](https://github.com/IBM-Cloud/gp-js-client/issues/124) (async/await yes). See the [Node.js LTS schedule](https://github.com/nodejs/LTS). Use 2.x if you need to use Node versions back to 4. We may try to support prior Node versions in 3.x later if needed. Please comment on [this issue](https://github.com/IBM-Cloud/gp-js-client/issues/124) if you have feedback.
* New APIs will not support the callback model, but only return promises. Existing APIs that used to take a callback should continue to do so.

## Sample

For a working IBM Cloud application sample,
see [gp-nodejs-sample](https://github.com/IBM-Cloud/gp-nodejs-sample).

## Quickstart

* You should familiarize yourself with the service itself. A
good place to begin is by reading the
[Quick Start Guide](https://github.com/IBM-Cloud/gp-common#quick-start-guide)
and the official
[Getting Started with IBM Globalization ](https://www.ng.bluemix.net/docs/services/GlobalizationPipeline/index.html) documentation.
The documentation explains how to find the service on IBM Cloud, create a new service instance, create a new bundle, and access the translated messages.

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
    const mybundle = gpClient.bundle('hello');
```

Then, call the `getStrings` function:

```javascript
    const {resourceStrings} = await mybundle.getStrings({ languageId: 'es'});
    console.dir(resourceStrings);
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
    const tr = await gpClient.tr({
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
    .create();
    console.log('TR submitted with ID:', tr.id);
    console.log('Estimated completion:', 
        tr.estimatedCompletion.toLocaleString());
```

To then check on the status of that request:

```javascript
    const {status} = await gpClient.tr('333cfaecabdedbd8fa16a24b626848d6')
        .getInfo();

    console.log('Current status:', status);
```

### Async

Note that all calls that are async (or take a callback) are asynchronous.
For example, the following code:

```javascript
var bundle = client.bundle('someBundle');
bundle.create().then(…);
bundle.uploadStrings().then(…);
```

…will fail, because the bundle `someBundle` hasn’t been `create`d by the time the
`uploadStrings` call is made. Instead, make sure `create` is called before `uploadStrings`: 

```javascript
var bundle = client.bundle('someBundle');
await bundle.create();
await bundle.uploadStrings();
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
## API

See [API.md](API.md)

## Community

* View or file GitHub [Issues](https://github.com/IBM-Cloud/gp-js-client/issues)
* Connect with the open source community on [developerWorks Open](https://developer.ibm.com/open/ibm-bluemix-globalization-pipeline/node-js-sdk/)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

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
