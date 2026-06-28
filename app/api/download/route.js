import scdl from 'soundcloud-downloader';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { resolveSoundCloudUrl, detectPlatform, getYtdl, getYoutubeOptions } from '../utils';

// Configura o path do ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath.path);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 });
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return new Response(JSON.stringify({ error: 'URL inválida' }), { status: 400 });
  }

  try {
    const { PassThrough } = require('stream');
    const passThroughStream = new PassThrough();
    let title = 'track';

    if (platform === 'youtube') {
      const youtubedl = getYtdl();
      const info = await youtubedl(url, getYoutubeOptions({ 
        dumpSingleJson: true, 
        preferFreeFormats: true 
      }));
      title = info.title ? info.title.replace(/[^\w\s-]/gi, '') : 'track';

      const subprocess = youtubedl.exec(url, getYoutubeOptions({ 
        output: '-', 
        format: 'bestaudio/best', 
        ffmpegLocation: ffmpegPath.path 
      }));

      ffmpeg(subprocess.stdout)
        .audioBitrate('320k')
        .format('mp3')
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
        })
        .pipe(passThroughStream);
    } else {
      const resolvedUrl = await resolveSoundCloudUrl(url);

      if (!scdl.isValidUrl(resolvedUrl)) {
        return new Response(JSON.stringify({ error: 'Invalid SoundCloud URL' }), { status: 400 });
      }

      const info = await scdl.getInfo(resolvedUrl);
      title = info.title ? info.title.replace(/[^\w\s-]/gi, '') : 'track';

      const stream = await scdl.download(resolvedUrl);

      ffmpeg(stream)
        .audioBitrate('320k')
        .format('mp3')
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
        })
        .pipe(passThroughStream);
    }

    // Converte o Node.js Stream para Web Stream
    const webStream = new ReadableStream({
      start(controller) {
        passThroughStream.on('data', (chunk) => controller.enqueue(chunk));
        passThroughStream.on('end', () => controller.close());
        passThroughStream.on('error', (err) => controller.error(err));
      }
    });

    return new Response(webStream, {
      headers: {
        'Content-Disposition': `attachment; filename="${title}.mp3"`,
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error) {
    console.error('Error downloading:', error);
    let errorMessage = error?.message || String(error);
    if (errorMessage.includes('Sign in to confirm you’re not a bot') || errorMessage.includes('bot')) {
      errorMessage = 'Bloqueio anti-bot do YouTube detectado nos servidores do Vercel. É necessário configurar a variável YOUTUBE_COOKIES no painel do Vercel e fazer um Redeploy. Detalhes: ' + errorMessage;
    }
    return new Response(JSON.stringify({ 
      error: 'Failed to download track', 
      details: errorMessage 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
