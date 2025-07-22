'use client';
import { motion } from 'framer-motion';

export default function GalleryImage({ id }) {
    return (
        <motion.img
            key={`image-${id}`}
            src={`/api/photos/${id}/small`}
            alt={`Photo ${id}`}
            initial={{ scale: 0, opacity: 0, filter: 'blur(20px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            whileHover={{
                scale: 1.04,
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
                initial: { duration: 0.4, type: 'spring' }
            }}
            style={{ width: '100%', aspectRatio: '1/1', borderRadius: '.5rem', cursor: 'pointer', objectFit: 'cover' }}
        />
    );
}