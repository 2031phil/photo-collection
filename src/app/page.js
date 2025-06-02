'use client';
import './page.css';
import './globals.css';
import Filter from './components/Filter';
import Link from 'next/link';
import GalleryTitle from './components/GalleryTitle';
import GalleryImage from './components/GalleryImage';
import GallerySkeleton from './components/GallerySkeleton';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Gallery() {
  const [allPhotos, setAllPhotos] = useState([]); // Array of all photo ids
  const [filteredPhotos, setFilteredPhotos] = useState([]); // Array storing filtered ids (if any filters are set)
  const [visiblePhotos, setVisiblePhotos] = useState([]); // Keeping track of visible photos on the grid
  const [loadedImages, setLoadedImages] = useState(new Set()); // Keeping track of which images have loaded during a batch load
  const [loading, setLoading] = useState(false); // Boolean that's true while images are loading
  const [hasMore, setHasMore] = useState(true); // Boolean that's true if there are more images to load
  const [allFilters, setAllFilters] = useState({}); // Object of all filter settings
  const observerRef = useRef(); // Reference for the intersection observer
  const PHOTOS_PER_PAGE = 18; // Number of photos per batch

  // Fetch all photos on mount
  useEffect(() => {
    async function fetchPhotos() {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setAllPhotos(data);
      setFilteredPhotos(data);
      loadNextBatch(data, []);
    }
    fetchPhotos();
  }, []);

  // Load next batch of photos
  const loadNextBatch = (photoList, currentVisible) => {
    if (loading) return;

    setLoading(true);
    const nextPhotos = photoList.slice(currentVisible.length, currentVisible.length + PHOTOS_PER_PAGE); // Grabs the next batch of photos that haven’t been displayed yet, based on how many are currently visible

    if (nextPhotos.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    // Add photos to visible list immediately (will show as skeletons)
    const newVisible = [...currentVisible, ...nextPhotos];
    setVisiblePhotos(newVisible);

    // Preload images
    let loadedCount = 0;
    nextPhotos.forEach(id => {
      if (loadedImages.has(id)) {
        loadedCount++;
        if (loadedCount === nextPhotos.length) {
          setLoading(false);
          setHasMore(newVisible.length < photoList.length);
        }
      } else {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, id]));
          loadedCount++;
          if (loadedCount === nextPhotos.length) {
            setLoading(false);
            setHasMore(newVisible.length < photoList.length);
          }
        };
        img.src = `/api/photos/${id}/small`;
      }
    });
  };

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadNextBatch(filteredPhotos, visiblePhotos);
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, filteredPhotos, visiblePhotos, loadedImages]);

  // Handle filter changes
  useEffect(() => {
    async function applyFilters() {
      const activeFilters = Object.entries(allFilters).filter(([_, value]) => value !== null);

      if (activeFilters.length === 0) {
        setFilteredPhotos(allPhotos);
        handleFilterChange(allPhotos);
        return;
      }

      try {
        const results = await Promise.all(
          activeFilters.map(([category, value]) =>
            fetch(`/photo-filters/${category}/${value}.json`).then(res => res.json())
          )
        );

        const filterSets = results.map(ids => new Set(ids)); // Convert filter results into Sets
        const filtered = allPhotos.filter(id => // Filter allPhotos to include only those IDs present in all sets
          filterSets.every(set => set.has(id))
        );

        setFilteredPhotos(filtered);
        handleFilterChange(filtered);
      } catch (err) {
        console.error('Error applying filters:', err);
      }
    }

    applyFilters();
  }, [allFilters, allPhotos]);

  // Handle what happens when filters change
  const handleFilterChange = (newFilteredList) => {
    // If all filters are cleared, reset to original order
    if (newFilteredList.length === allPhotos.length && newFilteredList === allPhotos) {
      const firstPage = allPhotos.slice(0, PHOTOS_PER_PAGE);
      setVisiblePhotos(firstPage);
      setHasMore(allPhotos.length > PHOTOS_PER_PAGE);
      setLoading(false);

      // Preload first page if needed
      firstPage.forEach(id => {
        if (!loadedImages.has(id)) {
          const img = new Image();
          img.onload = () => setLoadedImages(prev => new Set([...prev, id]));
          img.src = `/api/photos/${id}/small`;
        }
      });
      return;
    }

    // Find currently visible photos that match the new filter
    const matchingVisible = visiblePhotos.filter(id => newFilteredList.includes(id));

    // Calculate how many more we need for first page
    const needed = Math.min(PHOTOS_PER_PAGE, newFilteredList.length);
    const additional = newFilteredList.slice(0, needed).filter(id => !matchingVisible.includes(id));

    // Set new visible photos: matching ones first, then additional (ensure uniqueness)
    const combined = [...matchingVisible, ...additional];
    const newVisible = [...new Set(combined)].slice(0, needed);
    setVisiblePhotos(newVisible);
    setHasMore(newFilteredList.length > needed);
    setLoading(false);

    // Preload any new images
    additional.forEach(id => {
      if (!loadedImages.has(id)) {
        const img = new Image();
        img.onload = () => setLoadedImages(prev => new Set([...prev, id]));
        img.src = `/api/photos/${id}/small`;
      }
    });
  };

  if (filteredPhotos.length === 0) {
    return (
      <div className='gallery-page-container'>
        <GalleryTitle />
        <Filter onFilterChange={setAllFilters} />
      </div>
    );
  }

  return (
    <div className='gallery-page-container'>
      <GalleryTitle />
      <Filter onFilterChange={setAllFilters} />
      <motion.div className='gallery-grid' layout>
        <AnimatePresence mode="popLayout">
          {visiblePhotos.map((id, i) => (
            <motion.div
              key={id}
              layout
              layoutId={`photo-${id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                layout: { duration: 0.3, ease: "easeInOut" },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
            >
              {loadedImages.has(id) ? (
                <Link href={`/photos/${id}`}>
                  <GalleryImage id={id} index={i} />
                </Link>
              ) : (
                <GallerySkeleton />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {hasMore && (
        <div ref={observerRef} style={{ height: '1px', transform: 'translateY(-5rem)' }} />
      )}
    </div>
  );
}