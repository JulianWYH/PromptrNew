"use client";

import { useEffect, useRef, useState } from "react";

export default function PromptrPhone() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Auto-play music when component mounts
    const playAudio = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log("Autoplay prevented by browser:", error);
        // Autoplay was prevented, user needs to interact first
      }
    };

    playAudio();

    // Cleanup: pause audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  return (
    <div className="page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Audio Element */}
      <audio 
        ref={audioRef}
        loop
        preload="auto"
        volume={0.5}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => console.error("Audio error:", e)}
        onLoadedData={() => console.log("Audio loaded successfully")}
      >
        <source src="/music/Walen - Gameboy (freetouse.com).mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Audio Controls */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button 
          onClick={toggleMute}
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation'
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <main className="main">
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          margin: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.2'
          }}>
            📱 Promptr Phone
          </h1>
          <h2 style={{
            fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
            color: '#666',
            marginBottom: '30px'
          }}>
            Coming Soon!
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.1rem)',
            color: '#888',
            lineHeight: '1.6',
            maxWidth: '100%',
            margin: '0 auto'
          }}>
            Get ready for the mobile version of Promptr! 
            Detect deepfakes on the go with our upcoming mobile-optimized experience.
          </p>
          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '12px',
            border: '2px dashed #667eea'
          }}>
            <p style={{ 
              color: '#667eea', 
              fontWeight: '600',
              fontSize: 'clamp(0.9rem, 3vw, 1rem)'
            }}>
              🚀 We're working hard to bring you this feature!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}