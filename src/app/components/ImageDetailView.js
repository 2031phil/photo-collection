'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Selector from '@/app/components/Selector';
import Label from '@/app/components/Label';
import tagMappings from '@/utils/tagMappings';
import '@/app/globals.css';
import Pressable from '@/app/components/Pressable';
import { useResponsiveIconScale } from '@/utils/useResponsiveIconScale';

// Capitalization helper
const capitalize = (text) =>
  typeof text === 'string'
    ? text.toLowerCase() === 'usa'
      ? 'USA'
      : text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : text;

const formatAltSentence = (label, value) => value ? `${label}: ${capitalize(value)}` : null;

export default function ImageDetailView({ id }) {
  const [imgSrc, setImgSrc] = useState(`/api/photos/${id}/small`);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [userAgree, setUserAgree] = useState(false);
  const [tags, setTags] = useState([]);
  const [imageWidth, setImageWidth] = useState(null);
  const [license, setLicense] = useState(0);
  const [hasContainerAnimated, setHasContainerAnimated] = useState(false);
  const imageRef = useRef();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPhotoId = searchParams.get('photo');
  const activePhotoId = queryPhotoId || id;
  useEffect(() => {
    router.prefetch('/gallery');
  }, [router]);

  useResponsiveIconScale('.icons', tags);

  useEffect(() => {
    setTimeout(() => {
      setHasContainerAnimated(true);
    }, 1000);
  }, []);

  useEffect(() => {
    // Reset loading state when activePhotoId changes
    setIsImageLoaded(false);
    const smallImageSrc = `/api/photos/${activePhotoId}/small`;
    setImgSrc(smallImageSrc);

    // Check if image is already cached/loaded
    const img = new Image();
    img.onload = () => {
      setIsImageLoaded(true);
    }

    img.src = smallImageSrc;

    // If image is already complete (cached), set loaded immediately
    if (img.complete && img.naturalHeight !== 0) {
      setIsImageLoaded(true);
    }

    const mediumImg = new Image();
    mediumImg.fetchPriority = 'high';
    mediumImg.src = `/api/photos/${activePhotoId}/medium`;
    mediumImg.onload = () => {
      setTimeout(() => {
        setImgSrc(mediumImg.src);
        const width = imageRef.current?.clientWidth;
        setImageWidth(width);
      }, 500)
    };
  }, [activePhotoId]);

  useEffect(() => {
    async function fetchTags() {
      const res = await fetch(`/api/photos/${activePhotoId}/meta`);
      if (res.ok) {
        const data = await res.json();
        const { ai_info, ...rest } = data;
        const flattened = { ...rest, ...ai_info };
        setTags(flattened);
      }
    }
    fetchTags();
  }, [activePhotoId]);

  const handleDownload = async () => {
    try {
      await fetch(`/api/downloads/${activePhotoId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error recording download:', error);
    }

    const link = document.createElement('a');
    link.href = `/api/photos/${activePhotoId}/large`;
    link.download = `photo-${activePhotoId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const altDescription = [
    `Photo #${activePhotoId}`,
    tags.country && `Taken in ${capitalize(tags.country)}`,
    formatAltSentence('Environment', tags.environment),
    formatAltSentence('Time of day', tags.time_of_day)
  ].filter(Boolean).join('. ');

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className='detail-view-container'
    >
      <div className='image-and-license-container' style={{ opacity: isImageLoaded ? '1' : '0' }}>
        <motion.div
          key={activePhotoId}
          layout
          layoutId={`photo-${activePhotoId}`}
          className='image-container'
        >
          <div style={{ width: 'fit-content', position: 'absolute', top: '-3.6rem' }}>
            <Pressable
              icon={
                <svg className='icons' xmlns="http://www.w3.org/2000/svg" width="15" height="13" viewBox="0 0 15 13" fill="none">
                  <path d="M0 6.5C0 6.29947 0.083468 6.12269 0.250404 5.96966L5.59774 0.737467C5.6839 0.653034 5.77006 0.592348 5.85622 0.555409C5.94777 0.51847 6.042 0.5 6.13893 0.5C6.33818 0.5 6.50512 0.565963 6.63974 0.697889C6.77975 0.824538 6.84976 0.985488 6.84976 1.18074C6.84976 1.27573 6.83091 1.36807 6.79322 1.45778C6.7609 1.54222 6.71244 1.61609 6.64782 1.67942L4.83845 3.48417L1.63974 6.3496L1.47011 5.95383L4.07108 5.79551H14.2892C14.4992 5.79551 14.6688 5.86148 14.7981 5.9934C14.9327 6.12533 15 6.2942 15 6.5C15 6.7058 14.9327 6.87467 14.7981 7.0066C14.6688 7.13852 14.4992 7.20449 14.2892 7.20449H4.07108L1.47011 7.04617L1.63974 6.65831L4.83845 9.51583L6.64782 11.3206C6.71244 11.3839 6.7609 11.4604 6.79322 11.5501C6.83091 11.6346 6.84976 11.7243 6.84976 11.8193C6.84976 12.0145 6.77975 12.1755 6.63974 12.3021C6.50512 12.434 6.33818 12.5 6.13893 12.5C5.94507 12.5 5.77006 12.4261 5.61389 12.2784L0.250404 7.03034C0.083468 6.87731 0 6.70053 0 6.5Z" fill="black" />
                </svg>
              }
              text="Back"
              onClick={() => {
                if (
                  (typeof document !== 'undefined' && document.referrer && document.referrer.includes('/gallery')) ||
                  (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.origin + '/gallery'))
                ) {
                  router.back();
                } else {
                  router.push('/', { shallow: true, scroll: false });
                }
              }}
            />
          </div>
          <motion.img
            src={imgSrc}
            alt={altDescription}
            className='detail-image'
            ref={imageRef}
            fetchPriority="high"
          />
          <div className='tag-container' style={{ width: imageWidth }}>
            {Object.entries(tags).map(([key, value]) => {
              if (key === 'country') {
                return (
                  <AnimatePresence key={`${key}-${value}`}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Label
                        key={`${key}-${value}`}
                        icon={
                          <svg className='icons' xmlns="http://www.w3.org/2000/svg" width="13" height="18" viewBox="0 0 13 18" fill="none">
                            <path d="M6.49992 1C3.44207 1 0.961182 3.36127 0.961182 6.26949C0.961182 9.61581 4.65367 14.9188 6.00951 16.7504C6.06579 16.8277 6.13955 16.8906 6.22478 16.934C6.31001 16.9774 6.40429 17 6.49992 17C6.59555 17 6.68983 16.9774 6.77506 16.934C6.86028 16.8906 6.93405 16.8277 6.99033 16.7504C8.34616 14.9195 12.0387 9.6185 12.0387 6.26949C12.0387 3.36127 9.55776 1 6.49992 1Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6.50005 8.38512C7.51971 8.38512 8.3463 7.55853 8.3463 6.53887C8.3463 5.51922 7.51971 4.69263 6.50005 4.69263C5.4804 4.69263 4.65381 5.51922 4.65381 6.53887C4.65381 7.55853 5.4804 8.38512 6.50005 8.38512Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        }
                        text={capitalize(value)}
                      />
                    </motion.div>
                  </AnimatePresence>
                );
              }

              if (['ai_denoise', 'ai_cleanup'].includes(key) && !value) return null;

              const lookupValue = ['ai_denoise', 'ai_cleanup'].includes(key)
                ? String(value)
                : value.toLowerCase().replace(/ /g, '_');
              const config = tagMappings[key]?.[lookupValue];

              if (!config) return null;
              return (
                <AnimatePresence key={`${key}-${value}`}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Label
                      icon={config.icon}
                      text={config.text}
                    />
                  </motion.div>
                </AnimatePresence>
              );
            })}
          </div>
        </motion.div>
        <AnimatePresence mode='wait'>
          <motion.div
            className="standard-border standard-blur license-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <h1 style={{ width: '100%', textAlign: 'center', fontSize: '2.25rem', fontWeight: '700' }}>Photo #{activePhotoId}</h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '400' }}>License</span>
                  <Selector
                    text="Personal Use"
                    options={["Personal Use", "Commercial Use"]}
                    onSelect={setLicense}
                  />
                </div>
                <AnimatePresence mode='wait'>
                  {license === 0 ? (
                    <motion.p
                      key="personal-license"
                      style={{ fontSize: '.75rem', fontWeight: '400', color: '#494A4C' }}
                      initial={hasContainerAnimated ? { opacity: 0, scale: 0.95 } : null}
                      animate={hasContainerAnimated ? { opacity: 1, scale: 1 } : null}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                    >
                      Licensed under <a className='license-link' href='https://creativecommons.org/licenses/by-nc-nd/4.0/' target='_blank'>Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)</a>.
                    </motion.p>
                  ) : (
                    <motion.div
                      key="commercial-license"
                      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                        <span style={{ fontWeight: '600', lineHeight: '130%' }}>This photo is available for commercial use under a custom license.</span>
                        <p style={{ color: '#494A4C', fontWeight: '400', fontSize: '.75rem' }}>To obtain rights for use in advertising, publications, products, or other commercial media, you must purchase a commercial license.</p>
                      </div>
                      <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '.75rem', color: '#494A4C', fontWeight: '400' }}>License Type:</span>
                            <span style={{ fontSize: '.75rem', fontWeight: '500' }}>Custom Commercial License</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '.75rem', color: '#494A4C', fontWeight: '400' }}>Terms:</span>
                            <span style={{ fontSize: '.75rem', fontWeight: '500' }}>Non-exclusive / Use-based rights</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <AnimatePresence mode='wait'>
              {license === 0 ? (
                <motion.div
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  initial={hasContainerAnimated ? { opacity: 0 } : null}
                  animate={hasContainerAnimated ? { opacity: 1 } : null}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label htmlFor='condition' style={{ display: 'flex', gap: '1rem', alignItems: 'start', fontSize: '.875rem', fontWeight: '400' }}>
                    <input
                      style={{ marginTop: '.3rem', transform: 'scale(1.4)', cursor: 'pointer' }}
                      type='checkbox'
                      id='condition'
                      name='usageAgreement'
                      checked={userAgree}
                      onChange={(e) => setUserAgree(e.target.checked)}
                    />
                    I agree to download this photo for personal use only.
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
                    whileTap={userAgree && { scale: 0.98 }}
                  >
                    <span style={{ fontSize: '1.6rem', fontWeight: '600', color: 'black' }}>Free Download</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 22 26" fill="none">
                      <path d="M3.97266 25.582C2.67578 25.582 1.6875 25.2461 1.00781 24.5742C0.335938 23.9023 0 22.9258 0 21.6445V10.2305C0 8.94141 0.335938 7.96484 1.00781 7.30078C1.6875 6.62891 2.67578 6.29297 3.97266 6.29297H7.3125V8.89453H4.18359C3.66797 8.89453 3.27344 9.02734 3 9.29297C2.73438 9.55078 2.60156 9.94922 2.60156 10.4883V21.375C2.60156 21.9141 2.73438 22.3125 3 22.5703C3.27344 22.8359 3.66797 22.9688 4.18359 22.9688H17.2734C17.7812 22.9688 18.1719 22.8359 18.4453 22.5703C18.7188 22.3125 18.8555 21.9141 18.8555 21.375V10.4883C18.8555 9.94922 18.7188 9.55078 18.4453 9.29297C18.1719 9.02734 17.7812 8.89453 17.2734 8.89453H14.1445V6.29297H17.4961C18.793 6.29297 19.7773 6.62891 20.4492 7.30078C21.1289 7.96484 21.4688 8.94141 21.4688 10.2305V21.6445C21.4688 22.9258 21.1289 23.9023 20.4492 24.5742C19.7773 25.2461 18.793 25.582 17.4961 25.582H3.97266ZM10.7227 0C11.0664 0 11.3516 0.117188 11.5781 0.351562C11.8125 0.585938 11.9297 0.863281 11.9297 1.18359V12.8203L11.8359 14.5547L12.4219 13.7695L13.9805 12.1055C14.1914 11.8711 14.457 11.7539 14.7773 11.7539C15.0586 11.7539 15.3047 11.8477 15.5156 12.0352C15.7266 12.2227 15.832 12.4648 15.832 12.7617C15.832 13.043 15.7227 13.293 15.5039 13.5117L11.6602 17.2148C11.5039 17.3711 11.3477 17.4805 11.1914 17.543C11.043 17.5977 10.8867 17.625 10.7227 17.625C10.5664 17.625 10.4141 17.5977 10.2656 17.543C10.1172 17.4805 9.96094 17.3711 9.79688 17.2148L5.95312 13.5117C5.73438 13.293 5.625 13.043 5.625 12.7617C5.625 12.4648 5.72656 12.2227 5.92969 12.0352C6.14062 11.8477 6.38672 11.7539 6.66797 11.7539C6.98828 11.7539 7.25781 11.8711 7.47656 12.1055L9.04688 13.7695L9.63281 14.5547L9.52734 12.8203V1.18359C9.52734 0.863281 9.64453 0.585938 9.87891 0.351562C10.1133 0.117188 10.3945 0 10.7227 0Z" fill="black" />
                    </svg>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.a
                  href="mailto:philip.horlemann@web.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.button
                    style={{
                      display: 'flex',
                      padding: '.4rem',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '.75rem',
                      borderRadius: '2rem',
                      boxShadow: '0px 1px 3px 2px rgba(0, 0, 0, 0.25) inset, 0px 0px 16px 4px rgba(1, 81, 185, 0.25)',
                      background: '#0151B9',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                    className='silver-border-32'
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span style={{ fontSize: '1.6rem', fontWeight: '600', color: 'white' }}>Get in Contact</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                      <path d="M18.9883 13.9388C18.9883 14.3702 18.8433 14.731 18.5533 15.0212C18.2633 15.3114 17.9223 15.4565 17.5304 15.4565C17.1307 15.4565 16.7936 15.3114 16.5193 15.0212C16.2528 14.7231 16.1196 14.3702 16.1196 13.9624V9.52707L16.2959 5.13883L14.4148 7.25648L3.55131 18.1153C3.22995 18.4369 2.87332 18.5977 2.48142 18.5977C2.21493 18.5977 1.96803 18.5271 1.74073 18.3859C1.52127 18.2447 1.34099 18.0604 1.19991 17.833C1.05882 17.5977 0.988281 17.3545 0.988281 17.1035C0.988281 16.7114 1.14896 16.3545 1.47032 16.033L12.3221 5.1506L14.4266 3.29177L9.86483 3.45648H5.60879C5.20905 3.45648 4.86026 3.31923 4.56242 3.04472C4.27241 2.77021 4.12741 2.43687 4.12741 2.04472C4.12741 1.65256 4.26849 1.3153 4.55066 1.03295C4.84067 0.742754 5.20121 0.597656 5.6323 0.597656H17.4246C17.9027 0.597656 18.2789 0.742754 18.5533 1.03295C18.8354 1.3153 18.9765 1.68393 18.9765 2.13883L18.9883 13.9388Z" fill="white" />
                    </svg>
                  </motion.button>
                </motion.a>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}