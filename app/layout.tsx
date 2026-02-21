import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

export const metadata = {
  title: 'JourneyAI - Travel Stress-Free with Kids',
  description: 'AI-powered travel companion for Indian families',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans bg-white text-[#1A1A1A] min-h-screen">
        {children}
      </body>
    </html>
  );
}
