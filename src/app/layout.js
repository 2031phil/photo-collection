import './globals.css';
import { NavHeightProvider } from './contexts/NavHeightContext';
import Navbar from './components/Navbar';
import { Suspense } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const dynamic = 'force-static';

export const metadata = {
  title: "Philip's Photo Collection",
  description: "Free Downloads of High Quality Photos. Feel free to use them as your wallpaper, in your presentations or anywhere else, as long as it’s not for a commercial purpose. For more information go to “Usage Policy”.",
  icons: {
    icon: "https://philips-photo-collection.vercel.app/favicon.ico",
    apple: "https://philips-photo-collection.vercel.app/home-screen-icon.png",
  },
  verification: {
    google: "BsABAcYkn_h57ICI1bHWohbn0DGasRUV-fPZdFLDi6k"
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body>
        <Suspense fallback={<div />}>
          <NavHeightProvider>
            <div className="background-wrapper" />
            <Navbar />
            <main>
              {children}
              <SpeedInsights />
            </main>
            <link rel="stylesheet" href="https://use.typekit.net/bzj0ibm.css" />
          </NavHeightProvider>
        </Suspense>
      </body>
    </html>
  );
}