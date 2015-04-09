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

API Reference: `Client` object
===

### Client.supportedTranslations

This function returns a map from source language(s) to target language(s).

    Client.supportedTranslations( {}, function onSuccess(translations), function onFailure(err) );

Result:

    translations = {
        en: [ 'fr', 'de', ... ]
    };

### Client.project

This function returns a new `Project` object that can be used for further access.
*Note* that this function does not create the project or fetch any information - see [Project.create](#Project.create)

    var myProject = Client.project('MyProject');

### Client.listProjects

This function fetches a map of Project objects corresponding to your current projects.

    Client.listProjects({}, onSuccess(projList), onFailure);

Result:

    projList = {
        MyProject: Project(...),
        MyOtherProject: Project(...),
        ...
    };

API Reference: `Project` object
===

### Project.id

This property returns the projectID of the project.

### Project.create

This function creates the project

    Project.create({}, onSuccess, onFailure);

### Project.remove

This function removes the project, immediately and irrevocably.

    Project.remove({}, onSuccess, onFailure);

### project.getInfo

This function returns a new Project object, with the same `id` but
populated with the current project status, `readerKey`, etc.

    Project.getInfo({}, function onSuccess(newProj), onFailure);
    console.log(newProj.readerKey);

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
