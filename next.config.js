/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // The site is published as plain files on a static host, so `next build`
  // writes the whole directory to out/ as HTML with no server behind it.
  output: "export",

  // Export every page as a folder with an index.html inside
  // (/texas/austin/index.html), which is what static hosts expect.
  trailingSlash: true,
};

module.exports = nextConfig;
