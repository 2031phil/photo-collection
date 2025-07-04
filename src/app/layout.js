import './globals.css';
import { NavHeightProvider } from './contexts/NavHeightContext';
import Navbar from './components/Navbar';
import Head from 'next/head';
import { Suspense } from 'react';

export const metadata = {
  title: "Philip's Photo Collection",
  description: 'Free Downloads of High Quality Photos.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preload" href="https://use.typekit.net/lbq0rfz.css" as="style" crossorigin="anonymous" />
        <meta content="https://philips-photo-collection.vercel.app/public/opengraph.png" property="og:image" />
        <link rel="apple-touch-icon" href="public/home-screen-icon.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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