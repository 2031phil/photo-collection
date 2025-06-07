import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const metaPath = path.join(process.cwd(), 'photos', id, `${id}_meta.json`);
    const file = await fs.readFile(metaPath, 'utf8');
    const data = JSON.parse(file);
    return NextResponse.json(data);
  } catch (err) {
    console.error(`Error reading meta.json for photo ${id}:`, err);
    return NextResponse.json({ error: 'Metadata not found' }, { status: 404 });
  }
}