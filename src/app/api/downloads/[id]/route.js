import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request, { params }) {
  const id = params.id;
  const filePath = path.resolve(process.cwd(), 'downloads.json');

  let data = {};
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    data = JSON.parse(file || '{}');
  } catch (err) {
  }

  data[id] = (data[id] || 0) + 1;

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

  return new Response(JSON.stringify({ message: 'Download recorded', count: data[id] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}