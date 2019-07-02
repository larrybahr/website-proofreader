const puppeteer = require('puppeteer');
const SpellChecker = require('spellchecker');
const writeGood = require('write-good');
const isUrl = require('is-url');

/**
 * @typedef {Object} SpellingError
 * @property {string} word word with the issue
 * @property {string[]} corrections Possible spelling corrections
 * @property {number} indexStart index the word starts at
 * @property {number} indexStop index the word ends at
 */

 /**
 * @typedef {Object} GrammarError
 * @property {string[]} corrections grammar issue explained
 * @property {number} indexStart index the word starts at
 * @property {number} indexStop index the word ends at
 */

 /**
 * @typedef {Object} CheckOptions
 * @property {string} source HTML or URL to check
 * @property {string[]} [dictionary] words to ignore in the spelling check
 * @property {Object} [grammarChecks] {@link https://www.npmjs.com/package/write-good#checks}
 */

/**
 * @typedef {Object} CheckResults
 * @property {string} source text that was parsed. Any error indexs should be valid on this string
 * @property {GrammarError[]} grammar grammar errors
 * @property {SpellingError[]} spelling spelling errors
 */

/**
 * @description Spell checks text
 * @param {string} corpus Text to be checked. Corpus = a collection of written texts, especially the entire works of a particular author or a body of writing on a particular subject. (defined by Google)
 * @param {string[]} dictionary Words to add to the dictionary
 * @return {SpellingError[]} Errors found
 */
async function SpellCheck(corpus, dictionary)
{
	let results = [];
	let spellingErrors;

	// Find all the spelling mistakes and corrections
	spellingErrors = await SpellChecker.checkSpellingAsync(corpus);
	for (let spellingError of spellingErrors)
	{
		let word = corpus.substring(spellingError.start, spellingError.end);

		// Check if this word is in the user dictionary before we consider it an error
		// NOTE: Do not use SpellChecker.add(word) because it will update the global OS dictionary and this should only affect a single run
		if (-1 !== dictionary.indexOf(word))
		{
			continue;
		}
		
		results.push({
			word: word,
			corrections: SpellChecker.getCorrectionsForMisspelling(word),
			indexStart: spellingError.start,
			indexStop: spellingError.end
		});
	}
	return results;
}

/**
 * @description Checks Grammar of text
 * @param {string} corpus Text to be checked. Corpus = a collection of written texts, especially the entire works of a particular author or a body of writing on a particular subject. (defined by Google)
 * @param {Object} grammarChecks {@link https://www.npmjs.com/package/write-good#checks}
 * @return {GrammarError[]} Grammar issues
 */
async function GrammarCheck(corpus, grammarChecks)
{
	let results = [];

	for (let grammarError of writeGood(corpus, grammarChecks))
	{
		results.push({
			corrections: grammarError.reason,
			indexStart: grammarError.index,
			indexStop: grammarError.index + grammarError.offset
		})
	}
	return results;
}

/**
 * @description Get the HTML of a page
 * @param {string} source HTML or page URL to load
 * @return {string} the page HTML
 */
async function TextFromHtmlGet(source)
{
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	let loadOptions = {
		waitUntil: 'networkidle2'
	};
	let text;

	if (isUrl(source))
	{
		await page.goto(source, loadOptions);
	}
	else
	{
		await page.setContent(source, loadOptions);
	}

	text = await page.evaluate(() =>
	{
		// Chrome is amazing. It can already get all the human readable text!
		return document.body.outerText;
	});
	await browser.close();

	return text;
}

/**
 * @description Checks if there are on spelling/grammar errors
 * @param {CheckOptions} options has all the config options
 * @return {CheckResults} results
 */
async function Check(options)
{
	let result = {};
	let tempPromiseHolder = [];

	if ('object' !== typeof options ||
		null === options)
	{
		throw new Error('options must be an object');
	}

	if ('string' !== typeof options.source)
	{
		throw new Error('options.source requires a valid URL or HTML');
	}

	if (undefined === options.dictionary)
	{
		// This is optional, but normalize this to make future code easier.
		options.dictionary = [];
	}
	if (false === Array.isArray(options.dictionary))
	{
		throw new Error('options.dictionary must be an array');
	}

	if (undefined === options.grammarChecks)
	{
		// This is optional, but normalize this to make future code easier.
		options.grammarChecks = {};
	}
	if ('object' !== typeof options.grammarChecks ||
		null === options.grammarChecks)
	{
		throw new Error('options.grammarChecks must be an object');
	}

	// Get the text from the html and do all the checks
	result.source = await TextFromHtmlGet(options.source);
	tempPromiseHolder.push(SpellCheck(result.source, options.dictionary)
		.then((spelling) =>
		{
			result.spelling = spelling;
			return;
		}));
	tempPromiseHolder.push(GrammarCheck(result.source, options.grammarChecks)
		.then((grammar) =>
		{
			result.grammar = grammar;
			return;
		}));
	await Promise.all(tempPromiseHolder);

	return result;
}

module.exports = {
	Check: Check
};
