'use client';
import { use, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Dropdown from "@/app/components/Dropdown";
import Label from '@/app/components/Label';
import '@/app/globals.css';
import tagMappings from '@/utils/tagMappings';

export default function ImageDetail({ params }) {
  const { id } = use(params);

  // const [isLargeLoaded, setIsLargeLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(`/api/photos/${id}/small`);
  const [userAgree, setUserAgree] = useState(false);
  const [tags, setTags] = useState([]);
  const [imageWidth, setImageWidth] = useState(null);
  const imageRef = useRef();

  useEffect(() => {
    const mediumImg = new Image();
    mediumImg.src = `/api/photos/${id}/medium`;
    mediumImg.onload = () => {
      setTimeout(() => {
        setImgSrc(mediumImg.src);
        // setIsLargeLoaded(true);
        const width = imageRef.current?.clientWidth;
        setImageWidth(width);
      }, 500)
    };
  }, [id]);

  useEffect(() => {
    async function fetchTags() {
      const res = await fetch(`/api/photos/${id}/meta`);
      if (res.ok) {
        const data = await res.json();
        const { ai_info, ...rest } = data;
        const flattened = { ...rest, ...ai_info };
        setTags(flattened);
      }
    }
    fetchTags();
  }, [id]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/photos/${id}/large`;
    link.download = `photo-${id}.jpg`; // Set the default filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100vw', padding: '0 4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', width: '100%', height: '60vh' }}>
        <motion.div layoutId={`photo-${id}`} style={{ maxWidth: '75%', height: '100%', position: 'relative' }}>
          <motion.img
            src={imgSrc}
            alt={`Photo ${id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ borderRadius: '1rem', maxWidth: '100%', display: 'block', height: '100%' }}
            ref={imageRef}
          />
          <div style={{ display: 'flex', gap: '.5rem', position: 'absolute', marginTop: '1rem', flexWrap: 'wrap', width: imageWidth }}>
            {Object.entries(tags).map(([key, value]) => {
              if (key === 'country') {
                const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                return (
                  <Label
                    key={`${key}-${value}`}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="18" viewBox="0 0 13 18" fill="none">
                        <path d="M6.49992 1C3.44207 1 0.961182 3.36127 0.961182 6.26949C0.961182 9.61581 4.65367 14.9188 6.00951 16.7504C6.06579 16.8277 6.13955 16.8906 6.22478 16.934C6.31001 16.9774 6.40429 17 6.49992 17C6.59555 17 6.68983 16.9774 6.77506 16.934C6.86028 16.8906 6.93405 16.8277 6.99033 16.7504C8.34616 14.9195 12.0387 9.6185 12.0387 6.26949C12.0387 3.36127 9.55776 1 6.49992 1Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.50005 8.38512C7.51971 8.38512 8.3463 7.55853 8.3463 6.53887C8.3463 5.51922 7.51971 4.69263 6.50005 4.69263C5.4804 4.69263 4.65381 5.51922 4.65381 6.53887C4.65381 7.55853 5.4804 8.38512 6.50005 8.38512Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                    text={capitalized}
                  />
                );
              }

              if (['ai_denoise', 'ai_cleanup'].includes(key) && !value) return null;

              const lookupValue = ['ai_denoise', 'ai_cleanup'].includes(key) ? String(value) : value;
              const config = tagMappings[key]?.[lookupValue];

              if (!config) return null;
              return (
                <Label
                  key={`${key}-${value}`}
                  icon={config.icon}
                  text={config.text}
                />
              );
            })}
          </div>
        </motion.div>
        <div className="standard-border standard-blur" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', justifyContent: 'space-between', background: 'rgba(255, 255, 255, .5)', borderRadius: '1rem', width: '25%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h1 style={{ width: '100%', textAlign: 'center', fontSize: '2.25rem', fontWeight: '700' }}>Image #{id}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '400' }}>License</span>
                <Dropdown
                  text="Personal Use"
                  options={["Personal Use", "Commercial Use"]}
                />
              </div>
              <p style={{ fontSize: '.75rem', fontWeight: '400', color: '#494A4C' }}>Licensed under <a className='license-link' href='https://creativecommons.org/licenses/by-nc-nd/4.0/' target='_blank'>Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)</a>.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label htmlFor='condition' style={{ display: 'flex', gap: '1rem', alignItems: 'start', fontSize: '.875rem', fontWeight: '400' }}>
              <input
                style={{ marginTop: '.4rem', transform: 'scale(1.4)', cursor: 'pointer' }}
                type='checkbox'
                id='condition'
                name='usageAgreement'
                onChange={(e) => setUserAgree(e.target.checked)}
              />
              I agree to download the image for personal use only.
            </label>
            <motion.button
              onClick={userAgree ? handleDownload : undefined}
              style={{
                display: 'flex',
                padding: '.4rem',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '.75rem',
                borderRadius: '2rem',
                boxShadow: '0px 0px 16px 0px rgba(255, 0, 0, 0.25)',
                background: 'white',
                cursor: userAgree ? 'pointer' : 'auto',
                opacity: userAgree ? '1' : '.5'
              }}
              className='gradient-border-32'
              whileHover={userAgree && {
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={userAgree && { scale: 0.96 }}
            >
              <span style={{ fontSize: '1.6rem', fontWeight: '600' }}>Free Download</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 22 26" fill="none">
                <path d="M3.97266 25.582C2.67578 25.582 1.6875 25.2461 1.00781 24.5742C0.335938 23.9023 0 22.9258 0 21.6445V10.2305C0 8.94141 0.335938 7.96484 1.00781 7.30078C1.6875 6.62891 2.67578 6.29297 3.97266 6.29297H7.3125V8.89453H4.18359C3.66797 8.89453 3.27344 9.02734 3 9.29297C2.73438 9.55078 2.60156 9.94922 2.60156 10.4883V21.375C2.60156 21.9141 2.73438 22.3125 3 22.5703C3.27344 22.8359 3.66797 22.9688 4.18359 22.9688H17.2734C17.7812 22.9688 18.1719 22.8359 18.4453 22.5703C18.7188 22.3125 18.8555 21.9141 18.8555 21.375V10.4883C18.8555 9.94922 18.7188 9.55078 18.4453 9.29297C18.1719 9.02734 17.7812 8.89453 17.2734 8.89453H14.1445V6.29297H17.4961C18.793 6.29297 19.7773 6.62891 20.4492 7.30078C21.1289 7.96484 21.4688 8.94141 21.4688 10.2305V21.6445C21.4688 22.9258 21.1289 23.9023 20.4492 24.5742C19.7773 25.2461 18.793 25.582 17.4961 25.582H3.97266ZM10.7227 0C11.0664 0 11.3516 0.117188 11.5781 0.351562C11.8125 0.585938 11.9297 0.863281 11.9297 1.18359V12.8203L11.8359 14.5547L12.4219 13.7695L13.9805 12.1055C14.1914 11.8711 14.457 11.7539 14.7773 11.7539C15.0586 11.7539 15.3047 11.8477 15.5156 12.0352C15.7266 12.2227 15.832 12.4648 15.832 12.7617C15.832 13.043 15.7227 13.293 15.5039 13.5117L11.6602 17.2148C11.5039 17.3711 11.3477 17.4805 11.1914 17.543C11.043 17.5977 10.8867 17.625 10.7227 17.625C10.5664 17.625 10.4141 17.5977 10.2656 17.543C10.1172 17.4805 9.96094 17.3711 9.79688 17.2148L5.95312 13.5117C5.73438 13.293 5.625 13.043 5.625 12.7617C5.625 12.4648 5.72656 12.2227 5.92969 12.0352C6.14062 11.8477 6.38672 11.7539 6.66797 11.7539C6.98828 11.7539 7.25781 11.8711 7.47656 12.1055L9.04688 13.7695L9.63281 14.5547L9.52734 12.8203V1.18359C9.52734 0.863281 9.64453 0.585938 9.87891 0.351562C10.1133 0.117188 10.3945 0 10.7227 0Z" fill="black" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}