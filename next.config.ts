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
  // pdf-parse (v2) pulls in pdfjs-dist, which loads a worker file at runtime.
  // Bundling them breaks that worker resolution ("Cannot find module
  // pdf.worker.mjs"). Opt them out so they run via native Node require.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],

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
