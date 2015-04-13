Simple jQuery client for GaaS
===

# What is this

This is a very preliminary client for [IBM Globalization](https://ibm.biz/BluemixGlobalization).
Try the sample out with your own app.

This ought to be a "jQuery plugin", but for now it is sample code.

# How to use the sample.

* create a project in IBM Globalization (such as `hello`). Add some resources to it including the key `hello`, add a target language of Spanish (es).     
* Get the credentials, especially the "reader key" (available in the dashboard view). Also get the service URI from the Bluemix dashboard.
* Create a file `gaas4jq-sample-config.js` as below: (modifying `api_key`, `uri` and `project` as appropriate.)

        var sampleconfig = {
          credentials: {
             api_key: '<YOUR READER KEY>',
             "uri": "https://gaas-bluemix-service.example.com/translate"
          },
          project: 'hello'
        };
         
* view the `gaas4jq-sample.html` in a browser. You should see the translation.
