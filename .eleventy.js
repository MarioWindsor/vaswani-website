const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy("css");
	eleventyConfig.addPassthroughCopy("media");
	eleventyConfig.addPassthroughCopy("admin");
	eleventyConfig.addPassthroughCopy("favicon.ico");
	eleventyConfig.addPassthroughCopy("js");
	eleventyConfig.addPassthroughCopy("sitemap.xml");
	eleventyConfig.addPassthroughCopy("robots.txt");

	eleventyConfig.addFilter("postDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED)
	});

};
