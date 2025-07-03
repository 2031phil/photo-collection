import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

// This function is necessary for returning a shuffled list of photo ids to display to the gallery
export async function GET() {
  const photosDir = join(process.cwd(), 'metadata');
  let photoIds = await readdir(photosDir);

  photoIds = photoIds
    .filter((name) => /^\d+_meta\.json$/.test(name))
    .map((name) => name.split('_')[0]);

  // Shuffle the list once
  photoIds.sort(() => 0.5 - Math.random());

  return NextResponse.json(photoIds);
}