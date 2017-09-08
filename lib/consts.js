/*
 * Copyright IBM Corp. 2015-2017
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

// some consts

/**
 * a Regex for matching the service.
 * Usage: `var credentials = require('cfEnv')
 *      .getAppEnv().getServiceCreds(gp.serviceRegex);`
 * (except that it needs to match by label)
 * @property serviceRegex
 */
exports.serviceRegex = /(gp-|g11n-pipeline).*/;

/**
 * Example credentials such as for documentation.
 * @property exampleCredentials
 */
exports.exampleCredentials = {
  url: "Globalization Pipeline URL",
  userId: "User ID",
  password: "secretpassword",
  instanceId: "your Instance ID"
};
/**
 * Example credentials string
 * @property exampleCredentialsString
 */
exports.exampleCredentialsString = "credentials: " + JSON.stringify(exports.exampleCredentials);

/**
 * Current version
 */
exports.version = "v2";
