module.exports = {
	layout: "layouts/project.liquid",
	eleventyComputed: {
		permalink: (data) => {
			if (data.metadata && data.metadata.disable_page) {
				return false;
			}
			// If not disabled, let 11ty handle the default permalink generation
			// Return undefined to use the default or frontmatter permalink
			return data.permalink;
		},
		eleventyExcludeFromCollections: (data) => {
			if (data.metadata && data.metadata.hide_from_listing) {
				return true;
			}
			return data.eleventyExcludeFromCollections;
		}
	}
};
