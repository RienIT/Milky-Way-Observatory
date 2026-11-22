import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas',
  description:
    'Continuous multi-scale WebGL2 universe viewer from Earth surface to Local Group and galaxy clusters with real astronomy-engine ephemeris, Hipparcos/Gaia DR3 stars, multi-wavelength spectroscopy, and volumetric Sagittarius A* gravitational lensing.',
  openGraph: {
    title: 'Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas',
    description:
      'Continuous multi-scale WebGL2 universe viewer from Earth surface to Local Group and galaxy clusters with real astronomy-engine ephemeris, Hipparcos/Gaia DR3 stars, multi-wavelength spectroscopy, and volumetric Sagittarius A* gravitational lensing.',
    type: 'website',
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
      className={`dark ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="bg-[#030406] text-[#ECEAE4] antialiased selection:bg-[#E88B38]/30 selection:text-[#ECEAE4] overflow-hidden"
      >
        {children}
      </body>
    </html>
  );
}
