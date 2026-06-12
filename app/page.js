'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trackInfo, setTrackInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const fetchInfo = async () => {
    if (!url) return;
    setError(null);
    setLoading(true);
    setTrackInfo(null);
    
    try {
      const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch info');
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
    <div className="app-container">
      <div className="header">
        <h1>Cloud2MP3</h1>
        <p>Baixe músicas do SoundCloud em 320kbps</p>
      </div>

      <div className="input-group">
        <input 
          type="text" 
          placeholder="Cole o link do SoundCloud aqui..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchInfo()}
        />
        <button 
          onClick={fetchInfo} 
          disabled={loading || !url}
        >
          {loading ? (
            <><div className="loader"></div> Carregando...</>
          ) : (
            'Buscar Música'
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {trackInfo && (
        <div className="track-info">
          {trackInfo.thumbnail && (
            <img src={trackInfo.thumbnail} alt="Capa" className="track-image" width={80} height={80} unoptimized />
          )}
          <div className="track-details">
            <h3>{trackInfo.title}</h3>
            <p>Por: {trackInfo.author}</p>
            <button 
              onClick={handleDownload} 
              disabled={downloading}
              style={{ marginTop: '15px', padding: '10px 20px', fontSize: '0.95rem' }}
            >
              {downloading ? 'Iniciando Download...' : 'Baixar MP3'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
