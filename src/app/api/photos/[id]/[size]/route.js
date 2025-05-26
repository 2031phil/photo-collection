import { NextResponse } from 'next/server';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { stat } from 'fs/promises';

export async function GET(req, { params }) {
  const { id, size } = params;

  // Construct the path to the image: /photos/0001/small.jpg
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
    },
  });
}