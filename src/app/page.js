'use client';
import './page.css';
import './globals.css';
import Filter from './components/Filter';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import GalleryTitle from './components/GalleryTitle';
import GalleryImage from './components/GalleryImage';
import GallerySkeleton from './components/GallerySkeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function Gallery() {
  const [allPhotos, setAllPhotos] = useState([]); // All photo IDs from API
  const [page, setPage] = useState(0); // Current page for pagination (0-based)
  const [hasMore, setHasMore] = useState(true); // Whether there are more photos to load
  const [loadedImageIds, setLoadedImageIds] = useState(new Set()); // Track which images have finished loading
  const [loadingNewBatch, setLoadingNewBatch] = useState(false); // Prevent multiple simultaneous loads
  const observerRef = useRef(); // Reference for intersection observer
  const PHOTOS_PER_PAGE = 18;
  const [animatedImages, setAnimatedImages] = useState(new Set()); // Track which images have been animated
  const [currentBatchAnimated, setCurrentBatchAnimated] = useState(false); // Track if current batch is fully animated

  // Calculate which photos to show
  const visiblePhotos = allPhotos.slice(0, page * PHOTOS_PER_PAGE); // Already loaded and visible
  const currentBatch = allPhotos.slice(page * PHOTOS_PER_PAGE, (page + 1) * PHOTOS_PER_PAGE); // Current batch being loaded
  const showSkeletons = currentBatch.length > 0 && !currentBatch.every(id => loadedImageIds.has(id)); // Show skeletons if not all images in batch are loaded

  // Reset animation state when page changes
  useEffect(() => {
    setCurrentBatchAnimated(false);
  }, [page]);

  // Fetch all photo IDs on component mount
  useEffect(() => {
    async function fetchPhotos() {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setAllPhotos(data);
    }
    fetchPhotos();
  }, []);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || allPhotos.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      // Only proceed if:
      // 1. Element is intersecting
      // 2. Not currently loading a batch
      // 3. Current batch has finished animating (or no current batch)
      if (entries[0].isIntersecting && 
          !loadingNewBatch && 
          (currentBatch.length === 0 || currentBatchAnimated)) {
        
        // Check if we've reached the end
        if ((page + 1) * PHOTOS_PER_PAGE >= allPhotos.length) {
          setHasMore(false);
        } else {
          // Load next page
          setLoadingNewBatch(true);
          setPage(prev => prev + 1);
        }
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, page, allPhotos, loadingNewBatch, currentBatch.length, currentBatchAnimated]);

  // Check if current batch has finished loading
  useEffect(() => {
    if (currentBatch.length > 0 && currentBatch.every(id => loadedImageIds.has(id))) {
      setLoadingNewBatch(false); // All images in current batch are loaded
    }
  }, [loadedImageIds, currentBatch]);

  // Track when individual images finish loading
  const handleImageLoad = (photoId) => {
    setLoadedImageIds(prev => new Set([...prev, photoId]));
  };

  // Handle animation completion for current batch
  const handleAnimationComplete = (photoId) => {
    setAnimatedImages(prev => new Set([...prev, photoId]));
    
    // Check if all images in current batch have animated
    const updatedAnimatedImages = new Set([...animatedImages, photoId]);
    const currentBatchFullyAnimated = currentBatch.every(id => updatedAnimatedImages.has(id));
    
    if (currentBatchFullyAnimated && currentBatch.length > 0) {
      setCurrentBatchAnimated(true);
    }
  };

  // Show grid only when there are more than 0 photos
  if (allPhotos.length === 0) {
    return (
      <div>
        <GalleryTitle />
        <section className='vertical-container'>
          <Filter />
        </section>
      </div>
    );
  }

  return (
    <div>
      <GalleryTitle />
      <section className='vertical-container'>
        <Filter />
        <div className='gallery-grid'>
          {/* Show previously loaded and visible images */}
          {visiblePhotos.map((id) => (
            <Link key={id} href={`/photos/${id}`}>
              <GalleryImage
                id={id}
                hasAnimated={animatedImages.has(id)}
              />
            </Link>
          ))}

          {/* Current batch - show skeletons while loading, then actual images */}
          {showSkeletons ? (
            <>
              {/* Preload images invisibly while showing skeletons */}
              {currentBatch.map((id) => (
                <img
                  key={`preload-${id}`}
                  src={`/api/photos/${id}/small`}
                  alt={`Photo ${id}`}
                  onLoad={() => handleImageLoad(id)}
                  style={{ display: 'none' }}
                />
              ))}
              {/* Show skeleton loaders in place of loading images */}
              {Array.from({ length: currentBatch.length }).map((_, i) => (
                <GallerySkeleton key={`skeleton-${page}-${i}`} />
              ))}
            </>
          ) : (
            /* All images in current batch are loaded - show them */
            currentBatch.map((id, index) => (
              <Link key={id} href={`/photos/${id}`}>
                <GalleryImage
                  id={id}
                  index={index}
                  hasAnimated={animatedImages.has(id)}
                  onAnimationComplete={() => handleAnimationComplete(id)}
                />
              </Link>
            ))
          )}
        </div>
        {/* Intersection observer target for infinite scroll */}
        {hasMore && <div ref={observerRef} style={{ height: '1px', transform: 'translateY(-5rem)' }} />}
      </section>
    </div>
  );
}