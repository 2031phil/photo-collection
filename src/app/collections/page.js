'use client';
import '@/app/page.css';
import '@/app/globals.css';
import './page.css';
import { useResponsiveIconScale } from '@/utils/useResponsiveIconScale';
import { motion } from 'framer-motion';
import CollectionCard from '../components/CollectionCard';

export default function Collections() {
    useResponsiveIconScale('.icons');

    return (
        <motion.div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginBottom: '4rem', padding: '0 3rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <h1>Collections</h1>
            <div className='grid'>
                <CollectionCard
                    title="Svalbard"
                    date="November 2025"
                    numberOfImages="41"
                    thumbnailId="1036"
                    link="svalbard"
                />
                <CollectionCard
                    title="Uzbekistan"
                    date="March 2024"
                    numberOfImages="71"
                    thumbnailId="1082"
                    link="uzbekistan"
                />
            </div>
        </motion.div>
    )
}