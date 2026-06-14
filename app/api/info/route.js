import { NextResponse } from 'next/server';
import scdl from 'soundcloud-downloader';
import { resolveSoundCloudUrl } from '../utils';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
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
      resolvedUrl: resolvedUrl
    });
  } catch (error) {
    console.error('Error fetching info:', error);
    return NextResponse.json({ error: 'Failed to fetch track info' }, { status: 500 });
  }
}
