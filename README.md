<!--
//* IBM Globalization
//* IBM Confidential / Copyright (C) IBM Corp. 2015
-->

Client for IBM Globalization-as-a-Service
===
by Steven R. Loomis

To use ( quickstart )

# install [node.js](http://nodejs.org)

# make sure node is in your PATH

# run the following
```
        npm install
        npm run
```


You can also do:
```
        set GAAS_API_URL=http://127.0.0.1:9131/translate
```

# TESTS

The following snippet runs the unit tests, with a timeout of 16 seconds.

```
        npm run mocha -- -t 16s
```

The following vars affect the tests (and some sample code)
* `GAAS_PROJECT` = project name to use
* `GAAS_API_KEY` = which api key to use
* `GAAS_API_URL` = URL of the endpoint. Should end with "/translate".

Using
==

Create the client object as below. The project can be set in the client object
to set a default project name for operations.

``` js
var gaas = require('gaas')({
     url: 'https://<address of GaaS server>/translate',
     api: '<your API key>',
     project: '<your default project name>',
});
```

The RESTful APIs can be called directly, or the simple API.
Using the simple API is recommended, however it is not YET complete.

If you have a service bound as the name `IBM Globalization`,
you can do this to fetch credentials from VCAP:

``` js
var gaas = require('gaas')({ vcap: process.env.VCAP_SERVICES, project: 'MyProject'});
```

Using APIs.
==

All of the APIs have this pattern:

`gaas.function( { /*params*/ } ,  onSuccess, onFailure)`

`onSuccess()` is given an object with various contents.

`onFailure()` is called with an error message if it is an error.

At present, the RESTful API docs are hosted
[here](https://gaas.stage1.mybluemix.net/translate/swagger/index.html)
and may be helpful reference.

All language ids are IETF BCP47 codes.

APIs
===

### gaas.getInfo
See REST [`GET /service`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/service/getInfo)

This function fetches general information about the server,
including which translations are available.

~~~ js
gaas.getInfo({}, function onSuccess(resp){}, function onFailure(err){});
~~~

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

### gaas.getProjectList
See REST [`GET /projects`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/project/getProjectList)

This function lists the projects currently available to your api key.

~~~ js
gaas.getProjectList({}, function onSuccess(resp){}, function onFailure(err){});
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

### gaas.createProject
See REST [`POST /projects`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/project/createProject)

This function creates a new project.

~~~ js
gaas.createProject({
  id: "MyOtherProject",
  sourceLanguage: "en",
  targetLanguages: [ "es", "fr" ]
}, function onSuccess(resp){}, function onFailure(err){});
~~~

### gaas.getProject
See REST [`GET /projects/{projectID}`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/project/getProject)

This function gets information about one project.

~~~ js
gaas.getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.updateProject
See REST [`POST /projects/{projectID}`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/project/updateProject)

Update project contents..

~~~ js
gaas.getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.deleteProject
See REST [`DELETE /projects/{projectID}`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/project/deleteProject)

Delete a project and all translations..

~~~ js
gaas.getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.getResourceData
See REST [`GET /projects/{projectID}/{languageID}`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/project/getResourceData)

Get the data for one translation

~~~ js
gaas.getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.updateResourceData
See REST [`POST /projects/{projectID}/{languageID}`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/project/updateResourceData)

Update one key's entry

~~~ js
gaas.getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.deleteLanguage
See REST [`DELETE /projects/{projectID}/{languageID}`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/project/deleteLanguage)

Delete a target language. Source language may not be deleted.

~~~ js
gaas.getProject({
  id: "MyOtherProject",
}, function onSuccess(resp){}, function onFailure(err){});
~~~

Sample `resp`:
```
 {}
```

### gaas.getResourceEntry
See REST [`GET /projects/{projectID}/{languageID}/{resKey}`](https://gaas.stage1.mybluemix.net/translate/swagger/index.html#!/project/getResourceEntry)

Return a single key's entry

~~~ js
gaas.getProject({
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
[here](https://gaas.stage1.mybluemix.net/translate/swagger/index.html)
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

