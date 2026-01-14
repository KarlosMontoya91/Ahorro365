/** @type {import('next').NextConfig} */

// Detectamos si estamos en modo producción (deploy) o desarrollo (local)
const isProd = process.env.NODE_ENV === 'production';
const repo = "Ahorro365";

const nextConfig = {
  output: "export",
  trailingSlash: true,

  // Solo usamos el basePath cuando estemos construyendo para GitHub Pages
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",

  images: { unoptimized: true },
};

module.exports = nextConfig;