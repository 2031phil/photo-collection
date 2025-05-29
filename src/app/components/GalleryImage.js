import { motion } from 'framer-motion';

export default function GalleryImage({ id, index, hasAnimated, onAnimationComplete }) {
    const colCount = 6;
    const delay = ((index % colCount) + Math.floor(index / colCount)) * 0.05;
    
    return (
        <motion.img
            src={`/api/photos/${id}/small`}
            alt={`Photo ${id}`}
            initial={hasAnimated ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                delay: hasAnimated ? 0 : delay,
                duration: 0.4,
                type: 'spring'
            }}
            onAnimationComplete={() => onAnimationComplete?.(id)}
            style={{ width: '100%', aspectRatio: '1/1', borderRadius: '.5rem', cursor: 'pointer', objectFit: 'cover' }}
        />
    );
}