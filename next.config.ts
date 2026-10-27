import { securityHeaders } from './lib/security';

type FairShiftNextConfig = {
  poweredByHeader: boolean;
  outputFileTracingRoot: string;
  experimental: { optimizePackageImports: string[] };
  headers: () => Promise<Array<{ source: string; headers: typeof securityHeaders }>>;
};

const config: FairShiftNextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: securityHeaders,
    }];
  },
};

export default config;
