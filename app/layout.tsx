import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas',
  description:
    'Continuous multi-scale WebGL2 universe viewer from Earth surface to Local Group and galaxy clusters with real astronomy-engine ephemeris, Hipparcos/Gaia DR3 stars, and volumetric Sagittarius A* gravitational lensing.',
  openGraph: {
    title: 'Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas',
    description:
      'Continuous multi-scale WebGL2 universe viewer from Earth surface to Local Group and galaxy clusters with real astronomy-engine ephemeris, Hipparcos/Gaia DR3 stars, and volumetric Sagittarius A* gravitational lensing.',
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
      className="dark"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="bg-[#090a0d] text-[#f3f4f6] antialiased selection:bg-[#0082fb]/35 selection:text-white overflow-hidden"
      >
        {children}
      </body>
    </html>
  );
}
