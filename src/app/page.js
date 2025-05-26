'use client';
import './page.css';
import './globals.css';
import Filter from './components/Filter';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export default function Gallery() {
  const [allPhotos, setAllPhotos] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Whether photo data has been fetched
  const [initialImagesLoaded, setInitialImagesLoaded] = useState(false); // Whether initial batch of images has loaded
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedImageIds, setLoadedImageIds] = useState(new Set());
  const observerRef = useRef();
  const PHOTOS_PER_PAGE = 18;
  
  const totalPhotosToShow = (page + 1) * PHOTOS_PER_PAGE;
  const photosToShow = allPhotos.slice(0, totalPhotosToShow);
  const visiblePhotos = allPhotos.slice(0, page * PHOTOS_PER_PAGE); // Photos that should be visible
  const newPhotos = allPhotos.slice(page * PHOTOS_PER_PAGE, totalPhotosToShow); // New photos being loaded
  const initialPhotos = allPhotos.slice(0, PHOTOS_PER_PAGE); // First batch of photos

  useEffect(() => {
    async function fetchPhotos() {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setAllPhotos(data);
      setDataLoaded(true);
    }
    fetchPhotos();
  }, []);

  // Check if initial images have loaded
  useEffect(() => {
    if (dataLoaded && initialPhotos.length > 0 && !initialImagesLoaded) {
      const allInitialImagesLoaded = initialPhotos.every(photoId => loadedImageIds.has(photoId));
      if (allInitialImagesLoaded) {
        setInitialImagesLoaded(true);
      }
    }
  }, [loadedImageIds, initialPhotos, dataLoaded, initialImagesLoaded]);

  // Watches out for the user scrolling down and then increases the page number
  useEffect(() => {
    if (!hasMore || !initialImagesLoaded) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore) {
        if ((page + 1) * PHOTOS_PER_PAGE >= allPhotos.length) {
          setHasMore(false);
        } else {
          setLoadingMore(true);
          setPage((prev) => prev + 1);
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
  }, [hasMore, page, allPhotos, initialImagesLoaded, loadingMore]);

  // Check if all new images have loaded
  useEffect(() => {
    if (loadingMore && newPhotos.length > 0) {
      const allNewImagesLoaded = newPhotos.every(photoId => loadedImageIds.has(photoId));
      if (allNewImagesLoaded) {
        setLoadingMore(false);
      }
    }
  }, [loadedImageIds, newPhotos, loadingMore]);

  const handleImageLoad = (photoId) => {
    setLoadedImageIds(prev => new Set([...prev, photoId]));
  };

  if (!dataLoaded || !initialImagesLoaded) {
    return (
      <div>
        <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <h1>2031's Photo Collection</h1>
        </div>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '4rem', margin: '0 4rem' }}>
          <Filter />
          {/* Preload initial images invisibly */}
          {dataLoaded && initialPhotos.map((id) => (
            <img
              key={`preload-initial-${id}`}
              src={`/api/photos/${id}/small`}
              alt={`Photo ${id}`}
              onLoad={() => handleImageLoad(id)}
              style={{ display: 'none' }}
            />
          ))}
          <div className='skeleton gallery-grid'>
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className='standard-blur'
                style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  borderRadius: '.5rem',
                  opacity: '.3',
                  background: 'linear-gradient(90deg, #FFBE0B 0%, #D52941 25%, #9500FF 50%, #D52941 75%, #FFBE0B 100%)',
                  backgroundSize: '300% 100%',
                  animation: 'skeletonAnimation 1.5s cubic-bezier(.66,.43,.16,1) infinite'
                }}
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <h1>2031's Photo Collection</h1>
      </div>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '4rem', margin: '0 4rem' }}>
        <Filter />
        <div className='gallery-grid'>
          {/* Show previously loaded images */}
          {visiblePhotos.map((id) => (
            <Link key={id} href={`/photos/${id}`}>
              <img
                src={`/api/photos/${id}/small`}
                alt={`Photo ${id}`}
                style={{ width: '100%', aspectRatio: '1/1', borderRadius: '.5rem', cursor: 'pointer', objectFit: 'cover' }}
              />
            </Link>
          ))}
          
          {/* Show new images only if they're all loaded, otherwise show skeletons */}
          {!loadingMore ? (
            // All new images have loaded, show them
            newPhotos.map((id) => (
              <Link key={id} href={`/photos/${id}`}>
                <img
                  src={`/api/photos/${id}/small`}
                  alt={`Photo ${id}`}
                  style={{ width: '100%', aspectRatio: '1/1', borderRadius: '.5rem', cursor: 'pointer', objectFit: 'cover' }}
                />
              </Link>
            ))
          ) : (
            // Still loading new images, show skeletons and hidden images for preloading
            <>
              {newPhotos.map((id) => (
                <img
                  key={`preload-${id}`}
                  src={`/api/photos/${id}/small`}
                  alt={`Photo ${id}`}
                  onLoad={() => handleImageLoad(id)}
                  style={{ display: 'none' }}
                />
              ))}
              {Array.from({ length: newPhotos.length }).map((_, i) => (
                <div
                  key={`skeleton-${page}-${i}`}
                  className='standard-blur'
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    borderRadius: '.5rem',
                    opacity: '.3',
                    background: 'linear-gradient(90deg, #FFBE0B 0%, #D52941 25%, #9500FF 50%, #D52941 75%, #FFBE0B 100%)',
                    backgroundSize: '300% 100%',
                    animation: 'skeletonAnimation 1.5s cubic-bezier(.66,.43,.16,1) infinite'
                  }}
                />
              ))}
            </>
          )}
        </div>
        {hasMore && <div ref={observerRef} style={{ height: '1px' }} />}
      </section>
    </div>
  );
}