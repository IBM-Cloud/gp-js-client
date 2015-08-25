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


module.exports.getCredentials = function getCredentials() {
 return {
    // api_key: apiKeyEnv,
    uri: process.env.GAAS_API_URL || null,
    instanceId: process.env.GAAS_INSTANCE_ID || "n/a",
    userId: process.env.GAAS_ADMIN_ID || process.env.GAAS_USER_ID || null,
    password: process.env.GAAS_ADMIN_PASSWORD || process.env.GAAS_USER_PASSWORD || null
  };
};