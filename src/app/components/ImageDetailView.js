'use client';
import { useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Selector from '@/app/components/Selector';
import Label from '@/app/components/Label';
import tagMappings from '@/utils/tagMappings';
import '@/app/globals.css';
import Pressable from '@/app/components/Pressable';
import TopRowContainer from '@/app/components/TopRowContainer';
import { useResponsiveIconScale } from '@/utils/useResponsiveIconScale';
import { countryShapes } from '@/utils/countryShapesNormalized';
import { getCountryCode } from '@/utils/countryCodes';

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
  const [showLicenseContainer, setShowLicenseContainer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [compactView, setCompactView] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('compactView');
      return stored !== null ? stored === 'true' : true;
    }
    return false;
  });
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
    localStorage.setItem('compactView', compactView);
  }, [compactView]);

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
    // Tracking the downloads in the database
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);

    // Run on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('compact-view', compactView);
  }, [compactView]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className='detail-view-container'
    >
      <div className='image-and-license-container' style={{ opacity: isImageLoaded ? '1' : '0' }}>
        {isMobile && (
          <TopRowContainer
            isMobile={isMobile}
            compactView={compactView}
            onBack={() => {
              if (
                (typeof document !== 'undefined' && document.referrer && document.referrer.includes('/gallery')) ||
                (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.origin + '/gallery'))
              ) {
                router.back();
              } else {
                router.push('/', { shallow: true, scroll: false });
              }
            }}
            onToggleCompact={() => setCompactView((prev) => !prev)}
          />
        )}
        <motion.div
          key={activePhotoId}
          layout
          layoutId={`photo-${activePhotoId}`}
          className='image-container'
        >
          <div className='fader'></div>
          {!isMobile && (
            <TopRowContainer
              isMobile={isMobile}
              onBack={() => {
                if (
                  (typeof document !== 'undefined' && document.referrer && document.referrer.includes('/gallery')) ||
                  (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.origin + '/gallery'))
                ) {
                  router.back();
                } else {
                  router.push('/', { shallow: true, scroll: false });
                }
              }}
              onToggleCompact={() => setCompactView((prev) => !prev)}
            />
          )}
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
                const code = getCountryCode(capitalize(value));
                const countryShape = countryShapes.find(shape => shape.id === code);

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
                          countryShape ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 100 100"
                              width="24"
                              height="24"
                              style={{
                                display: 'block',
                                objectFit: 'contain',
                              }}
                              preserveAspectRatio="xMidYMid meet"
                              className='icons'
                            >
                              <g transform={countryShape.transform}>
                                <path d={countryShape.path} fill="#000" />
                              </g>
                            </svg>
                          ) : (
                            <svg className='icons' xmlns="http://www.w3.org/2000/svg" width="13" height="18" viewBox="0 0 13 18" fill="none">
                              <path d="M6.49992 1C3.44207 1 0.961182 3.36127 0.961182 6.26949C0.961182 9.61581 4.65367 14.9188 6.00951 16.7504C6.06579 16.8277 6.13955 16.8906 6.22478 16.934C6.31001 16.9774 6.40429 17 6.49992 17C6.59555 17 6.68983 16.9774 6.77506 16.934C6.86028 16.8906 6.93405 16.8277 6.99033 16.7504C8.34616 14.9195 12.0387 9.6185 12.0387 6.26949C12.0387 3.36127 9.55776 1 6.49992 1Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6.50005 8.38512C7.51971 8.38512 8.3463 7.55853 8.3463 6.53887C8.3463 5.51922 7.51971 4.69263 6.50005 4.69263C5.4804 4.69263 4.65381 5.51922 4.65381 6.53887C4.65381 7.55853 5.4804 8.38512 6.50005 8.38512Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )
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
          {(!isMobile || showLicenseContainer || !compactView) && (
            <motion.div
              layout
              className="standard-border standard-blur license-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, delay: !isMobile && 0.4, ease: 'easeOut' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h1 style={{ width: '100%', textAlign: 'center', fontSize: '2.25rem', fontWeight: '700' }}>Photo #{activePhotoId}</h1>
                  {isMobile && compactView && (
                    <div style={{ position: 'fixed', right: '1.25rem' }}>
                      <Pressable
                        icon={
                          <svg className='icons' xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <path d="M13.329 0.355944C13.4564 0.228408 13.6012 0.147249 13.7633 0.112466C13.9313 0.0718863 14.0964 0.0718863 14.2585 0.112466C14.4265 0.153046 14.5771 0.237104 14.7103 0.36464C14.8319 0.486379 14.913 0.631307 14.9535 0.799423C14.9999 0.967538 14.9999 1.13565 14.9535 1.30377C14.913 1.46609 14.8319 1.61102 14.7103 1.73855L2.65195 13.8081C2.53032 13.9299 2.38553 14.011 2.21757 14.0516C2.0554 14.0922 1.89034 14.0922 1.72238 14.0516C1.55442 14.011 1.40384 13.927 1.27063 13.7994C1.14321 13.6777 1.05923 13.5328 1.01869 13.3646C0.978146 13.1965 0.978146 13.0284 1.01869 12.8603C1.06502 12.6922 1.149 12.5501 1.27063 12.4342L13.329 0.355944ZM14.7103 12.4255C14.8319 12.553 14.913 12.7009 14.9535 12.869C14.9941 13.0313 14.9941 13.1965 14.9535 13.3646C14.913 13.5328 14.8319 13.6777 14.7103 13.7994C14.5829 13.927 14.4352 14.011 14.2672 14.0516C14.0993 14.0922 13.9313 14.0922 13.7633 14.0516C13.5954 14.011 13.4506 13.9299 13.329 13.8081L1.27063 1.72986C1.149 1.61392 1.06792 1.47189 1.02738 1.30377C0.986833 1.13565 0.986833 0.967538 1.02738 0.799423C1.06792 0.631307 1.149 0.486379 1.27063 0.36464C1.39804 0.237104 1.54573 0.153046 1.71369 0.112466C1.88165 0.0718863 2.04961 0.0718863 2.21757 0.112466C2.38553 0.153046 2.53032 0.234205 2.65195 0.355944L14.7103 12.4255Z" fill="black" />
                          </svg>
                        }
                        onClick={() => setShowLicenseContainer((prev) => !prev)}
                      />
                    </div>
                  )}
                </div>
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
                    <label htmlFor='condition' style={{ display: 'flex', gap: '.8rem', alignItems: 'start', fontSize: '.875rem', fontWeight: '400' }}>
                      <input
                        style={{ marginTop: '.35rem', marginLeft: '.2rem', transform: 'scale(1.4)', cursor: 'pointer' }}
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
                      id='downloadButton'
                      whileHover={userAgree && {
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={userAgree && { scale: 0.98 }}
                    >
                      <span style={{ fontSize: '1.6rem', fontWeight: '600', color: 'black' }}>HQ Download</span>
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
          )}
        </AnimatePresence>
        {isMobile && compactView && (
          <div style={{ position: 'absolute', bottom: '6rem', display: 'flex', width: '100%', justifyContent: 'end', padding: '0 1rem', alignItems: 'center', transition: '.5s', opacity: showLicenseContainer ? '0' : '1' }}>
            <Pressable
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
                  <path d="M4.05513 20C2.756 20 1.75382 19.6517 1.04858 18.9551C0.349527 18.2646 0 17.2777 0 15.9945V8.92759C0 7.63825 0.349527 6.64833 1.04858 5.95784C1.75382 5.26734 2.756 4.92209 4.05513 4.92209H5.79039V6.95692H4.13865C3.47671 6.95692 2.96325 7.13718 2.59825 7.49771C2.23945 7.85212 2.06004 8.35625 2.06004 9.01008V15.912C2.06004 16.5658 2.23945 17.07 2.59825 17.4244C2.96325 17.7849 3.47671 17.9652 4.13865 17.9652H12.8521C13.5202 17.9652 14.0337 17.7849 14.3925 17.4244C14.7513 17.07 14.9307 16.5658 14.9307 15.912V9.01008C14.9307 8.35625 14.7513 7.85212 14.3925 7.49771C14.0337 7.13718 13.5202 6.95692 12.8521 6.95692H11.2003V4.92209H12.9356C14.2409 4.92209 15.2431 5.26734 15.9421 5.95784C16.6474 6.64833 17 7.63825 17 8.92759V15.9945C17 17.2777 16.6474 18.2646 15.9421 18.9551C15.2431 19.6517 14.2409 20 12.9356 20H4.05513ZM8.5 0C8.76601 0 8.98872 0.091659 9.16812 0.274977C9.35371 0.458295 9.44651 0.675221 9.44651 0.925756V10.0275L9.2702 12.7864C9.25164 12.9942 9.17121 13.1745 9.02893 13.3272C8.88664 13.4739 8.71033 13.5472 8.5 13.5472C8.28966 13.5472 8.11335 13.4739 7.97107 13.3272C7.82878 13.1745 7.74836 12.9942 7.7298 12.7864L7.54421 10.0275V0.925756C7.54421 0.675221 7.63701 0.458295 7.8226 0.274977C8.00819 0.091659 8.23399 0 8.5 0ZM5.28002 9.1934C5.53366 9.1934 5.74709 9.28506 5.92031 9.46838L7.16376 10.7699L8.5 12.4931L9.83624 10.7699L11.0797 9.46838C11.2405 9.28506 11.4509 9.1934 11.7107 9.1934C11.9334 9.1934 12.1283 9.26673 12.2953 9.41338C12.4623 9.56004 12.5459 9.74947 12.5459 9.98167C12.5459 10.2016 12.4561 10.3972 12.2767 10.5683L9.23308 13.4647C9.10935 13.5869 8.98563 13.6725 8.8619 13.7214C8.74436 13.7641 8.62373 13.7855 8.5 13.7855C8.37009 13.7855 8.24636 13.7641 8.12882 13.7214C8.01128 13.6725 7.89065 13.5869 7.76692 13.4647L4.71397 10.5683C4.54076 10.3972 4.45415 10.2016 4.45415 9.98167C4.45415 9.74947 4.53457 9.56004 4.69541 9.41338C4.86245 9.26673 5.05731 9.1934 5.28002 9.1934Z" fill="black" />
                </svg>
              }
              onClick={() => setShowLicenseContainer((prev) => !prev)}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}