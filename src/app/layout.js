import { Be_Vietnam_Pro, Noto_Sans_Thai, Mali, Itim, Press_Start_2P, Plus_Jakarta_Sans, Quicksand } from 'next/font/google';
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap',
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-noto-thai',
  display: 'swap',
});

const mali = Mali({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mali',
  display: 'swap',
});

const itim = Itim({
  subsets: ['latin', 'thai'],
  weight: '400',
  variable: '--font-itim',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

const pressStart2P = Press_Start_2P({
  subsets: ['latin', 'thai'],
  weight: '400',
  variable: '--font-press-start-2p',
  display: 'swap',
});

export const metadata = {
  title: "Pixel Love - สร้างเว็บไซต์บอกรักที่พิเศษที่สุด",
  description: "ส่งต่อความรู้สึกผ่านเว็บไซต์ มินิเกม และจดหมายรักดิจิทัลที่ออกแบบมาเพื่อคุณและคนพิเศษโดยเฉพาะ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className="scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link href="https://fonts.cdnfonts.com/css/google-sans" rel="stylesheet" />
      </head>
      <body className={`${notoSansThai.variable} ${beVietnamPro.variable} ${mali.variable} ${itim.variable} ${pressStart2P.variable} ${plusJakartaSans.variable} ${quicksand.variable} font-sans bg-[#f8f9fa] text-[#191c1d] antialiased`}>
        {children}
      </body>
    </html>
  );
}
