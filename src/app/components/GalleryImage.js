'use client';
import { motion } from 'framer-motion';

export default function GalleryImage({ id }) {
    return (
        <motion.img
            key={`image-${id}`}
            src={`/api/photos/${id}/small`}
            loading='lazy'
            decoding='async'
            alt={`Photo ${id}`}
            initial={{ scale: 0.25, opacity: 0.25, filter: 'blur(20px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            whileHover={{
                scale: 1.04,
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
                initial: { duration: 0.4, type: 'spring' }
            }}
            style={{ width: '100%', aspectRatio: '1/1', borderRadius: '1rem', cursor: 'pointer', objectFit: 'cover' }}
        />
    );
}