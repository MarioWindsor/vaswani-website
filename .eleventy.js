const { DateTime } = require("luxon");
const eleventyImageConfig = require("./eleventy.config.images");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("css");
	eleventyConfig.addPassthroughCopy("media");
	eleventyConfig.addPassthroughCopy("admin");
	eleventyConfig.addPassthroughCopy("favicon");
	eleventyConfig.addPassthroughCopy("js");
	eleventyConfig.addPassthroughCopy("sitemap.xml");
	eleventyConfig.addPassthroughCopy("robots.txt");

	eleventyConfig.addFilter("postDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED)
	});

	eleventyConfig.addPlugin(eleventyImageConfig);

};
