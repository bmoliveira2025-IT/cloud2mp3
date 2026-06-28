import path from 'path';
import fs from 'fs';
import ytdlRaw from 'youtube-dl-exec';

export async function resolveSoundCloudUrl(url) {
  if (url.includes('on.soundcloud.com')) {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      // Remove trailing query params for cleaner URL if necessary, 
      // but scdl handles them fine, so we just return the resolved URL.
      return response.url;
    } catch (error) {
      console.error('Error resolving short URL:', error);
      return url;
    }
  }
  return url;
}

export function detectPlatform(url) {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes('soundcloud.com')) {
    return 'soundcloud';
  }
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return 'youtube';
  }
  return null;
}

export function getYtdl() {
  const binaryPath = path.join(process.cwd(), 'node_modules/youtube-dl-exec/bin', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  if (fs.existsSync(binaryPath)) {
    return ytdlRaw.create(binaryPath);
  }
  return ytdlRaw;
}

export function getYoutubeOptions(extraOptions = {}) {
  const options = {
    noWarnings: true,
    noCacheDir: true,
    jsRuntimes: 'node',
    extractorArgs: 'youtube:player_client=default,-web',
    ...extraOptions
  };

  if (process.env.YOUTUBE_COOKIES) {
    const cookiesPath = path.join('/tmp', 'youtube_cookies.txt');
    try {
      const formattedCookies = process.env.YOUTUBE_COOKIES.replace(/\\n/g, '\n');
      fs.writeFileSync(cookiesPath, formattedCookies);
      options.cookies = cookiesPath;
    } catch (err) {
      console.error('Failed to write cookies file:', err);
    }
  }

  return options;
}

