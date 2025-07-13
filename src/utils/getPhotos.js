// Used by sitemap.js to index each photo
export async function getPhotos() {
  const res = await fetch('/api/photos');
  const data = await res.json();
  return data;
}