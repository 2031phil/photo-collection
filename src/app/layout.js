import './globals.css';
import { NavHeightProvider } from './contexts/NavHeightContext';
import Navbar from './components/Navbar';
import { Suspense } from 'react';

export const dynamic = 'force-static';

export const metadata = {
  title: "Philip's Photo Collection",
  description: "Free Downloads of High Quality Photos. Feel free to use them as your wallpaper, in your presentations or anywhere else, as long as it’s not for a commercial purpose. For more information go to “Usage Policy”.",
  icons: {
    icon: "/favicon.ico",
    apple: "https://philips-photo-collection.vercel.app/home-screen-icon.png",
  },
  verification: {
    google: "BsABAcYkn_h57ICI1bHWohbn0DGasRUV-fPZdFLDi6k"
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