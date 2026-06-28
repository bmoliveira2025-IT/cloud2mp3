import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
  if (process.platform !== 'linux') {
    console.log('Skipping yt-dlp_linux setup (current platform is ' + process.platform + ')');
    return;
  }

  console.log('Downloading standalone yt-dlp_linux binary for Vercel/Serverless...');
  const binDir = path.join(__dirname, '../node_modules/youtube-dl-exec/bin');
  const binPath = path.join(binDir, 'yt-dlp');

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to download yt-dlp_linux: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(binPath, buffer);
  fs.chmodSync(binPath, 0o755);
  console.log('Successfully installed standalone yt-dlp_linux (' + (buffer.length / 1024 / 1024).toFixed(2) + ' MB)');
}

setup().catch((err) => {
  console.error('Error downloading yt-dlp_linux:', err);
  process.exit(1);
});
