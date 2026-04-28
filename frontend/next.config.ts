import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Enable Cache Components so we can use `'use cache'`, `cacheLife()`,
   * and `cacheTag()`. In Next 16, `fetch` is uncached by default and
   * caching is opt-in via this directive surface.
   */
  cacheComponents: true,

  /*
   * Custom cacheLife profiles mirror the backend Cache-Control profiles
   * (config/cache-policy.php). Keeping the windows aligned means a
   * shared CDN, the Next.js cache, and the upstream HTTP cache all
   * agree on freshness — fewer surprise refreshes, fewer surprise
   * staleness windows.
   */
  cacheLife: {
    categoryList: {
      stale: 60,
      revalidate: 60,
      expire: 180,
    },
    categoryDetail: {
      stale: 300,
      revalidate: 300,
      expire: 600,
    },
    productList: {
      stale: 60,
      revalidate: 60,
      expire: 300,
    },
    productDetail: {
      stale: 60,
      revalidate: 60,
      expire: 300,
    },
    reviewList: {
      stale: 60,
      revalidate: 60,
      expire: 180,
    },
  },
};

export default nextConfig;
