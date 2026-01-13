/** @type {import('next').NextConfig} */
const repo = "Ahorro365";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },

  ...(isProd
    ? {
        output: "export",
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
      }
    : {}),
};

module.exports = nextConfig;
