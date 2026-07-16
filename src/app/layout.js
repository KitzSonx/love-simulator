import { Mali, Itim, Press_Start_2P } from 'next/font/google';
import "./globals.css";

const mali = Mali({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mali',
});

const itim = Itim({
  subsets: ['latin', 'thai'],
  weight: '400',
  variable: '--font-itim',
});

const pressStart2P = Press_Start_2P({
  subsets: ['latin', 'thai'],
  weight: '400',
  variable: '--font-press-start-2p',
});

export const metadata = {
  title: "Love Simulator ♥ ตลับเกมของเรา",
  description: "A romantic surprise website platform for couples.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${mali.variable} ${itim.variable} ${pressStart2P.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
