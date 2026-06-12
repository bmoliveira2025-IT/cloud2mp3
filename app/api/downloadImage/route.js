import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }

  // Tenta pegar a melhor qualidade disponível da capa substituindo 'large.jpg' por 't500x500.jpg'
  imageUrl = imageUrl.replace('-large.jpg', '-t500x500.jpg');

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image from SoundCloud');
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="capa.jpg"',
      },
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    return NextResponse.json({ error: 'Failed to download image' }, { status: 500 });
  }
}
