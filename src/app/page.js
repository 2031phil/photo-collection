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
  const observerRef = useRef();
  const PHOTOS_PER_PAGE = 18;

  const photos = allPhotos.slice(0, (page + 1) * PHOTOS_PER_PAGE); //Divide the whole list of photo ids into smaller chunks that can be loaded as the user scrolls down

  useEffect(() => {
    async function fetchPhotos() {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setAllPhotos(data);
    }
    fetchPhotos();
  }, []);

  // Watches out for the user scrolling down and then increases the page number if there are more photos to be loaded
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if ((page + 1) * PHOTOS_PER_PAGE >= allPhotos.length) {
          setHasMore(false);
        } else {
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
  }, [hasMore, page, allPhotos]);

  return (
    <div>
      <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <h1>2031's Photo Collection</h1>
      </div>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '4rem', margin: '0 4rem' }}>
        <Filter />
        <div className='gallery-grid'>
          {photos.map((id) => (
            <Link key={id} href={`/photos/${id}`}>
              <img
                src={`/api/photos/${id}/small`}
                alt={`Photo ${id}`}
                style={{ width: '100%', aspectRatio: '1/1', borderRadius: '.5rem', cursor: 'pointer', objectFit: 'cover' }}
              />
            </Link>
          ))}
        </div>
        {hasMore && <div ref={observerRef} style={{ height: '1px' }} />}
      </section>
    </div>
  );
}