/**
 * Directory data applied to every markdown file under content/.
 * - All articles use the article layout.
 * - Clean URLs derive from the front-matter slug: /<category>/<slug>/.
 * - Every article is added to the "article" tag collection implicitly via glob,
 *   but we also expose category as a tag for potential filtering.
 */
export default {
  layout: "article.njk",
  permalink: (data) => {
    if (!data.slug || !data.category) return false;
    return `/${data.category}/${data.slug}/index.html`;
  },
  eleventyComputed: {
    // Fallback nav title
    navTitle: (data) => data.navTitle || data.title
  }
};
