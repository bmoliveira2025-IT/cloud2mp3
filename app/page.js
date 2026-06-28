'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trackInfo, setTrackInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDownloadImage = () => {
    if (!trackInfo?.thumbnail) return;
    setDownloadingImage(true);
    
    const downloadUrl = `/api/downloadImage?url=${encodeURIComponent(trackInfo.thumbnail)}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setDownloadingImage(false);
    }, 2000);
  };

  const fetchInfo = async () => {
    if (!url) return;
    setError(null);
    setLoading(true);
    setTrackInfo(null);
    
    try {
      const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.details ? `${data.error} (${data.details})` : (data.error || 'Failed to fetch info');
        throw new Error(errorMsg);
      }
      
      if (data.resolvedUrl && data.resolvedUrl !== url) {
        setUrl(data.resolvedUrl);
      }
      
      setTrackInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!url) return;
    setDownloading(true);
    
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  return (
    <>
      {isInstallable && (
        <div className="install-btn-container">
          <button className="install-btn" onClick={handleInstallClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Instalar App
          </button>
        </div>
      )}

      <main className="main-layout">
        
        <div className="header-section">
          <h1 className="title">Cloud2MP3</h1>
          <p className="subtitle">Transforme suas músicas favoritas do SoundCloud ou YouTube Music em MP3 (320kbps) com apenas um clique.</p>

          <div className="search-section">
            <div className="input-wrapper">
              <input 
                type="text" 
                className="input-field"
                placeholder="Cole o link do SoundCloud ou YouTube Music aqui..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInfo()}
              />
              <button 
                className="action-btn"
                onClick={fetchInfo} 
                disabled={loading || !url}
              >
                {loading ? (
                  <><div className="loader-spinner"></div> Buscando</>
                ) : (
                  'Pesquisar'
                )}
              </button>
            </div>
            
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {trackInfo && (
          <div className="result-card">
            {trackInfo.thumbnail && (
              <div className="track-img-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={trackInfo.thumbnail} alt="Capa" className="track-image" />
              </div>
            )}
            <div className="track-content">
              <span className="track-author">{trackInfo.author}</span>
              <h3 className="track-title">{trackInfo.title}</h3>
              
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button 
                className="action-btn"
                onClick={handleDownload} 
                disabled={downloading}
                style={{ width: 'fit-content' }}
              >
                {downloading ? (
                  <><div className="loader-spinner"></div> Iniciando...</>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Baixar MP3
                  </>
                )}
              </button>
              
              <button 
                className="action-btn"
                onClick={handleDownloadImage} 
                disabled={downloadingImage}
                style={{ width: 'fit-content', background: 'transparent', border: '1px solid var(--panel-border)' }}
              >
                {downloadingImage ? (
                  <><div className="loader-spinner"></div> Baixando...</>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Baixar Capa
                  </>
                )}
              </button>
            </div>
            
            <div style={{ marginTop: '30px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
              {trackInfo.platform === 'youtube' ? (
                <iframe 
                  width="100%" 
                  height="150" 
                  src={`https://www.youtube.com/embed/${trackInfo.videoId}`}
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                  style={{ display: 'block' }}
                ></iframe>
              ) : (
                <iframe 
                  width="100%" 
                  height="120" 
                  scrolling="no" 
                  frameBorder="no" 
                  allow="autoplay" 
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=false`}
                  style={{ display: 'block' }}
                ></iframe>
              )}
            </div>
            
            </div>
          </div>
        )}

      </main>
    </>
  );
}
