module.exports = function (eleventyConfig) {
  eleventyConfig.addShortcode("image", function (src, alt, sizes, loading = "lazy", className = "", style = "height: auto;") {
    // 1. Environment Check: Use local images in dev, wsrv.nl in production
    // NOTE: For the purpose of this test, we are forcing the 'production' logic
    // if a specific flag is set, or defaulting to local to be safe.
    // Replace 'true' with process.env.ELEVENTY_ENV === 'production' later.
    // 1. Environment Check: Use local images in dev, wsrv.nl in production
    // We check multiple flags to be safe. Netlify sets CONTEXT to 'production'.
    const isProduction = process.env.ELEVENTY_ENV === 'production' || process.env.NODE_ENV === 'production' || process.env.CONTEXT === 'production';

    if (!isProduction) {
      // Pass styles through to local images too
      return `<img src="${src}" alt="${alt}" class="${className}" loading="${loading}" style="${style}">`;
    }

    // 2. Base URL Construction
    // wsrv.nl requires a public URL. We use the GitHub raw URL.
    // Use Netlify's URL env var if available, otherwise fallback (for local dev mostly)
    const baseUrl = process.env.URL || "https://vaswani" + ".netlify.app";

    const imageUrl = `${baseUrl}${src}`;

    // 3. Define Breakpoints (Widths)
    // 800: Mobile (covers iPhone SE @ 750px, Androids @ ~720px, iPhone 12/13/14 @ ~780px)
    // 1600: Tablet / Laptop (covers High-Res Mobile, iPad, Standard Laptops 1366/1440)
    // 2400: Desktop (covers 1920px Full HD, Retina MacBook Pro)
    const widths = [800, 1600, 2400];

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
        style="${style}"
      >
    `;
  });
};
