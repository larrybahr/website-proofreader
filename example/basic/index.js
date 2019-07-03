const wpr = require('../../index');
const fs = require('fs-extra');
const path = require('path');

(async () =>
{
	let result = await wpr.Check({
		source: 'https://lb3tech.net/'
	});

	await fs.writeJSON(path.join(__dirname, 'output.json'), result, {
		EOL: '\n',
		spaces: '   '
	});
	return;
})();