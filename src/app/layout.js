import './globals.css';
import { NavHeightProvider } from './contexts/NavHeightContext';
import Navbar from './components/Navbar';
import { Suspense } from 'react';

export const dynamic = 'force-static';

export const metadata = {
  title: "Philip's Photo Collection",
  description: "Free Downloads of High Quality Photos.",
  // openGraph: {
  //   title: "Philip's Photo Collection",
  //   description: "Free Downloads of High Quality Photos.",
  //   url: "https://philips-photo-collection.vercel.app/",
  //   siteName: "Philip's Photo Collection",
  //   images: [
  //     {
  //       url: "https://philips-photo-collection.vercel.app/opengraph.png",
  //       width: 1200,
  //       height: 630,
  //       alt: "Gallery preview",
  //     },
  //   ],
  //   type: "website",
  // },
  icons: {
    icon: "/favicon.ico",
    apple: "https://philips-photo-collection.vercel.app/home-screen-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div />}>
          <NavHeightProvider>
            <div className="background-wrapper" />
            <Navbar />
            <main>
              {children}
            </main>
            <link rel="stylesheet" href="https://use.typekit.net/lbq0rfz.css" />
          </NavHeightProvider>
        </Suspense>
      </body>
    </html>
  );
}