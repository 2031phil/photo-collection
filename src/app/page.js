'use client';
import './page.css';
import './globals.css';
import Filter from './components/Filter';
import GalleryTitle from './components/GalleryTitle';
import GalleryImage from './components/GalleryImage';
import GallerySkeleton from './components/GallerySkeleton';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import ImageDetailView from './components/ImageDetailView';
import { useNavHeight } from './contexts/NavHeightContext';
import { useResponsiveIconScale } from '@/utils/useResponsiveIconScale';

export default function Gallery() {

  const [allPhotos, setAllPhotos] = useState([]); // Array of all photo ids
  const [filteredPhotos, setFilteredPhotos] = useState([]); // Array storing filtered ids (if any filters are set)
  const [visiblePhotos, setVisiblePhotos] = useState([]); // Keeping track of visible photos on the grid
  const [loadedImages, setLoadedImages] = useState(new Set()); // Keeping track of which images have loaded during a batch load
  const [loading, setLoading] = useState(false); // Boolean that's true while images are loading
  const [hasMore, setHasMore] = useState(true); // Boolean that's true if there are more images to load
  const [allFilters, setAllFilters] = useState({}); // Object of all filter settings
  const [noneMatching, setNoneMatching] = useState(false);
  const [hasReturnedToGallery, setHasReturnedToGallery] = useState(false);
  const [wasImageOpen, setWasImageOpen] = useState(false);
  const [photosPerPage, setPhotosPerPage] = useState(30);
  const observerRef = useRef(); // Reference for the intersection observer
  const searchParams = useSearchParams();
  const selectedPhotoId = searchParams.get('image');
  const { navHeight } = useNavHeight();

  useResponsiveIconScale('.icons');

  // Change batch size based on vw
  useEffect(() => {
    const updatePhotosPerPage = () => {
      const width = window.innerWidth;
      if (width < 850) {
        setPhotosPerPage(10);
      } else {
        setPhotosPerPage(30);
      }
    };

    updatePhotosPerPage(); // Run on mount
    window.addEventListener('resize', updatePhotosPerPage);
    return () => window.removeEventListener('resize', updatePhotosPerPage);
  }, []);

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

  // Set some states used for managing z-index of opened photos
  useEffect(() => {
    if (selectedPhotoId) {
      setWasImageOpen(true);
    } else if (wasImageOpen) {
      // Image was open and now closed (via any method)
      setHasReturnedToGallery(true);
      setWasImageOpen(false);
    }
  }, [selectedPhotoId, wasImageOpen]);

  // Prevent scrolling while image overlay is open
  useEffect(() => {
    document.body.style.overflow = selectedPhotoId ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [selectedPhotoId]);

  // Resetting the higher z-index of the last opened image after return animation has finished
  useEffect(() => {
    if (hasReturnedToGallery) {
      const timeout = setTimeout(() => {
        setHasReturnedToGallery(false);

        // Remove elevated class from all buttons
        document.querySelectorAll('.elevated').forEach(div => {
          div.classList.remove('elevated');
        });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [hasReturnedToGallery]);

  // Load next batch of photos
  const loadNextBatch = (photoList, currentVisible) => {
    if (loading) return;

    setLoading(true);

    // Get next batch, ensuring no duplicates
    const nextPhotos = photoList
      .slice(currentVisible.length, currentVisible.length + photosPerPage)
      .filter(id => !currentVisible.includes(id)); // Extra safety against duplicates

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
  }, [hasMore, loading, filteredPhotos, visiblePhotos]);

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

        filtered.length === 0 ? setNoneMatching(true) : setNoneMatching(false);

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
      const firstPage = allPhotos.slice(0, photosPerPage);
      setVisiblePhotos(firstPage);
      setHasMore(allPhotos.length > photosPerPage);
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

    // Always start fresh with the filtered list order
    // Take the first page worth of photos from the new filtered list
    const needed = Math.min(photosPerPage, newFilteredList.length);
    const newVisible = newFilteredList.slice(0, needed);

    setVisiblePhotos(newVisible);
    setHasMore(newFilteredList.length > needed);
    setLoading(false);

    // Preload any new images that aren't already loaded
    newVisible.forEach(id => {
      if (!loadedImages.has(id)) {
        const img = new Image();
        img.onload = () => setLoadedImages(prev => new Set([...prev, id]));
        img.src = `/api/photos/${id}/small`;
      }
    });
  };

  if (filteredPhotos.length === 0 && !noneMatching) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="gallery"
          className="gallery-page-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <GalleryTitle />
          <Filter onFilterChange={setAllFilters} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (noneMatching) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="gallery"
          className="gallery-page-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <GalleryTitle />
          <Filter onFilterChange={setAllFilters} />
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: '.5' }}>
            <svg id='noPhotosIcon' xmlns="http://www.w3.org/2000/svg" width="174" height="128" viewBox="0 0 174 128" fill="none">
              <path d="M20.4779 116.517C13.7352 116.517 8.63653 114.811 5.18192 111.399C1.72731 107.988 0 102.953 0 96.2964V20.2828C0 13.6259 1.72731 8.59158 5.18192 5.17991C8.63653 1.72664 13.7352 0 20.4779 0H127.363C134.147 0 139.267 1.72664 142.721 5.17991C146.176 8.59158 147.903 13.6259 147.903 20.2828V55.3564C146.904 55.2316 145.884 55.1276 144.844 55.0444C143.845 54.9196 142.825 54.8571 141.785 54.8571C140.744 54.8571 139.704 54.9196 138.663 55.0444C137.623 55.1276 136.603 55.2524 135.604 55.4188V21.3437C135.604 18.3481 134.834 16.1014 133.294 14.6036C131.754 13.0642 129.548 12.2945 126.676 12.2945H21.2271C18.3136 12.2945 16.0868 13.0642 14.5468 14.6036C13.0484 16.1014 12.2992 18.3481 12.2992 21.3437V88.1833L29.4682 72.6436C30.7585 71.437 32.0488 70.5633 33.3391 70.0224C34.671 69.44 36.0653 69.1487 37.5221 69.1487C38.9788 69.1487 40.4148 69.4608 41.8299 70.0848C43.2867 70.6673 44.6602 71.541 45.9505 72.706L57.5005 83.1282L85.6577 57.9152C87.1145 56.667 88.6128 55.7309 90.1529 55.1068C91.6929 54.4827 93.3161 54.1707 95.0226 54.1707C96.6875 54.1707 98.3107 54.5035 99.8924 55.1692C101.516 55.7933 103.014 56.7502 104.388 58.04L113.44 66.5275C109.528 70.1889 106.427 74.5575 104.138 79.6334C101.89 84.6676 100.766 90.0764 100.766 95.8596C100.766 99.6041 101.266 103.224 102.265 106.719C103.305 110.214 104.741 113.48 106.573 116.517H20.4779ZM48.3854 59.413C45.6383 59.413 43.1202 58.7473 40.831 57.4159C38.5834 56.0845 36.7729 54.2747 35.3994 51.9863C34.0675 49.698 33.4015 47.1809 33.4015 44.4349C33.4015 41.7305 34.0675 39.2342 35.3994 36.9459C36.7729 34.6576 38.5834 32.8477 40.831 31.5163C43.1202 30.1433 45.6383 29.4569 48.3854 29.4569C51.1324 29.4569 53.6297 30.1433 55.8773 31.5163C58.1249 32.8477 59.9146 34.6576 61.2465 36.9459C62.62 39.2342 63.3068 41.7305 63.3068 44.4349C63.3068 47.1809 62.62 49.698 61.2465 51.9863C59.9146 54.2747 58.1249 56.0845 55.8773 57.4159C53.6297 58.7473 51.1324 59.413 48.3854 59.413ZM141.847 128C137.435 128 133.294 127.168 129.423 125.504C125.552 123.839 122.139 121.51 119.184 118.514C116.229 115.56 113.898 112.148 112.192 108.279C110.527 104.41 109.694 100.27 109.694 95.8596C109.694 91.4494 110.527 87.3096 112.192 83.4403C113.898 79.5709 116.229 76.1593 119.184 73.2053C122.139 70.2097 125.552 67.8797 129.423 66.2155C133.294 64.5513 137.435 63.7192 141.847 63.7192C146.259 63.7192 150.4 64.5513 154.271 66.2155C158.142 67.8797 161.555 70.1889 164.51 73.1429C167.465 76.0969 169.775 79.5293 171.44 83.4403C173.147 87.3096 174 91.4494 174 95.8596C174 100.228 173.147 104.347 171.44 108.216C169.775 112.127 167.445 115.56 164.448 118.514C161.493 121.468 158.059 123.777 154.146 125.441C150.276 127.147 146.176 128 141.847 128ZM141.785 116.766C143.408 116.766 144.781 116.226 145.905 115.144C147.029 114.062 147.591 112.731 147.591 111.15C147.591 109.569 147.029 108.216 145.905 107.093C144.823 106.011 143.45 105.471 141.785 105.471C140.203 105.471 138.85 106.011 137.727 107.093C136.603 108.175 136.041 109.527 136.041 111.15C136.041 112.731 136.603 114.062 137.727 115.144C138.85 116.226 140.203 116.766 141.785 116.766ZM141.847 101.289C143.054 101.289 144.053 100.915 144.844 100.166C145.635 99.3753 146.072 98.3767 146.155 97.1702L146.654 79.5085C146.696 78.0939 146.259 76.9498 145.343 76.0761C144.469 75.2023 143.304 74.7655 141.847 74.7655C140.349 74.7655 139.142 75.2023 138.226 76.0761C137.352 76.9498 136.936 78.0939 136.977 79.5085L137.539 97.1702C137.581 98.3767 137.997 99.3753 138.788 100.166C139.579 100.915 140.598 101.289 141.847 101.289Z" fill="black" />
            </svg>
            <span style={{ fontSize: '2rem', fontWeight: '600' }}>No photos matching these filters</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <div id='dropdown-portal'></div>
      <AnimatePresence mode="wait">
        <motion.div
          key="gallery"
          className="gallery-page-container"
          style={{ marginTop: !selectedPhotoId ? 0 : navHeight }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <GalleryTitle selectedPhotoId={selectedPhotoId} />
          <Filter onFilterChange={setAllFilters} selectedPhotoId={selectedPhotoId} />
          <motion.div
            className='gallery-grid'
            layout
            style={{ opacity: selectedPhotoId ? '0' : '1' }}
          >
            <AnimatePresence mode="popLayout">
              {visiblePhotos.map((id) => (
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
                  style={{ overflow: 'hidden', borderRadius: '.5rem', aspectRatio: '1/1', position: 'relative' }}
                  className='img-container'
                >
                  {loadedImages.has(id) ? (
                    <button
                      onClick={(e) => {
                        const button = e.currentTarget;
                        const container = button.closest('.img-container');
                        if (container) container.classList.add('elevated');

                        const url = new URL(window.location);
                        url.searchParams.set('image', id);
                        window.history.pushState({}, '', url);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      style={{ all: 'unset', cursor: 'pointer' }}
                    >
                      <GalleryImage id={id} />
                    </button>
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
          <div style={{ height: '3rem' }}></div>
          {selectedPhotoId && (
            <AnimatePresence mode="wait">
              <ImageDetailView
                id={selectedPhotoId}
              />
            </AnimatePresence>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}