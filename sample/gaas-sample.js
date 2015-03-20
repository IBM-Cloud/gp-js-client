//* IBM Globalization
//* IBM Confidential / Copyright (C) IBM Corp. 2015

// Configuration for the project's gaas client object
var gaas = require('../index.js')({ 
    url: process.env.GAAS_API_URL, 
    api: process.env.GAAS_API_KEY || 'admin1', 
    project: process.env.GAAS_PROJECT || 'SampleNodeProject' 
});

module.exports = gaas;
