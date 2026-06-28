import { NextResponse } from 'next/server';
import scdl from 'soundcloud-downloader';
import { resolveSoundCloudUrl, detectPlatform, getYtdl } from '../utils';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return NextResponse.json({ error: 'URL inválida. Envie um link do SoundCloud ou YouTube Music.' }, { status: 400 });
  }

  try {
    if (platform === 'youtube') {
      const youtubedl = getYtdl();
      const info = await youtubedl(url, { 
        dumpSingleJson: true, 
        noWarnings: true,
        noCacheDir: true,
        preferFreeFormats: true,
        jsRuntimes: 'node'
      });
      return NextResponse.json({
        title: info.title,
        duration: info.duration ? info.duration * 1000 : 0,
        thumbnail: info.thumbnail,
        author: info.uploader || info.channel || info.artist || 'YouTube Music',
        resolvedUrl: url,
        platform: 'youtube',
        videoId: info.id
      });
    }

    const resolvedUrl = await resolveSoundCloudUrl(url);

    if (!scdl.isValidUrl(resolvedUrl)) {
      return NextResponse.json({ error: 'Invalid SoundCloud URL' }, { status: 400 });
    }
    
    const info = await scdl.getInfo(resolvedUrl);
    return NextResponse.json({
      title: info.title,
      duration: info.duration,
      thumbnail: info.artwork_url || (info.user && info.user.avatar_url),
      author: info.user && info.user.username,
      resolvedUrl: resolvedUrl,
      platform: 'soundcloud'
    });
  } catch (error) {
    console.error('Error fetching info:', error);
    const errorMessage = error?.message || String(error);
    return NextResponse.json({ 
      error: 'Failed to fetch track info',
      details: errorMessage
    }, { status: 500 });
  }
}

