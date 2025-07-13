import { getPhotosServer } from '../utils/getPhotosServer'

export default async function sitemap() {
    const baseUrl = 'https://philips-photo-collection.vercel.app'

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/usage-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]

    // Get your photos
    const photos = await getPhotosServer()

    // Create sitemap entries for each photo's detail view
    const photoPages = photos.map((photoId) => ({
        url: `${baseUrl}/?image=${photoId}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.7,
    }))

    return [
        ...staticPages,
        ...photoPages,
    ]
}