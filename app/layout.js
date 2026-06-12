import './globals.css'

export const metadata = {
  title: 'Cloud2MP3 - SoundCloud Downloader',
  description: 'Baixe músicas do SoundCloud em 320kbps',
  manifest: '/manifest.json',
  themeColor: '#ff5500',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
