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

const marked = require('marked');
const fs = require('fs');


const ifn = 'README.md';
const ofn = 'README.html';
const tfn = 'util/template-README.html';

/**
 * Read a file, return a promise
 * @param {String} fn - the filename
 */
function readFile(fn) {
  return new Promise((resolve, reject) =>
    fs.readFile(fn, 'utf-8', (err, data) => {
      if(err) return reject(err);
      return resolve(data.toString());
    }));
}

/**
 * Write file, return promise
 * @param {Object} o 
 * @param {String} o.fn - filename
 * @param {*} o.data - stuff to write
 */
function writeFile(o) {
  return new Promise((resolve, reject) => {
    fs.writeFile(o.fn, o.data, (err) => {
      if(err) return reject(err);
      return resolve();
    });
  });
}

/**
 * Convert input to markdown, return data
 * @param {Object} opts
 * @param {String} opts.data
 */
function convertMarkdown(opts) {
  return new Promise((resolve, reject) => {
    marked(opts.data, {}, (err, content) => {
      if(err) return reject(err);
      return resolve(content);
    });
  });
}

/**
 * @param {String} opts.data - data to plugin
 * @param {String} opts.template - template file name
 * @param {Object} opts
 */
function insertIntoTemplate(opts) {
  return readFile(opts.template)
    .then((template) => new Promise((resolve /*, reject*/) => {
      const str = template.toString().replace(/@@@.*/, opts.data);
      return resolve(str);
    }));
}

// OK, now process.
readFile(ifn)
  .then((data) => convertMarkdown({data: data}))
  .then((data) => insertIntoTemplate({data: data, template: tfn}))
  .then((data) => writeFile({ fn: ofn, data: data }))
  .then(() => console.log('gen-html:', ifn, '+', tfn, '=>', ofn))
  .catch((e) => console.error(e));
