import './globals.css';
import { AccessibilityProvider } from '@/components/AccessibilityTools';
import { DemoProvider } from '@/components/DemoProvider';

// A nonce CSP requires request-time rendering so Next.js can attach the nonce to its scripts.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'FairShift | Fair work, made visible',
  description: 'A workforce clarity prototype for shifts, pay understanding, safety voice, rest signals, and skills.',
  applicationName: 'FairShift',
  robots: { index: true, follow: true },
};

export const viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to main content</a><AccessibilityProvider><DemoProvider>{children}</DemoProvider></AccessibilityProvider></body></html>;
}
