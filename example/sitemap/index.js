const wpr = require('../../index');
const fs = require('fs-extra');
const path = require('path');
const getSitemapLinks = require("get-sitemap-links").default;

(async () => {
	let sitemapUrl = 'https://usgreenlink.com/sitemap.xml';
	let result;
	
	result = await TestSiteMap(sitemapUrl);
	await fs.writeJSON(path.join(__dirname, 'output.json'), result, {
		EOL: '\n',
		spaces: '   '
	});
	return;
})();

async function TestPage(url)
{
	let result = await wpr.Check({
		source: url
	});

	result.url = url;
	return result;
};

async function TestSiteMap(sitemapUrl)
{
	let results = [];
	let links = await getSitemapLinks(sitemapUrl);

	for (let index in links) {
		let link = links[index];
        console.log(`testing ${Number(index) + 1} of ${links.length}. url = ${link}`)
        results.push(await TestPage(link));
	}

	return results;
};
