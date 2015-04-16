Testing the JavaScript Client for IBM Bluemix Globalization-as-a-Service
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

# This document describes how to test the `gaas` client code.

## Node.js - running local tests

*note:* Running the test will create and delete various translation projects in your service!
Don't run this test against an account with valuable data.

* Create and bind the IBM Globalization service in Bluemix
* view the credentials, they should look like this:

```
{
  "IBM Globalization": [
    {
      "name": "IBM Globalization-sl",
      "label": "IBM Globalization",
      "plan": "Experimental",
      "credentials": {
        "api_key": "2b9eaf03-3440-4bd4-b523-f6f3c0236fbd",
        "uri": "https://ibm-gaas-server.example.com/translate"
      }
    }
  ]
}
```

Set these as variables:
* `set GAAS_API_KEY=2b9eaf03-3440-4bd4-b523-f6f3c0236fbd`
* `set GAAS_API_URL=https://ibm-gaas-server.example.com/translate`

Optionally set `GAAS_PROJECT` to an alternate project name to use for testing,
otherwise one will be randomly chosen.

* `npm install`
* `npm test`

LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)
