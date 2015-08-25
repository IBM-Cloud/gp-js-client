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

var rfc822Date = require('rfc822-date');
var crypto = require('crypto');

/**
 * @author Steven R. Loomis
 */
 
var GaasHmac = function GaasHmac(name, user, secret) {
  this.name = name;
  this.secret = secret;
  this.user = user;
  if(!this.name || !this.user || !this.secret) {
    throw new Error('GaasHmac: params need to be "name,user,secret"');
  }
  this.secretBuffer = new Buffer(this.secret, this.ENC);
};


var LF = "\n";
GaasHmac.prototype.name = null;
GaasHmac.prototype.user = undefined;
GaasHmac.prototype.secret = undefined;

GaasHmac.prototype.AUTH_SCHEME = "GaaS-HMAC";
GaasHmac.prototype.SEP = ":";
GaasHmac.prototype.ENC = "ascii"; // ISO-8859-1 not supported!
GaasHmac.prototype.HMAC_SHA1_ALGORITHM =  'sha1'; // "HmacSHA1";
GaasHmac.prototype.forceDate = null;
GaasHmac.prototype.forceDateString = null;

GaasHmac.prototype.VERBOSE = process.env.GAAS_VERBOSE || false;

/**
 * ( from GaasHmac.java )
 * 
 * Generate GaaS HMAC credentials used for HTTP Authorization header.
 * Gaas HMAC uses HMAC SHA1 algorithm signing a message composed by:
 * 
 * (HTTP method)(LF)
 * (Target URL)(LF)
 * (RFC1123 date)(LF)
 * (Request Body)
 * 
 * The format for HTTP Authorization header is:
 * 
 * "Authorization: GaaS-HMAC (user ID):(HMAC above)"
 * 
 * For example, with user "MyUser" and secret "MySecret",
 * the URL "http://example.com/gaas",
 * the method "https",
 * the date "Mon, 30 Jun 2014 00:00:00 -0000",
 * the body "param=value",
 * the following text to be signed will be generated:
 *  
 *  https\n
 *  http://example.com/gaas\n
 *  Mon, 30 Jun 2014 00:00:00 -0000\n
 *  param=value
 * 
 * And the resulting header is:
 *  Authorization: GaaS-HMAC MyUser:v4ORQ81ddv7/sGJz3C/nLiGBmu0=
 */
GaasHmac.prototype.apply = function(obj, authorizations) {
  if(this.VERBOSE) console.dir(obj, {color: true, depth: null});
  var dateString = (this.forceDateString ||
                    rfc822Date(this.forceDate || new Date()));
  var bodyString = "";
  if(obj.body) {
    if((typeof obj.body) === "string") {
      bodyString = obj.body;
    } else {
      bodyString = JSON.stringify(obj.body); // === what swagger does
    }
  }
  var hmacText = obj.method + LF +
                 obj.url + LF + 
                 dateString + LF +
                 bodyString;
  if(this.VERBOSE)  console.log('hmacText = <<' + hmacText + '>>');
  //var hmacBuffer = new Buffer(hmacText, this.ENC);
  
  var hmacHash = crypto.createHmac(this.HMAC_SHA1_ALGORITHM, this.secretBuffer  )
                            .update(hmacText)
                            .digest('base64');
  if(this.VERBOSE)  console.log('hmacHash = ' + hmacHash );
  var hmacHeader = this.AUTH_SCHEME + ' ' + this.user + this.SEP + hmacHash;
  if(this.VERBOSE)  console.log('hmacHeader = ' + hmacHeader);
  obj.headers.Authorization = hmacHeader;
  return true;
};

module.exports = GaasHmac;