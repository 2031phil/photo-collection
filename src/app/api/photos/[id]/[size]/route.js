import { NextResponse } from 'next/server';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { stat } from 'fs/promises';

// This function is necessary to retrieve the actual photos
export async function GET(req) {
  const baseUrl = process.env.NODE_ENV === 'production' ? process.env.PHOTO_BASE_URL : null;
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 2];
  let sizeWithExt = segments[segments.length - 1];

  const size = sizeWithExt.includes('.') ? sizeWithExt.split('.').slice(0, -1).join('.') : sizeWithExt;

  let ext = 'jpg';
  let contentType = 'image/jpeg';

  // If browser supports webp, fetch webp
  const acceptHeader = req.headers.get('accept') || '';
  if (size !== 'large' && acceptHeader.includes('image/webp')) {
    ext = 'webp';
    contentType = 'image/webp';
  }

  let fileName;
  if (baseUrl) {
    // In production, include /webp/ subfolder if fetching webp
    if (ext === 'webp') {
      fileName = `webp/${id}_${size}`;
    } else {
      fileName = `${id}_${size}`;
    }
  } else {
    // Local file system: fileName includes extension
    fileName = `${id}_${size}.${ext}`;
  }

  if (baseUrl) {
    const remoteUrl = `${baseUrl}/${id}/${fileName}`;
    const proxyRes = await fetch(remoteUrl, { next: { revalidate: 3600 } });
    if (!proxyRes.ok) return new NextResponse('Not found', { status: 404 });

    const imageBuffer = await proxyRes.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } else {
    let filePath = join(process.cwd(), 'photos', id, fileName);

    if (!existsSync(filePath)) {
      return new NextResponse('Not found', { status: 404 });
    }

    const fileStat = await stat(filePath);
    const stream = createReadStream(filePath);

    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }
}