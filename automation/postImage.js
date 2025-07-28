import fs from 'fs';
import { IgApiClient } from 'instagram-private-api';
import dotenv from 'dotenv';
import { getRandomImage } from './getRandomImage.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const usedImagesPath = join(__dirname, 'usedImages.json');

dotenv.config();

async function login() {
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME);
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  return ig;
}

async function post() {
  const ig = await login();
  const { cloudinaryUrl, caption, id } = await getRandomImage();

  // Download image from Cloudinary
  const imageBuffer = await fetch(cloudinaryUrl).then(res => res.arrayBuffer());

  const published = await ig.publish.photo({
    file: Buffer.from(imageBuffer),
    caption,
  });

  // Log ID to avoid reposting
  const used = JSON.parse(fs.readFileSync(usedImagesPath, 'utf-8'));
  used.push(id);
  fs.writeFileSync(usedImagesPath, JSON.stringify(used, null, 2));
}

post().catch(console.error);