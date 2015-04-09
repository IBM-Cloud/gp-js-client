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
var gaas = require('gaas')({ vcap: process.env.VCAP_SERVICES, project: 'MyProject'});
```

Using APIs
==

Many of the APIs have this pattern:

`obj.function( { /*params*/ } ,  onSuccess, onFailure)`

`onSuccess()` is given an object with various contents.

`onFailure()` is called with an error message if it is an error.


All language ids are IETF BCP47 codes.

API Reference: `gaas` client object
===

### gaas.supportedTranslations

This function returns a map from source language(s) to target language(s).

    gaas.supportedTranslations( {}, function onSuccess(translations), function onFailure(err) );

Result:

    translations = {
        en: [ 'fr', 'de', ... ]
    };

### gaas.project

This function returns a new Project object that can be 

REST APIs
===

These functions directly mirror the REST api on the Globalization service.

At present, the RESTful API docs are hosted
[here](https://gaas.mybluemix.net/translate/swagger/index.html)
and may be helpful reference.

### gaas.rest_getInfo
See REST [`GET /service`](https://gaas.mybluemix.net/translate/swagger/index.html#!/service/getInfo)

This function fetches general information about the server,
including which translations are available.

    gaas.rest_getInfo({}, function onSuccess(resp){}, function onFailure(err){});
    
Sample `resp`:
```
 {
  supportedTranslation:
  {
   en: [ 'de', 'es ]
  },
  status: 'success'
 }
```

* `resp.supportedTranslation` - this is a map from source languages to an array of bcp47
supported languages. This example shows that English can be translated to German and Spanish.

### gaas.rest_getProjectList
See REST [`GET /projects`](https://gaas.mybluemix.net/translate/swagger/index.html#!/project/getProjectList)

This function lists the projects currently available to your api key.

~~~ js
gaas.rest_getProjectList({}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {
    projects:
    [
        {
            id: 'MyProject',
            readerKey: '35adc240-9794-4035-af6b-fe4cdfff2804',
            translationStatusByLanguage:
            {
               de: { failed: 1 }
               fr: { completed: 1 }
            },
            sourceLanguage: 'en',
            targetLanguages: [ 'fr', 'de' ]
        },
        ...
    ],
    status: 'success'
  }
```

The response shows that this project has one language with a failed and one language with a complete
translation.

### gaas.rest_createProject
See REST [`POST /projects`](https://gaas.mybluemix.net/translate/swagger/index.html#!/project/createProject)

This function creates a new project.

~~~ js
gaas.rest_createProject({
  id: "MyOtherProject",
  sourceLanguage: "en",
  targetLanguages: [ "es", "fr" ]
}, function onSuccess(resp){}, function onFailure(err){});
~~~

### gaas.rest_getProject
See REST [`GET /projects/{projectID}`](https://gaas.mybluemix.net/translate/swagger/index.html#!/project/getProject)

This function gets information about one project.

~~~ js
gaas.rest_getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.rest_updateProject
See REST [`POST /projects/{projectID}`](https://gaas.mybluemix.net/translate/swagger/index.html#!/project/updateProject)

Update project contents..

~~~ js
gaas.rest_getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.rest_deleteProject
See REST [`DELETE /projects/{projectID}`](https://gaas.mybluemix.net/translate/swagger/index.html#!/project/deleteProject)

Delete a project and all translations..

~~~ js
gaas.rest_getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.rest_getResourceData
See REST [`GET /projects/{projectID}/{languageID}`](https://gaas.mybluemix.net/translate/swagger/index.html#!/project/getResourceData)

Get the data for one translation

~~~ js
gaas.rest_getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.rest_updateResourceData
See REST [`POST /projects/{projectID}/{languageID}`](https://gaas.mybluemix.net/translate/swagger/index.html#!/project/updateResourceData)

Update one key's entry

~~~ js
gaas.rest_getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.rest_deleteLanguage
See REST [`DELETE /projects/{projectID}/{languageID}`](https://gaas.mybluemix.net/translate/swagger/index.html#!/project/deleteLanguage)

Delete a target language. Source language may not be deleted.

~~~ js
gaas.rest_getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.rest_getResourceEntry
See REST [`GET /projects/{projectID}/{languageID}/{resKey}`](https://gaas.mybluemix.net/translate/swagger/index.html#!/project/getResourceEntry)

Return a single key's entry

~~~ js
gaas.rest_getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

Using RESTful APIs
==

At present, the service's RESTful API docs are hosted
[here](https://gaas.mybluemix.net/translate/swagger/index.html)
and may be helpful reference.

The RESTful APIs have the same pattern as the simple, except that:
* the project ID is NOT set automatically
* the API key IS set automatically.

To use the RESTful APIs, you can call like this:

```
gaas.rest_getProjectList({/* params */}, function onSuccess(resp) {
  if(resp.status !== 'success') { /* it didnt work  */ }
  else {         
     console.log('Projects:');
     console.dir(resp.projects);
  } 
}, function onFailure(err){console.log('Err:',err);}
```

The variable `rest_help` has a list of operations. It could be printed out with this command:
`console.dir(gaas.rest_help);`

LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)
