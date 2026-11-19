import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas',
  description:
    'Mô phỏng 3D Dải Ngân Hà chuẩn NASA & ESA Gaia DR3 tỷ lệ thực 1:1 với hố đen siêu khối lượng Sagittarius A*, 48 thiên thể thực tế, điều khiển bay tự do WASD và tùy chỉnh đồ họa tự động theo phần cứng.',
  openGraph: {
    title: 'Milky Way 1:1 Observatory — NASA & Gaia DR3 Galactic Atlas',
    description:
      'Mô phỏng 3D Dải Ngân Hà chuẩn NASA & ESA Gaia DR3 tỷ lệ thực 1:1 với hố đen siêu khối lượng Sagittarius A*, 48 thiên thể thực tế và giao diện Astryx.',
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
      lang="vi"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
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
