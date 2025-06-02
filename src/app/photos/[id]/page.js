'use client';
import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Dropdown from "@/app/components/Dropdown";
import '@/app/globals.css';

export default function ImageDetail({ params }) {
  const { id } = use(params);

  const [isLargeLoaded, setIsLargeLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(`/api/photos/${id}/small`);

  useEffect(() => {
    const mediumImg = new Image();
    mediumImg.src = `/api/photos/${id}/medium`;
    mediumImg.onload = () => {
      setTimeout(() => {
        setImgSrc(mediumImg.src);
        setIsLargeLoaded(true);
      }, 500)
    };
  }, [id]);

  return (
    <main style={{ width: '100vw', padding: '0 4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', width: '100%' }}>
        <motion.div layoutId={`photo-${id}`} style={isLargeLoaded ? { maxWidth: '75%', height: 'fit-content' } : { width: '75%', height: 'fit-content' }}>
          <motion.img
            src={imgSrc}
            alt={`Photo ${id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={isLargeLoaded ? { borderRadius: '1rem', maxWidth: '100%', display: 'block', maxHeight: '60vh' } : { borderRadius: '1rem', width: '100%', display: 'block', maxHeight: '60vh' }}
          />
        </motion.div>
        <div className="standard-border standard-blur" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', justifyContent: 'space-between', background: 'rgba(255, 255, 255, .5)', borderRadius: '1rem', width: '25%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h1 style={{ width: '100%', textAlign: 'center', fontSize: '2.25rem', fontWeight: '700' }}>Image #{id}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '400' }}>License</span>
                <Dropdown
                  text="Personal Use"
                  options={["Personal Use", "Commercial Use"]}
                />
              </div>
              <p style={{ fontSize: '.75rem', fontWeight: '400', opacity: '.7rem' }}>Licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '.5rem' }}>
      </div>
    </main>
  );
}