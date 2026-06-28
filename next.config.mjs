/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@ffmpeg-installer/ffmpeg', 'fluent-ffmpeg', 'youtube-dl-exec'],
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/youtube-dl-exec/bin/**/*',
      './node_modules/@ffmpeg-installer/**/*',
    ],
  },
};

export default nextConfig;
