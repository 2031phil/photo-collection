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
import Onboarding from './components/Onboarding';

export const dynamic = 'force-static';

export default function Gallery() {

  const [allPhotos, setAllPhotos] = useState([]); // Array of all photo ids
  const [filteredPhotos, setFilteredPhotos] = useState([]); // Array storing filtered ids (if any filters are set)
  const [visiblePhotos, setVisiblePhotos] = useState([]); // Keeping track of visible photos on the grid
  const [loadedImages, setLoadedImages] = useState(new Set()); // Keeping track of which images have loaded during a batch load
  const [failedImages, setFailedImages] = useState(new Set());
  const [loading, setLoading] = useState(false); // Boolean that's true while images are loading
  const [hasMore, setHasMore] = useState(true); // Boolean that's true if there are more images to load
  const [allFilters, setAllFilters] = useState({}); // Object of all filter settings
  const [noneMatching, setNoneMatching] = useState(false);
  const [hasReturnedToGallery, setHasReturnedToGallery] = useState(false);
  const [wasImageOpen, setWasImageOpen] = useState(false);
  const [photosPerPage, setPhotosPerPage] = useState(30);
  const [shouldAnimate, setShouldAnimate] = useState(true); //Used to stop gallery container from reanimating when filters are changed
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  const observerRef = useRef(); // Reference for the intersection observer
  const searchParams = useSearchParams();
  const selectedPhotoId = searchParams.get('photo');
  const { navHeight } = useNavHeight();

  useResponsiveIconScale('.icons', failedImages);

  // Change batch size based on vw
  useEffect(() => {
    const updatePhotosPerPage = () => {
      const width = window.innerWidth;
      if (width < 850) {
        setPhotosPerPage(10);
      } else if (width > 2000) {
        setPhotosPerPage(40)
      } else {
        setPhotosPerPage(30);
      }
    };

    updatePhotosPerPage();
    window.addEventListener('resize', updatePhotosPerPage);
    return () => window.removeEventListener('resize', updatePhotosPerPage);
  }, []);

  // Fetch a shuffled list of all photos on mount
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

  // Prevent scrolling while image overlay is open or onboarding is shown
  useEffect(() => {
    const shouldBlockScroll = selectedPhotoId || !hasSeenOnboarding;
    document.body.style.overflow = shouldBlockScroll ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPhotoId, hasSeenOnboarding]);

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
    let loadedCount = 0; //Keeping track of preload attempts 
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
        img.onerror = () => {
          console.warn(`Image failed to load: ${id}`);
          setFailedImages(prev => new Set([...prev, id]));
          loadedCount++;
          if (loadedCount === nextPhotos.length) {
            setLoading(false);
            setHasMore(newVisible.length < photoList.length);
          }
        };
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

        setNoneMatching(filtered.length === 0);
        setShouldAnimate(false);
        setTimeout(() => {
          setShouldAnimate(true);
        }, 100);

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
          img.onerror = () => {
            console.warn(`Image failed to load: ${id}`);
            setFailedImages(prev => new Set([...prev, id]));
          };
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
        img.onerror = () => {
          console.warn(`Image failed to load: ${id}`);
          setFailedImages(prev => new Set([...prev, id]));
        };
      }
    });
  };

  // Determine if onboarding should be shown
  useEffect(() => {
    const seen = localStorage.getItem('seenOnboarding');
    if (!seen) {
      setHasSeenOnboarding(false);
    }
  }, []);

  const handleOnboardingClose = () => {
    localStorage.setItem('seenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  // Reload unloaded images
  const retryUnloadedImages = () => {
    const unloaded = visiblePhotos.filter(id => !loadedImages.has(id));

    if (unloaded.length === 0) return;

    let loadedCount = 0;
    setLoading(true);

    unloaded.forEach(id => {
      setFailedImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, id]));
        loadedCount++;
        if (loadedCount === unloaded.length) setLoading(false);
      };
      img.onerror = () => {
        console.warn(`Retry failed for image ${id}`);
        loadedCount++;
        if (loadedCount === unloaded.length) setLoading(false);
        setFailedImages(prev => new Set([...prev, id]));
      };
      img.src = `/api/photos/${id}/small`;
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
          transition={{ duration: 1 }}
        >
          <GalleryTitle />
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
          initial={{ opacity: shouldAnimate ? 0 : 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <GalleryTitle />
          <Filter filters={allFilters} onFilterChange={setAllFilters} />
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: '.5' }}>
            <svg id='noPhotosIcon' xmlns="http://www.w3.org/2000/svg" width="174" height="128" viewBox="0 0 174 128" fill="none">
              <path d="M20.4779 116.517C13.7352 116.517 8.63653 114.811 5.18192 111.399C1.72731 107.988 0 102.953 0 96.2964V20.2828C0 13.6259 1.72731 8.59158 5.18192 5.17991C8.63653 1.72664 13.7352 0 20.4779 0H127.363C134.147 0 139.267 1.72664 142.721 5.17991C146.176 8.59158 147.903 13.6259 147.903 20.2828V55.3564C146.904 55.2316 145.884 55.1276 144.844 55.0444C143.845 54.9196 142.825 54.8571 141.785 54.8571C140.744 54.8571 139.704 54.9196 138.663 55.0444C137.623 55.1276 136.603 55.2524 135.604 55.4188V21.3437C135.604 18.3481 134.834 16.1014 133.294 14.6036C131.754 13.0642 129.548 12.2945 126.676 12.2945H21.2271C18.3136 12.2945 16.0868 13.0642 14.5468 14.6036C13.0484 16.1014 12.2992 18.3481 12.2992 21.3437V88.1833L29.4682 72.6436C30.7585 71.437 32.0488 70.5633 33.3391 70.0224C34.671 69.44 36.0653 69.1487 37.5221 69.1487C38.9788 69.1487 40.4148 69.4608 41.8299 70.0848C43.2867 70.6673 44.6602 71.541 45.9505 72.706L57.5005 83.1282L85.6577 57.9152C87.1145 56.667 88.6128 55.7309 90.1529 55.1068C91.6929 54.4827 93.3161 54.1707 95.0226 54.1707C96.6875 54.1707 98.3107 54.5035 99.8924 55.1692C101.516 55.7933 103.014 56.7502 104.388 58.04L113.44 66.5275C109.528 70.1889 106.427 74.5575 104.138 79.6334C101.89 84.6676 100.766 90.0764 100.766 95.8596C100.766 99.6041 101.266 103.224 102.265 106.719C103.305 110.214 104.741 113.48 106.573 116.517H20.4779ZM48.3854 59.413C45.6383 59.413 43.1202 58.7473 40.831 57.4159C38.5834 56.0845 36.7729 54.2747 35.3994 51.9863C34.0675 49.698 33.4015 47.1809 33.4015 44.4349C33.4015 41.7305 34.0675 39.2342 35.3994 36.9459C36.7729 34.6576 38.5834 32.8477 40.831 31.5163C43.1202 30.1433 45.6383 29.4569 48.3854 29.4569C51.1324 29.4569 53.6297 30.1433 55.8773 31.5163C58.1249 32.8477 59.9146 34.6576 61.2465 36.9459C62.62 39.2342 63.3068 41.7305 63.3068 44.4349C63.3068 47.1809 62.62 49.698 61.2465 51.9863C59.9146 54.2747 58.1249 56.0845 55.8773 57.4159C53.6297 58.7473 51.1324 59.413 48.3854 59.413ZM141.847 128C137.435 128 133.294 127.168 129.423 125.504C125.552 123.839 122.139 121.51 119.184 118.514C116.229 115.56 113.898 112.148 112.192 108.279C110.527 104.41 109.694 100.27 109.694 95.8596C109.694 91.4494 110.527 87.3096 112.192 83.4403C113.898 79.5709 116.229 76.1593 119.184 73.2053C122.139 70.2097 125.552 67.8797 129.423 66.2155C133.294 64.5513 137.435 63.7192 141.847 63.7192C146.259 63.7192 150.4 64.5513 154.271 66.2155C158.142 67.8797 161.555 70.1889 164.51 73.1429C167.465 76.0969 169.775 79.5293 171.44 83.4403C173.147 87.3096 174 91.4494 174 95.8596C174 100.228 173.147 104.347 171.44 108.216C169.775 112.127 167.445 115.56 164.448 118.514C161.493 121.468 158.059 123.777 154.146 125.441C150.276 127.147 146.176 128 141.847 128ZM141.785 116.766C143.408 116.766 144.781 116.226 145.905 115.144C147.029 114.062 147.591 112.731 147.591 111.15C147.591 109.569 147.029 108.216 145.905 107.093C144.823 106.011 143.45 105.471 141.785 105.471C140.203 105.471 138.85 106.011 137.727 107.093C136.603 108.175 136.041 109.527 136.041 111.15C136.041 112.731 136.603 114.062 137.727 115.144C138.85 116.226 140.203 116.766 141.785 116.766ZM141.847 101.289C143.054 101.289 144.053 100.915 144.844 100.166C145.635 99.3753 146.072 98.3767 146.155 97.1702L146.654 79.5085C146.696 78.0939 146.259 76.9498 145.343 76.0761C144.469 75.2023 143.304 74.7655 141.847 74.7655C140.349 74.7655 139.142 75.2023 138.226 76.0761C137.352 76.9498 136.936 78.0939 136.977 79.5085L137.539 97.1702C137.581 98.3767 137.997 99.3753 138.788 100.166C139.579 100.915 140.598 101.289 141.847 101.289Z" fill="black" />
            </svg>
            <span id='noPhotosText'>No photos matching these filters</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      {!hasSeenOnboarding && (
        <Onboarding
          onClose={handleOnboardingClose}
        />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key="gallery"
          className="gallery-page-container"
          style={{ marginTop: !selectedPhotoId ? 0 : navHeight }}
          // initial={{ opacity: shouldAnimate ? 0 : 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <GalleryTitle selectedPhotoId={selectedPhotoId} />
          <Filter filters={allFilters} onFilterChange={setAllFilters} selectedPhotoId={selectedPhotoId} />
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
                  style={{ overflow: 'hidden', borderRadius: '1rem', aspectRatio: '1/1', position: 'relative' }}
                  className='img-container'
                >
                  {loadedImages.has(id) ? (
                    <button
                      onClick={(e) => {
                        const button = e.currentTarget;
                        const container = button.closest('.img-container');
                        if (container) container.classList.add('elevated');

                        const url = new URL(window.location);
                        url.searchParams.set('photo', id);
                        window.history.pushState({}, '', url);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      style={{ all: 'unset', cursor: 'pointer' }}
                    >
                      <GalleryImage id={id} />
                    </button>
                  ) : (
                    <>
                      {failedImages.has(id) ? (
                        <button
                          onClick={retryUnloadedImages}
                          className='retry-button'
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.25rem', color: 'white', opacity: '.8', zIndex: '2' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>RETRY</span>
                            <svg className='icons' xmlns="http://www.w3.org/2000/svg" width="18" height="21" viewBox="0 0 18 21" fill="none">
                              <path d="M17.5 10.5041C17.5 11.5465 17.3218 12.5343 16.9654 13.4675C16.609 14.3953 16.1101 15.2331 15.4686 15.9807C14.8325 16.723 14.0868 17.3397 13.2315 17.8308C12.3761 18.322 11.4468 18.6549 10.4434 18.8296V19.8938C10.4434 20.1012 10.3995 20.254 10.3118 20.3522C10.2241 20.4559 10.1089 20.505 9.96638 20.4996C9.8293 20.4996 9.684 20.4423 9.53048 20.3277L6.87397 18.4366C6.68755 18.3002 6.59434 18.1419 6.59434 17.9618C6.59982 17.7817 6.69303 17.6262 6.87397 17.4952L9.5387 15.596C9.68674 15.4868 9.8293 15.4323 9.96638 15.4323C10.1089 15.4268 10.2241 15.4759 10.3118 15.5796C10.3995 15.6778 10.4434 15.8279 10.4434 16.0299V17.1186C11.211 16.9549 11.9211 16.6738 12.5735 16.2754C13.2315 15.8716 13.8017 15.3777 14.2842 14.7937C14.7667 14.2043 15.1423 13.5467 15.411 12.8208C15.6796 12.0895 15.814 11.3173 15.814 10.5041C15.814 9.55994 15.6303 8.67581 15.2629 7.85172C14.8956 7.02218 14.3966 6.30178 13.7661 5.69054C13.5632 5.47769 13.4673 5.26758 13.4782 5.06019C13.4892 4.8528 13.5577 4.67543 13.6838 4.52808C13.8319 4.36435 14.0293 4.27157 14.276 4.24974C14.5227 4.22791 14.7475 4.32342 14.9504 4.53627C15.7345 5.28941 16.3541 6.18172 16.8091 7.21319C17.2697 8.23921 17.5 9.33618 17.5 10.5041ZM0.5 10.5041C0.5 9.4617 0.675456 8.47661 1.02637 7.54883C1.38276 6.61559 1.88171 5.77786 2.52322 5.03563C3.16473 4.28795 3.91042 3.66852 4.76028 3.17734C5.61563 2.6807 6.54499 2.34779 7.54838 2.17861V1.1062C7.54838 0.89881 7.59224 0.745999 7.67997 0.647763C7.77318 0.54407 7.88832 0.494952 8.0254 0.500409C8.16247 0.500409 8.31051 0.557714 8.46952 0.672322L11.126 2.57155C11.307 2.70799 11.3974 2.86626 11.3974 3.04636C11.3974 3.22645 11.307 3.38199 11.126 3.51298L8.4613 5.4122C8.30777 5.52135 8.16247 5.57866 8.0254 5.58411C7.88832 5.58411 7.77318 5.535 7.67997 5.43676C7.59224 5.33307 7.54838 5.18026 7.54838 4.97833V3.88955C6.78076 4.05327 6.07071 4.33706 5.41824 4.74092C4.76576 5.13932 4.19553 5.63323 3.70755 6.22265C3.22504 6.8066 2.84946 7.46424 2.58079 8.19555C2.31213 8.9214 2.17779 9.69092 2.17779 10.5041C2.17779 11.4482 2.36147 12.3351 2.72883 13.1646C3.10168 13.9887 3.60611 14.7037 4.24214 15.3095C4.43953 15.5278 4.53274 15.7406 4.52177 15.948C4.5108 16.1554 4.44227 16.33 4.31616 16.4719C4.16264 16.6356 3.96251 16.7284 3.71577 16.7503C3.46904 16.7775 3.24698 16.6848 3.04959 16.4719C2.26004 15.7188 1.63772 14.8292 1.18263 13.8032C0.727544 12.7717 0.5 11.672 0.5 10.5041Z" fill="white" />
                            </svg>
                          </div>
                          <GallerySkeleton animate={false} />
                        </button>
                      ) : (
                        <GallerySkeleton animate={true} />
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {hasMore && (
            <div ref={observerRef} style={{ height: '1px', transform: 'translateY(-10rem)' }} />
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