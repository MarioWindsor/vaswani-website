module.exports = function (eleventyConfig) {
    eleventyConfig.addShortcode("image", function (src, alt, sizes, loading = "lazy", className = "") {
        // 1. Environment Check: Use local images in dev, wsrv.nl in production
        // NOTE: For the purpose of this test, we are forcing the 'production' logic
        // if a specific flag is set, or defaulting to local to be safe.
        // Replace 'true' with process.env.ELEVENTY_ENV === 'production' later.
        const isProduction = true; // FORCE ENABLE FOR TESTING

        if (!isProduction) {
            return `<img src="${src}" alt="${alt}" class="${className}" loading="${loading}">`;
        }

        // 2. Base URL Construction
        // wsrv.nl requires a public URL. We use the GitHub raw URL.
        const baseUrl = "https://raw.githubusercontent.com/MarioWindsor/vaswani-website/main";

        // Clean up the src path (remove leading slash if present)
        const cleanSrc = src.startsWith('/') ? src : '/' + src;
        const imageUrl = `${baseUrl}${cleanSrc}`;

        // 3. Define Breakpoints (Widths)
        // 500: Mobile
        // 1000: Tablet / Large Mobile
        // 1500: Desktop
        // 2500: Large Desktop / High DPI
        const widths = [500, 1000, 1500, 2500];

        // 4. Generate Srcset
        const srcset = widths.map(width => {
            return `//wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=${width}&q=80&output=webp ${width}w`;
        }).join(", ");

        // 5. Default Fallback Src (1500w)
        const defaultSrc = `//wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=1500&q=80&output=webp`;

        // 6. Return HTML
        // We strictly use the sizes attribute passed by the user. If none, default to 100vw.
        const sizesAttr = sizes ? sizes : "100vw";

        return `
      <img 
        src="${defaultSrc}"
        srcset="${srcset}"
        sizes="${sizesAttr}"
        alt="${alt}"
        class="${className}"
        loading="${loading}"
        decoding="async"
        width="1500" 
        height="auto"
        style="height: auto;"
      >
    `;
    });
};
