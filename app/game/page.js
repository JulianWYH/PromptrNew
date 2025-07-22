"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../css/game.css";

export default function GameLobby() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [gameMode, setGameMode] = useState(null); // 'create' or 'join'

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name first!");
      return;
    }
    const newRoomCode = generateRoomCode();
    router.push(`/game/${newRoomCode}?player=${encodeURIComponent(playerName)}&host=true`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name first!");
      return;
    }
    if (!roomCode.trim()) {
      alert("Please enter a room code!");
      return;
    }
    router.push(`/game/${roomCode.toUpperCase()}?player=${encodeURIComponent(playerName)}`);
  };

  const handleCreateGameClick = () => {
    setGameMode('create');
    setShowNameInput(true);
  };

  const handleJoinGameClick = () => {
    setGameMode('join');
    setShowNameInput(true);
  };

  const handleBackToOptions = () => {
    setShowNameInput(false);
    setGameMode(null);
    setPlayerName("");
    setRoomCode("");
  };

  return (
    <div className="gameLobby">
      <div className="lobbyGameContent">
        <div className="lobbyGameHeader">
          <h1>PROMPT WARS</h1>
          <h2>Image Mimic Challenge</h2>
          <p>Create better prompts than your friends to recreate target images!</p>
        </div>

        {!showNameInput ? (
          <div className="lobbyGameOptions">
            <div className="gameOptionCard">
              <h3>Create New Game</h3>
              <p>Start a new room and invite friends</p>
              <button className="lobbyGameBtn create" onClick={handleCreateGameClick}>
                CREATE ROOM
              </button>
            </div>

            <div className="gameOptionCard">
              <h3>Join Game</h3>
              <p>Enter a room code to join friends</p>
              <button className="lobbyGameBtn join" onClick={handleJoinGameClick}>
                JOIN ROOM
              </button>
            </div>
          </div>
        ) : (
          <div className="playerSetup">
            <div className="setupCard">
              <h3>{gameMode === 'create' ? 'Create Your Room' : 'Join a Room'}</h3>
              
              <div className="inputGroup">
                <label>Your Name:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={20}
                />
              </div>

              {gameMode === 'join' && (
                <div className="inputGroup">
                  <label>Room Code:</label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit room code"
                    maxLength={6}
                  />
                </div>
              )}

              <div className="setupButtons">
                <button 
                  className="lobbyGameBtn"
                  onClick={gameMode === 'create' ? handleCreateRoom : handleJoinRoom}
                  disabled={!playerName.trim() || (gameMode === 'join' && !roomCode.trim())}
                >
                  {gameMode === 'create' ? 'CREATE ROOM' : 'JOIN ROOM'}
                </button>
              </div>

              <div className="backBtn">
                <button onClick={handleBackToOptions}>
                  ← Back to Options
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="gameRules">
          <h4>How to Play:</h4>
          <p>In this game, you'll take on 5 rounds of image recreation challenges using AI. <br></br> Each round shows you a photo from <span style={{fontWeight: "bold"}}>Unsplash</span>, and your goal is to write prompts that recreate it as closely as possible.<br></br><br></br> You get up to 5 attempts per round to refine your image. The more accurate your recreation, the higher your score. After 5 rounds, the player with the highest total score wins!</p>
        </div>
      </div>
    </div>
  );
}
