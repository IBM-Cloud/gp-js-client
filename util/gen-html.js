/*
 * Copyright IBM Corp. 2015,2018
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
const {promisify} = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const {name,version} = require('../package.json');
const {basename} = require('path');


// all md files
const mdfiles = readdir('.')
  .then((list) => list.filter((n) => (/\.md$/).test(n)));

const templatefn = 'util/template.html';

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
  const {templatefn} = opts;
  return readFile(templatefn, 'utf-8')
    .then((template) => new Promise((resolve /*, reject*/) => {
      const str = template.toString()
        .replace(/\${(name|version|file|data|templatefn)}/gi, (ignored,k) => opts[k] || `(unknown: ${k})`);

      return resolve(str);
    }));
}

function processFile(file) {
  const outfile = `${basename(file, '.md')}.html`;
  return readFile(file, 'utf-8')
    .then((data) => convertMarkdown({data}))
    .then((data) => insertIntoTemplate({name, version, file, data, templatefn}))
    .then((data) => writeFile(outfile, data, 'utf-8'))
    .then(() => ({ file, templatefn, outfile }));
}

function processAll(files) {
  return Promise.all(files.map((file) => processFile(file)));
}

// OK, do it
mdfiles
  .then(processAll)
  .then((res) => console.dir(res), (err) => console.error(err));