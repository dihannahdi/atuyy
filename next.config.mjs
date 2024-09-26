/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          // Apply these headers to all routes
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: `
                default-src 'self';
                script-src 'self' https://atuyy-nbvc59fdm-dihannahdis-projects.vercel.app/ajs-destination.bundle.js;
                style-src 'self' 'unsafe-inline';
                img-src 'self' data:;
                font-src 'self';
                connect-src 'self' https://api.trusted-source.com;
                object-src 'none';
                frame-ancestors 'none';
              `.replace(/\s{2,}/g, ' ').trim(), // Minimizes spaces in the policy string
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  