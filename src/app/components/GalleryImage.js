'use client';
import { motion } from 'framer-motion';

export default function GalleryImage({ id, index }) {
    const colCount = 6;
    const delay = ((index % colCount) + Math.floor(index / colCount)) * 0.05;

    return (
        <motion.img
            src={`/api/photos/${id}/small`}
            alt={`Photo ${id}`}
            initial={{ scale: 0, opacity: 0, filter: 'blur(20px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.1 }
            }}
            whileTap={{ scale: 0.96 }}
            transition={{
                initial: { delay: delay, duration: 0.4, type: 'spring' }
            }}
            
            style={{ width: '100%', aspectRatio: '1/1', borderRadius: '.5rem', cursor: 'pointer', objectFit: 'cover', }}
        />
    );
}