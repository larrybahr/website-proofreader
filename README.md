# website-proofreader
Proofreads HTML for spelling and grammar mistakes.
I made this because I am a better programmer than a speller. I had many mistakes that would slip through no matter how many times I read over the code. Everyone has heard the saying "if you do not laugh you will cry". It got so bad I did both 😂. This is my ~~atempt~~ attempt to automate the correction process.

## Installation

```bash
$ npm install website-proofreader
```
## Features

* Spell checking for HTML by  NSSpellChecker, Hunspell, or the Windows Spell Check API thanks to [spellchecker](https://www.npmjs.com/package/spellchecker)
* Grammar check via [write-good](https://www.npmjs.com/package/write-good)
* Can check HTML string or URL
* Supports spelling word whitelist

## Methods

All examples assume:

```javascript
let wpr = require('website-proofreader');
```

### Check
Checks if there are on spelling/grammar errors.
```typescript
interface CheckOptions {
	 source: string; // HTML or URL to check
	 dictionary: string[]; // words to ignore in the spelling check
	 grammarChecks: Object; // {@link https://www.npmjs.com/package/write-good#checks}
}

interface CheckResults {
	 source: string; // Text that was parsed. Any error indexs are valid on this string
	 grammar: GrammarError[]; // grammar errors
	 spelling: SpellingError[]; // spelling errors
}

interface SpellingError {
    word: string; // word with the issue
	 corrections: string[]; // Possible spelling corrections
	 indexStart: number; // index the word starts at
	 indexStop: number; // index the word ends at
}

interface GrammarError {
	 corrections: string[]; // Grammar issue explained
	 indexStart: number; // index the word starts at
	 indexStop: number; // index the word ends at
}

Check(options: CheckOptions): Promise<CheckResults>
```

#### Examples

```javascript
 wpr.Check({
    source: "<p>speling is hard</p>"
 })
 .then(function (results)
 {
	 // This is true
	 results === {
       "source": "speling is hard",
       "grammar": [],
       "spelling": [
          {
             "word": "speling",
             "corrections": [
                "spelling",
                "spieling",
                "spilling",
                "spellings",
                "spewing"
             ],
             "indexStart": 0,
             "indexStop": 7
          }
   	]
    }
 });

 wpr.Check({
	 source: "<p>speling is hard</p>",
	 dictionary: ['speling'] // Add a word to the dictionary so it does not error anymore!
 })
 .then(function (results)
 {
	 // This is true
	 results === {
       "source": "speling is hard",
       "grammar": [],
       "spelling": []
    }
 });

  wpr.Check({
    source: '<span style="color:red">When writing, an error was made by me.</span>'
 })
 .then(function (results)
 {
	 // This is true
	 results === {
       "source": "speling is hard",
       "grammar": [
			 {
            "corrections": "\"was made\" may be passive voice",
            "indexStart": 23,
            "indexStop": 31
         }
		 ],
       "spelling": []
    }
 });

 wpr.Check({
	 source: '<span style="color:red">When writing, an error was made by me.</span>',
	 grammarChecks: {
		 passive: false // See https://www.npmjs.com/package/write-good#checks for all the checks
	 }
 })
 .then(function (results)
 {
	 // This is true
	 results === {
       "source": "speling is hard",
       "grammar": [],
       "spelling": []
    }
 });
```

## More Examples

For more examples, check out the [test](test) folder in the GitHub repo!

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Format code with VS Code. Add unit tests for any new or changed functionality. Lint and test your code.

## People

Author and list of all contributors can be found in [package.json](package.json)

## License

  See the [LICENSE](https://github.com/larrybahr/website-proofreader/blob/master/LICENSE) file in the repo