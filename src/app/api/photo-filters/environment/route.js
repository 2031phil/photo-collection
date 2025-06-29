import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const directoryPath = path.join(process.cwd(), 'public', 'photo-filters', 'environment');

  try {
    const files = await fs.readdir(directoryPath);
    const countries = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));

    return NextResponse.json(countries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read environment filters' }, { status: 500 });
  }
}