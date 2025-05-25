import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET(req) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '0', 10);
  const shuffle = url.searchParams.get('shuffle') === 'true';

  const photosDir = join(process.cwd(), 'photos');
  let photoIds = await readdir(photosDir);

  // Filter only numeric directory names (e.g. "0001", "0002", etc.)
  photoIds = photoIds.filter((name) => /^\d+$/.test(name));

  if (shuffle) {
    photoIds.sort(() => 0.5 - Math.random());
  }

  if (limit > 0) {
    photoIds = photoIds.slice(0, limit);
  }

  return NextResponse.json(photoIds);
}