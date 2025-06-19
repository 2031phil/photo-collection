import { NextResponse } from 'next/server';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { stat } from 'fs/promises';

// This function is necessary to retrieve the actual photos
export async function GET(req) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/');

  const id = segments[segments.length - 2];
  const size = segments[segments.length - 1];

  const filePath = join(process.cwd(), 'photos', id, `${id}_${size}.jpg`);

  if (!existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const fileStat = await stat(filePath);
  const stream = createReadStream(filePath);

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': fileStat.size,
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}