'use client';
import Link from "next/link";
import Pressable from "./Pressable";
import { useState, useEffect, use } from "react";
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavHeight } from "../contexts/NavHeightContext";

export default function Navbar() {
    const [currentPage, setCurrentPage] = useState('');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const hasImageParam = searchParams.has('image');
    const { navRef } = useNavHeight();

    useEffect(() => {
        if (hasImageParam) {
            setCurrentPage('');
        } else if (pathname === '/') {
            setCurrentPage('Gallery');
        } else if (pathname === '/usage-policy') {
            setCurrentPage('Usage Policy');
        } else {
            setCurrentPage('');
        }
    }, [pathname, hasImageParam]);

    return (
        <nav ref={navRef} style={{ width: '100vw', display: 'flex', padding: '2rem 4rem', alignItems: 'center', justifyContent: 'space-between', zIndex: '1100', position: hasImageParam ? 'fixed' : 'relative', top: hasImageParam ? '0' : '' }}>
            <img id="logo" src="/logo.png" alt="Site Logo" style={{ width: '4rem' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href={'/'} style={{ textDecoration: 'none', color: 'black' }}>
                    <Pressable
                        text="Gallery"
                        clicked={currentPage === 'Gallery'}
                        onClick={() => setCurrentPage('Gallery')}
                    />
                </Link>
                <Link href={'/usage-policy'} style={{ textDecoration: 'none', color: 'black' }}>
                    <Pressable
                        text="Usage Policy"
                        clicked={currentPage === 'Usage Policy'}
                        onClick={() => setCurrentPage('Usage Policy')}
                    />
                </Link>
                <a href={'https://phorlemann.vercel.app/about-me'} target="_blank" style={{ textDecoration: 'none', color: 'black' }}>
                    <Pressable
                        text="About me"
                    />
                </a>
            </div>
        </nav>
    );
}