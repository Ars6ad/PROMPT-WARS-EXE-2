import { privateRouteHeaders, securityHeaders, type SecurityHeader } from './lib/security';

type HeaderRule = { source: string; headers: SecurityHeader[] };

type FairShiftNextConfig = {
  poweredByHeader: boolean;
  outputFileTracingRoot: string;
  experimental: { optimizePackageImports: string[] };
  headers: () => Promise<HeaderRule[]>;
};

const config: FairShiftNextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/login', headers: privateRouteHeaders },
      { source: '/worker/:path*', headers: privateRouteHeaders },
      { source: '/admin/:path*', headers: privateRouteHeaders },
    ];
  },
};

export default config;
