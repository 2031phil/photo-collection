// Used by sitemap.js to index each photo
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function getPhotosServer() {
  try {
    const metadataDir = join(process.cwd(), 'metadata');
    let photoIds = await readdir(metadataDir);

    photoIds = photoIds
      .filter((name) => /^\d+_meta\.json$/.test(name))
      .map((name) => name.split('_')[0]);

    // Sort for consistent sitemap ordering (no shuffle for sitemap)
    photoIds.sort((a, b) => parseInt(a) - parseInt(b));

    return photoIds;
  } catch (error) {
    console.error('Error reading photos for sitemap:', error);
    return [];
  }
}