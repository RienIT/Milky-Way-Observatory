import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#FA500F',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  ),
  title: 'Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas',
  description:
    'Continuous multi-scale WebGL2 universe viewer from Earth surface to Local Group and galaxy clusters with real astronomy-engine ephemeris, Hipparcos/Gaia DR3 stars, multi-wavelength spectroscopy, and volumetric Sagittarius A* gravitational lensing.',
  applicationName: 'Milky Way Observatory',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/logo.jpg', type: 'image/jpeg', sizes: '512x512' },
    ],
    shortcut: '/icon.svg',
    apple: [{ url: '/logo.jpg', sizes: '180x180', type: 'image/jpeg' }],
  },
  openGraph: {
    title: 'Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas',
    description:
      'Continuous multi-scale WebGL2 universe viewer from Earth surface to Local Group and galaxy clusters with real astronomy-engine ephemeris, Hipparcos/Gaia DR3 stars, multi-wavelength spectroscopy, and volumetric Sagittarius A* gravitational lensing.',
    type: 'website',
    siteName: 'Milky Way Observatory',
    images: [
      {
        url: '/og-banner.jpg',
        width: 1408,
        height: 768,
        alt: 'Milky Way 1:1 Observatory — Sunset Horizon & Galactic Atlas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas',
    description:
      'Continuous multi-scale WebGL2 universe viewer from Earth surface to Local Group and galaxy clusters with real astronomy-engine ephemeris, Gaia DR3 stars, and volumetric Sagittarius A* lensing.',
    images: ['/og-banner.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`dark ${playfairDisplay.variable} ${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="bg-[#030406] text-[#F5F2EB] antialiased selection:bg-[#FA500F]/30 selection:text-[#FFF8E7] overflow-hidden"
      >
        {children}
      </body>
    </html>
  );
}
