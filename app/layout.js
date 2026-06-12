import './globals.css'

export const metadata = {
  title: 'Cloud2MP3 - SoundCloud Downloader',
  description: 'Baixe músicas do SoundCloud em 320kbps',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
