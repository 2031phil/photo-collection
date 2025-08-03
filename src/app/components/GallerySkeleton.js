import { motion } from 'framer-motion';

export default function GallerySkeleton({ animate }) {
    return (
        <motion.div
            style={{
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: '.5rem',
                opacity: '.3',
                background: 'linear-gradient(90deg, #FFBE0B 0%, #D52941 25%, #9500FF 50%, #D52941 75%, #FFBE0B 100%)',
                backgroundSize: '300% 100%',
                animation: animate ? 'skeletonAnimation 1.5s cubic-bezier(.66,.43,.16,1) infinite' : '',
                position: animate ? 'static' : 'absolute'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.8 }}
        />
    );
}