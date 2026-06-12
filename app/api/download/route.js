import scdl from 'soundcloud-downloader';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

// Configura o path do ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath.path);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 });
  }

  try {
    if (!scdl.isValidUrl(url)) {
      return new Response(JSON.stringify({ error: 'Invalid SoundCloud URL' }), { status: 400 });
    }

    const info = await scdl.getInfo(url);
    const title = info.title ? info.title.replace(/[^\w\s-]/gi, '') : 'track';

    const stream = await scdl.download(url);

    // No Next.js App Router API, podemos retornar um ReadableStream.
    // Usaremos o PassThrough do Node para intermediar o stream do ffmpeg e o NextResponse.
    const { PassThrough } = require('stream');
    const passThroughStream = new PassThrough();

    ffmpeg(stream)
      .audioBitrate('320k')
      .format('mp3')
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
      })
      .pipe(passThroughStream);

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
    return new Response('Failed to download track', { status: 500 });
  }
}
