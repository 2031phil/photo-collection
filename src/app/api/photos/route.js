import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

// This function is necessary for returning the gallery a shuffled list of photo ids to display
export async function GET() {
  const photosDir = join(process.cwd(), 'photos');
  let photoIds = await readdir(photosDir);

  // Filter only numeric directory names (e.g. "0001", "0002", etc.)
  photoIds = photoIds.filter((name) => /^\d+$/.test(name));

  // Shuffle the list once
  photoIds.sort(() => 0.5 - Math.random());

  return NextResponse.json(photoIds);
}