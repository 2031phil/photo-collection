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
            <svg style={{ width: '4rem', height: '4rem' }} xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 600 348" fill="none">
                <path fillRule="evenodd" clipRule="evenodd"
                    d="M122.112 211.565H166.795V347.49H251.136V210.646H348.864V347.49H349.807H433.204H477.888C564.675 347.49 600 304.286 600 244.024C600 183.763 564.675 135.925 477.888 135.925H433.204V0H348.864V136.299H251.136V0H250.193H166.795H122.112C35.3251 0 0 43.2046 0 103.466C0 163.728 35.3251 211.565 122.112 211.565ZM166.795 71.0998H124.728C96.381 71.0998 85.4781 83.957 85.4781 103.466C85.4781 122.975 96.381 135.832 124.728 135.832H166.795V71.0998ZM433.204 276.391V211.658H475.272C503.619 211.658 514.522 224.515 514.522 244.024C514.522 263.533 503.619 276.391 475.272 276.391H433.204Z"
                    fill="black" />
            </svg>
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