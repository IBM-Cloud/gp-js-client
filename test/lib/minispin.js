var txt = '/-\\|';
var len = txt.length;
var n = 0;

/**
 * Advance the spinner
 */
function dospin() {
	n++;
	process.stderr.write(txt[n%(txt.length)]+'\b');
}

/**
 * Write a space and delete. Clear the spinner
 */
function doclear() {
	process.stderr.write(' \b');
}

module.exports = {
	step: dospin,
	clear: doclear 
};