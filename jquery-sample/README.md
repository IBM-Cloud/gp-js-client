Simple jQuery client for IBM Bluemix Globalization
===

# What is this?

This is a sample application demonstrating a  preliminary client for
[IBM Globalization](https://ibm.biz/BluemixGlobalization) using [jQuery](https://jquery.org/)
from a web browser.

The IBM Globalization service allows your JavaScript-based web app to dynamically load
application resources in the user's requested language.

# How to run the sample

* create a project in IBM Globalization (such as `hello`).
* Add some resources to the project, including the key `hello`, add a target language of Spanish (es).
Here is a simple `hello.properties` file which can be used:

        hello=Hello world.

You will need the following information to configure the sample:
1. The *reader key* which is available in the dashboard view in Bluemix. 
2. The *service URI* which is part of your application's bound credentials.
3. the *project ID* which you used when you created the project.

* Create a file `gaas4jq-sample-config.js` as below: (modifying `api_key`, `uri` and `project` as appropriate.)

        var sampleconfig = {
          credentials: {
             api_key: '<YOUR READER KEY>',
             uri: '<YOUR URI>'
          },
          project: '<YOUR PROJECT>'
        };
         
* view the file `gaas4jq-sample.html` in a browser. You should see the "Hello" string translated into Spanish.

# Support

You can post questions about using this service in the developerWorks Answers site
using the tag "[Globalization](https://developer.ibm.com/answers/topics/globalization/)".

# License

Apache 2.0. See [LICENSE.txt](../LICENSE.txt)
