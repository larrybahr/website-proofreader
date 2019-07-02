'use strict';
const wpr = require('../index');
const path = require('path');
const assert = require('assert');
const fs = require('fs-extra');
const http = require('http');
const getPort = require('get-port');
const diff = require('deep-diff').diff;
const HTML_FILE_PATH = path.join(__dirname, './test.html');
const TEST_RESULTS_DEFAULT = path.join(__dirname, 'test-results-default.json');
const TEST_RESULTS_SPELLING = path.join(__dirname, 'test-results-spelling.json');
const TEST_RESULTS_GRAMMAR = path.join(__dirname, 'test-results-grammar.json');
const HTML_FOR_TESTING = fs.readFileSync(HTML_FILE_PATH, {
	encoding: 'utf8'
});

describe('website-proofreader', async function ()
{
	let port;
	let server;

	// Increase the timeout
	this.timeout(1 * 60 * 1000);

	before(async () =>
	{
		// create a server object:
		port = await getPort();
		server = http.createServer((req, res) =>
		{
			res.write(HTML_FOR_TESTING); //write a response to the client
			res.end(); //end the response
			return;
		}).listen(port);

		console.log('Started dev server on port ' + port);
		return;
	});

	after(async () =>
	{
		await Promise.resolve()
		.then(() =>
		{
			return new Promise((resolve) =>
			{
				server.close(resolve);
				return;
			});
		});
		return;
	});

	describe('Check() source parameter', async function ()
	{
		it('should work with a URL', async function ()
		{
			let result = await wpr.Check({
				source: 'http://127.0.0.1:' + port
			});
			let diffResult = diff(result, fs.readJsonSync(TEST_RESULTS_DEFAULT));

			assert.ok(undefined === diffResult, 'Results do not match ' + TEST_RESULTS_DEFAULT + '\n\n\nresult = \n' + JSON.stringify(result) + '\n\n\n diff = \n' + JSON.stringify(diffResult));
			return;
		});

		it('should work with HTML', async function ()
		{
			let result = await wpr.Check({
				source: HTML_FOR_TESTING
			});
			let diffResult = diff(result, fs.readJsonSync(TEST_RESULTS_DEFAULT));

			assert.ok(undefined === diffResult, 'Results do not match ' + TEST_RESULTS_DEFAULT + '\n\n\nresult = \n' + JSON.stringify(result) + '\n\n\n diff = \n' + JSON.stringify(diffResult));
			return;
		});

		it('test', async function ()
		{
			let result = await wpr.Check({
				source: '<span style="color:red">When writing, an error was made by me.</span>'
			});
			console.log(JSON.stringify(result, null, '   '));
			return;
		});
	});

	describe('Check() optional parameters', async function ()
	{
		it('should work with dictionary', async function ()
		{
			let result = await wpr.Check({
				source: HTML_FOR_TESTING,
				dictionary: ["Accedentilley"]
			});
			let diffResult = diff(result, fs.readJsonSync(TEST_RESULTS_SPELLING));

			assert.ok(undefined === diffResult, 'Results do not match ' + TEST_RESULTS_SPELLING + '\n\n\nresult = \n' + JSON.stringify(result) + '\n\n\n diff = \n' + JSON.stringify(diffResult));
			return;
		});

		it('should work with dictionary', async function ()
		{
			let result = await wpr.Check({
				source: HTML_FOR_TESTING,
				grammarChecks: {
					illusion: false
				}
			});
			let diffResult = diff(result, fs.readJsonSync(TEST_RESULTS_GRAMMAR));

			assert.ok(undefined === diffResult, 'Results do not match ' + TEST_RESULTS_GRAMMAR + '\n\n\nresult = \n' + JSON.stringify(result) + '\n\n\n diff = \n' + JSON.stringify(diffResult));
			return;
		});
	});
});
