/** @type {import('next').NextConfig} */
const pagesBasePath = process.env.GITHUB_PAGES === "true" ? "/jianfeng-taste-graph" : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath,
  env: { NEXT_PUBLIC_BASE_PATH: pagesBasePath },
};

export default nextConfig;
