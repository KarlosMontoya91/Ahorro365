/** @type {import('next').NextConfig} */
const repo = "Ahorro365";

const nextConfig = {
  output: "export",
  trailingSlash: true,

  // Para que rutas/assets funcionen en /Ahorro365
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,

  // Importante en GitHub Pages (no hay optimizador de imágenes server-side)
  images: { unoptimized: true },
};

module.exports = nextConfig;
