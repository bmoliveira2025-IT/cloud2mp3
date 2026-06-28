import path from 'path';
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
  return ytdlRaw.create(binaryPath);
}

