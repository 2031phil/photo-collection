'use client';
import './page.css';
import './globals.css';
import Filter from './components/Filter';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function fetchPhotos() {
      const res = await fetch('/api/photos?limit=20&shuffle=true');
      const data = await res.json();
      setPhotos(data);
    }
    fetchPhotos();
  }, []);

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
                style={{ width: 200, margin: 10, cursor: 'pointer' }}
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}