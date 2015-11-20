Simple jQuery client for IBM Globalization Pipeline (beta)
===

# What is this?

This is a sample application demonstrating a  preliminary client for
[Globalization Pipeline](https://ibm.biz/BluemixGlobalization) using [jQuery](https://jquery.org/)
from a web browser.

The IBM Globalization service allows your JavaScript-based web app to dynamically load
application resources in the user's requested language.

# How to run the sample

* create a project in IBM Globalization (such as `hello`).
* Add some resources to the project, including the key `hello`, add a target language of Spanish (es).
Here is a simple `hello.properties` file which can be used:

        hello=Hello world.

You will need to create a `READER` user to be able to generate the following credentials.

* Create a file `gaas4jq-sample-config.js` as below: (modifying `api_key`, `uri` and `project` as appropriate.)

    var sampleconfig = {
    credentials: 
        { instanceId: '<instanceid>',
            userId: '<READER userid>',
            password: '<READER password>',
            url: '<uri>' },
        bundleId: 'your bundleid' };
         
* view the file `gaas4jq-sample.html` in a browser. You should see the "Hello" string translated into Spanish.

# How to use this in your application

`sampleconfig` is described above. Here is the rest of the code that your application may use:

First, construct a `Client` object given the configuration.

    var gaasClient = gaas.getClient(sampleconfig);

Next, create a `Project` object for your specific project. 

    var gaasProject = gaasClient.project(sampleconfig.project);

Finally, call the asynchronous `getResourceData` call to retrieve all of the Spanish ("`es`")
strings for your application's resource.

If `err` is not set, then `resp.data` contains all of the key/value pairs for
your application's data (such as `{ hello: "Hello World", ... }`. 

The following code uses jQuery `text()` to display the results.

    gaasProject.getResourceStrings({languageID:'es'}, function cb(err, resp) {
        if(err) { 
            $('#hello').text('ERR: ' + err.toString());
        } else {
            $('#hello').text(resp.hello);
        }
    });

# Support

You can post questions about using this service in the developerWorks Answers site
using the tag "[Globalization](https://developer.ibm.com/answers/topics/globalization/)".

# License

Apache 2.0. See [LICENSE.txt](../LICENSE.txt)
