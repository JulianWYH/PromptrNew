"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isGamemodesOpen, setIsGamemodesOpen] = useState(false);

  const navigateTo = (path) => {
    router.push(path);
    setIsGamemodesOpen(false); // Close dropdown after navigation
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand" onClick={() => navigateTo('/promptr')}>
          <img src="/Logo.png" alt="PROMPTR" className="brand-logo" />
          <span className="brand-text">PROMPTR</span>
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          {/* Gamemodes Dropdown */}
          <div className="nav-dropdown">
            <button 
              className="nav-link dropdown-toggle"
              onClick={() => setIsGamemodesOpen(!isGamemodesOpen)}
              onBlur={() => setTimeout(() => setIsGamemodesOpen(false), 150)}
            >
              Gamemodes
              <span className={`dropdown-arrow ${isGamemodesOpen ? 'open' : ''}`}>▼</span>
            </button>
            {isGamemodesOpen && (
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item"
                  onClick={() => navigateTo('/promptr')}
                >
                  <span className="dropdown-icon">🎯</span>
                  Promptr
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => navigateTo('/freeplay')}
                >
                  <span className="dropdown-icon">🔍</span>
                  Freeplay
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => navigateTo('/game')}
                >
                  <span className="dropdown-icon">📱</span>
                  Promptr Phone
                </button>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <button 
            className="nav-link"
            onClick={() => navigateTo('/leaderboard')}
          >
            🏆 Leaderboard
          </button>
        </div>

        {/* Simple branding section instead of user info */}
        <div className="navbar-brand-section">
          <span className="brand-tagline">AI Deepfake Detection Game</span>
        </div>
      </div>
    </nav>
  );
}
