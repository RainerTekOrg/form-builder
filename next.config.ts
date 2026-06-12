import type { NextConfig } from "next";

const allowedOriginsRaw = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || "http://localhost:*";

/**
 * Build the frame-ancestors directive from the comma/space-separated
 * ALLOWED_ORIGINS list. This is the same list that gates postMessage
 * in the bridge — keeping them in sync avoids confusion.
 *
 * CSP space-separates origins; we accept comma- or space-separated input.
 */
const frameAncestors = allowedOriginsRaw
  .split(/[\s,]+/)
  .map((s) => s.trim())
  .filter(Boolean)
  .join(" ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `frame-ancestors 'self' ${frameAncestors}`,
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
