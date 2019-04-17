Globalization Pipeline CLI
==========================

- back to [README.md](README.md)

The GP Command Line interface is modelled somewhat on the [GP Java CLI](https://github.com/IBM-Cloud/gp-java-tools/blob/master/gp-cli/README.md).

Installation
--

You can use the GP CLI to perform some operations from the commandline.

    $ npm install -g g11n-pipeline
    $ g11n-pipeline -j gpconfig.json ping
    true

Using `npx` you do not even need to install g11n-pipeline to run a one-off command.

    $ npx g11n-pipeline -j gpconfig.json ping
    true

Usage
--

The CLI takes one 'verb' (action) which can appear anywhere in the command line.
Options have a short or a long form. Therefore, the following are all equivalent.

```shell
    g11n-pipeline -j gpconfig.json ping
    g11n-pipeline ping -j gpconfig.json
    g11n-pipeline --jsonCredentials=gpconfig.json ping
    g11n-pipeline ping --jsonCredentials=gpconfig.json
```

Credentials
--

See also the [`getClient()` API docs](./API.md#getClient)
Credentials may be passed in one of the following ways:

1. Via the `-j/--jsonCreds` option, which takes a path to a JSON file with credentials
2a. For GP Auth: the four individual options `--serviceUrl`, `--instanceId`, `--user`, and `--password`
2b. for IAM auth via `--iam_endpoint` and `--apikey`
3. By the following environment variables:

    * __GP_URL__: Service URL (e.g. https://gp-rest.ng.bluemix.net/translate/rest)
    * __GP_INSTANCE_ID__: Service instance ID (e.g. d3f537cd617f34c86ac6b270f3065e73)

    - _if using GP Authentication_:

        * __GP_USER_ID__: User ID (e.g. e92a1282a0e4f97bec93aa9f56fdb838)
        * __GP_PASSWORD__: User password (e.g. zg5SlD+ftXYRIZDblLgEA/ILkkCNqE1y)

    - _if using IAM Authentication_:

        * __GP_IAM_API_KEY__: IAM API Key
        * __GP_IAM_ENDPOINT__: IAM endpoint (e.g. https://iam.cloud.ibm.com)

Common Options
--

- `-j file.json` | `--jsonCredentials=file.json`

    See [Credentials](#Credentials), above.

    This option specifies a credentials file containing the [GP credentials](https://github.com/IBM-Cloud/gp-common/blob/master/README.md#4-credentials). This is a JSON file with any of the following formats:
    
    ```json
    {"url":"≈",
     "instanceId":"≈",
     "userId":"≈",
     "password":"≈"}
    ```
    
    ```json
    {"credentials":
       {"url":"≈",
        "instanceId":"≈",
        "userId":"≈",
        "password":"≈"}}
    ```
    
    ```json
    {"url":"≈",
     "instanceId":"≈",
     "iam_endpoint":"≈",
     "apikey":"≈"}
    ```
    
    ```json
    {"credentials":
       {"url":"≈",
        "instanceId":"≈",
        "iam_endpoint":"≈",
        "apikey":"≈"}}
    ```

- `--serviceUrl`, `--instanceId`, `--user`, `--password`

    See [Credentials](#Credentials), above.
    These options specify the four credential parameters individually for GP Auth.

- `--iam_endpoint`, `--apikey`

    See [Credentials](#Credentials), above.
    These options specify the two credential parameters individually for IAM Auth.

- `-F json` | `--outputFormat=json`

    This option specifies the eventual output format of the results of the CLI operation.
    (API note: This formatting is applied by the `filter()` function. `run()` does not interpret this option.)

    Possible formats:

    - `compact` (default)

        This format causes `console.dir()` to be used for output. It is more compact than JSON.

    - `json`

        Produce JSON output.

    - `none`

        Don’t produce any output (besides errors).

    - `line`

        Output in line-by-line mode, which could be useful for processing without parsing JSON:

        - For operations that return an array (such as `list`), output the array one element per line.

        - For operations that return an object (such as `trs`), outputs the keys one element per line.

Verbs
--

### General Commands

- `help`

    Print help 

- `ping`

    Indicate whether the server is reachable or not.

- `info`

    Prints general info about the GP service

- `instanceInfo`

    Prints information specific to your service instance (such as usage)


### Bundle Commands

- `list`

    Return a list of bundles

- `show -b mybundle`

    Show detailed information about `mybundle`

- `create -b mybundle -l en,es,fr`

    Create bundle `mybundle` with source lang `en` and target languages `es` and `fr`. (The first language code is the source.)

- `delete -b mybundle`

    Delete bundle `mybundle`

- `update -b mybundle -l es,fr,mt`

    Update bundle `mybundle` to have target languages `es`, `fr` and `mt`

- `import -b mybundle -l en -f mybundle.json`

    Import `mybundle.json` to replace the `en` language content for bundle `mybundle`.
    
    For nested structure, use the `-T` option to flatten the keys using the [g11n-pipeline-flatten](https://github.com/IBM-Cloud/gp-js-flatten#usage) component.

- `export -b mybundle -l en -F json > mybundle.json`

    Export bundle `mybundle` to disk as `mybundle.json`
    
    For nested structure, use the `-T` option to expand the keys using the [g11n-pipeline-flatten](https://github.com/IBM-Cloud/gp-js-flatten#usage) component.

### Translation Request Commands

- `trs`

    List the Translation Requests

- `docTrs`

    List the Document Translation Requests

### 

API
--

The Command Line may be called from your own application code. The `run()` function
returns a promise containing the output content. See [API.md#Cli](API.md#Cli)

```js
// from a script (parse args)
const Cli = require('g11n-pipeline/lib/gpcli');
new Cli(Cli.parseArgs(process.argv)).run().then(…)
```

You can also preload the arguments:

```js
const Cli = require('g11n-pipeline/lib/gpcli');
new Cli({_:['list'],jsonCreds:'creds.json'}).run().then((r) => console.dir(r));
```


Community
==
* View or file GitHub [Issues](https://github.com/IBM-Cloud/gp-js-client/issues)
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
