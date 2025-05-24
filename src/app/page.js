'use client';
import './page.css';
import Filter from './components/Filter';
import Link from 'next/link';

export default function Gallery() {
  const photos = ['cat01', 'sunset02', 'tree03'];

  return (
    <div>
      <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <h1>2031's Photo Collection</h1>
      </div>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '4rem', margin: '0 4rem' }}>
        <Filter />
        {photos.map((id) => (
          <Link key={id} href={`/photos/${id}`}>
            <img
              src={`/images/${id}.jpg`}
              alt={`Photo ${id}`}
              style={{ width: 200, margin: 10, cursor: 'pointer' }}
            />
          </Link>
        ))}
      </section>
    </div>
  );
}