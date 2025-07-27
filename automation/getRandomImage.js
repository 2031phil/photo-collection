import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const usedImagesPath = join(__dirname, 'usedImages.json');

function getFlagEmoji(countryName) {
    const countryCodes = {
        germany: 'DE',
        france: 'FR',
        georgia: 'GE',
        argentina: 'AR',
        austria: 'AT',
        azerbaijan: 'AZ',
        chile: 'CL',
        croatia: 'HR',
        'czech republic': 'CZ',
        england: 'GB',
        hungary: 'HU',
        italy: 'IT',
        montenegro: 'ME',
        norway: 'NO',
        'san marino': 'SM',
        scotland: 'GB',
        slovakia: 'SK',
        slovenia: 'SI',
        sweden: 'SE',
    };

    const code = countryCodes[countryName.toLowerCase()];
    if (!code) return '';
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function bold(text) {
    // Simulates bold using Unicode
    const map = {
        a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴',
        h: '𝗵', i: '𝗶', j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻',
        o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁', u: '𝘂',
        v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇',
        A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚',
        H: '𝗛', I: '𝗜', J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡',
        O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧', U: '𝗨',
        V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭',
    };
    return text.split('').map(char => map[char] || char).join('');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateCaption(imageId, meta) {
    const flag = getFlagEmoji(meta.country);
    const captionLines = [];

    captionLines.push(`--Free Download through link in bio--`);
    captionLines.push(`Photo #${imageId}\n`);
    captionLines.push(`${flag} ${capitalize(meta.country)}`);
    captionLines.push(`🏔️ ${capitalize(meta.environment)}`);
    captionLines.push(`🕖 ${capitalize(meta.time_of_day)}\n`);
    captionLines.push("\nThis photo was taken from my Photo Collection website where you can download all of my photos for free in high quality. Why? Because I'd rather give the world my photos for free than having them stored away on a hard drive forever :)")
    captionLines.push(`\n#philipsphotocollection #${meta.country} #${meta.environment} #${meta.time_of_day} #photography #background #screensaver #travel`);

    return captionLines.join('\n');
}

export async function getRandomImage() {
    const basePath = './photos';
    const used = JSON.parse(fs.readFileSync(usedImagesPath, 'utf-8'));

    const folders = fs.readdirSync(basePath).filter(dir => !used.includes(dir));
    if (folders.length === 0) throw new Error('No new images left.');

    const id = folders[Math.floor(Math.random() * folders.length)];
    const imagePath = path.join(basePath, id, `${id}_medium.jpg`);
    const meta = JSON.parse(fs.readFileSync(path.join('./metadata', `${id}_meta.json`), 'utf-8'));

    const caption = generateCaption(id, meta);
    return { id, imagePath, caption };
}