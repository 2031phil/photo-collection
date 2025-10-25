'use client';
import Link from "next/link";
import Pressable from "./Pressable";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavHeight } from "../contexts/NavHeightContext";

export default function Navbar() {
    const [currentPage, setCurrentPage] = useState('');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const hasImageParam = searchParams.has('photo');
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
        <nav ref={navRef} style={{ position: hasImageParam ? 'fixed' : 'relative', top: hasImageParam ? '0' : '' }}>
            <Link id="monogramContainer" href={'/'}>
                <svg id="monogram" xmlns="http://www.w3.org/2000/svg" width="601" height="348" viewBox="0 0 601 348" fill="none">
                    <g filter="url(#filter0_i_165_213)">
                        <path d="M252.003 0.254639V136.553H349.731V0.254639H434.072V136.179H478.755C565.542 136.179 600.867 184.018 600.867 244.279C600.867 304.541 565.542 347.746 478.755 347.746H349.731V210.901H252.003V347.746H167.662V211.82H122.979C36.1921 211.82 0.866455 163.982 0.866455 103.72C0.866598 43.4591 36.1922 0.254639 122.979 0.254639H252.003ZM434.072 276.645H476.139C504.486 276.645 515.389 263.788 515.389 244.279C515.389 224.77 504.486 211.913 476.139 211.913H434.072V276.645ZM125.595 71.3542C97.2477 71.3543 86.3451 84.2115 86.345 103.72C86.345 123.23 97.2476 136.087 125.595 136.087H167.662V71.3542H125.595Z" fill="url(#paint0_linear_165_213)" />
                    </g>
                    <defs>
                        <filter id="filter0_i_165_213" x="0.866455" y="0.254639" width="619.858" height="367.348" filterUnits="userSpaceOnUse">
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                            <feOffset dx="19.8566" dy="19.8566" />
                            <feGaussianBlur stdDeviation="19.8566" />
                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                            <feColorMatrix type="matrix" values="0 0 0 0 0.473145 0 0 0 0 0.0875239 0 0 0 0 0.0875239 0 0 0 0.25 0" />
                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_165_213" />
                        </filter>
                        <linearGradient id="paint0_linear_165_213" x1="127.122" y1="0.254644" x2="474.613" y2="347.745" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FFBE0B" />
                            <stop offset="0.5" stopColor="#D52941" />
                            <stop offset="1" stopColor="#9500FF" />
                        </linearGradient>
                    </defs>
                </svg>
            </Link>
            <div>
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