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

Using
==

Create the client object as below. 
```
var gaas = require('gaas')({
     url: 'https://<address of GaaS server>/translate',
     api: '<your API key>',
     project: '<your default project name>',
});
```

The RESTful APIs can be called directly, or the simple API.
Using the simple API is recommended, however it is not YET complete.

Using Simple APIs.
==

All of the APIs have this pattern:

`gaas.function( { /*params*/ } ,  onSuccess, onFailure)`

`onSuccess()` is given an object with various contents.

`onFailure()` is called with an error message if it is an error.

APIs
===

* 


Using RESTful APIs
==

The RESTful APIs have the same pattern as the simple, except that:
* the project ID is NOT set automatically
* the API key IS set automatically.

To use the RESTful APIs, you can call like this:

```
gaas.rest_getProjectList({}, function onSuccess(resp) {
  if(resp.status !== 'success') { /* it didnt work  */ }
  else {         
     console.log('Projects:');
     console.dir(resp.projects);
  } 
}, function onFailure(err){console.log('Err:',err);}
```

You can get a list of the available APIs like this:
`console.dir(gaas.rest_help);`

More details, TBD.