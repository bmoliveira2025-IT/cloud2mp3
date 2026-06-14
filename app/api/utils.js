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
