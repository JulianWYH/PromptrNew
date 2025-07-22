"use client";

import { useState, useEffect } from "react";
import { 
  addScore, 
  saveGameSession, 
  getTodaysPlayCount, 
  recordPlay, 
  canUserPlay, 
  generateAnonymousUsername,
  createOrUpdateUser 
} from '../lib/firebaseService';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [similarity, setSimilarity] = useState(null);
  const [promptSimilarity, setPromptSimilarity] = useState(null);
  const [aiDetectionResult, setAiDetectionResult] = useState('');
  const [showAiAlert, setShowAiAlert] = useState(false);
  const [qualityAnalysis, setQualityAnalysis] = useState('');
  const [finalScore, setFinalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageURL, setImageUrl] = useState(null);
  const [imageAttribution, setImageAttribution] = useState(null);
  const [UnSLoading, setUnSLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [canPlay, setCanPlay] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState('');
  const [askForCredentials, setAskForCredentials] = useState(false);
  const [wantToProvideCredentials, setWantToProvideCredentials] = useState(null);
  
  // Custom popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success'); // 'success', 'error', 'warning'

  // Helper function to show popup
  const showCustomPopup = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  useEffect(() => {
    setIsClient(true);
    // Generate or get user identifier for tracking plays
    let identifier = localStorage.getItem('userIdentifier');
    if (!identifier) {
      identifier = 'anon_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userIdentifier', identifier);
    }
    setUserIdentifier(identifier);
  }, []);

  useEffect(() => {
    if (!isClient || !userIdentifier) return;
    
    const checkPlayLimit = async () => {
      try {
        const todayCount = await getTodaysPlayCount(userIdentifier);
        setPlayCount(todayCount);
        setCanPlay(todayCount < 3);
      } catch (error) {
        console.error('Error checking play limit:', error);
      }
    };

    checkPlayLimit();
  }, [isClient, userIdentifier]);

  useEffect(() => {
    if (!isClient) return;
    
    const fetchImage = async () => {
      try {
        const res = await fetch('/api/unsplash');
        
        if (!res.ok) {
          if (res.status === 429) {
            // Handle rate limiting
            const errorData = await safeFetchJson(res, "Unsplash API");
            throw new Error(`Rate limit exceeded. ${errorData.details || 'Please try again later.'}`);
          }
          throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }
        
        const data = await safeFetchJson(res, "Unsplash API");
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setImageUrl(data.url);
        setImageAttribution(data.attribution);
      } catch (error) {
        console.error("Failed to fetch image:", error);
        setError(`Failed to load Unsplash image: ${error.message}`);
      } finally {
        setUnSLoading(false);
      }
    };

    fetchImage();
  }, [isClient]);

  const safeFetchJson = async (res, label = 'API call') => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error(`${label} returned invalid JSON: ${text}`);
    }
  };

  const handleGenerate = async () => {
    // Double-check play limit (prevent any potential bypasses)
    const currentPlayCount = await getTodaysPlayCount(userIdentifier);
    if (currentPlayCount >= 3) {
      showCustomPopup(`❌ Daily limit exceeded! You have already played ${currentPlayCount}/3 times today. Please try again tomorrow.`, 'error');
      setPlayCount(currentPlayCount);
      setCanPlay(false);
      return;
    }

    // Check if user can play (UI state check)
    if (!canPlay) {
      showCustomPopup(`You have reached your daily limit of 3 plays. Current plays today: ${playCount}/3. Try again tomorrow!`, 'warning');
      return;
    }

    setLoading(true);
    setImage(null);
    setDescription('');
    setGeneratedDescription('');
    setSimilarity(null);
    setPromptSimilarity(null);
    setAiDetectionResult('');
    setShowAiAlert(false);
    setQualityAnalysis('');
    setFinalScore(null);
    setError('');

    try {
      // ...existing code for game logic...
      const genRes = await fetch('/api/geminigenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const genData = await safeFetchJson(genRes, "Gemini image generation");
      if (!genRes.ok) throw new Error(genData.error || 'Gemini image generation failed.');

      setImage(genData.imageBase64);
      setDescription(genData.text);

      const describeRes = await fetch('/api/geminidescribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageURL }),
      });
      const describeData = await safeFetchJson(describeRes, "Gemini description");
      if (!describeRes.ok) throw new Error(describeData.error || 'Failed to describe Unsplash image.');

      setGeneratedDescription(describeData.description);
      await new Promise(resolve => setTimeout(resolve, 5000)); 

      const aiDetectRes = await fetch('/api/aidetector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: genData.imageBase64 }),
      });
      const aiDetectData = await safeFetchJson(aiDetectRes, "AI detection");
      if (!aiDetectRes.ok) throw new Error(aiDetectData.error || 'AI detection failed.');

      setAiDetectionResult(aiDetectData.result);
      if (aiDetectData.result.toLowerCase().includes("artificially generated")) {
        setShowAiAlert(true);
        setLoading(false);
        return;
      }

      const analyzeRes = await fetch('/api/geminianalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: `data:image/png;base64,${genData.imageBase64}` }),
      });
      const analyzeData = await safeFetchJson(analyzeRes, "Gemini analysis");
      if (!analyzeRes.ok) throw new Error(analyzeData.error || 'Image quality analysis failed.');

      setQualityAnalysis(analyzeData.analysis);

      const simRes = await fetch('/api/minilm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text1: describeData.description,
          text2: genData.text,
        }),
      });
      const simData = await safeFetchJson(simRes, "Similarity check");
      if (!simRes.ok) throw new Error(simData.error || 'Similarity comparison failed.');

      setSimilarity(simData.score);

      const promptCompareRes = await fetch('/api/minilm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text1: prompt,
          text2: describeData.description,
        }),
      });
      const promptCompareData = await safeFetchJson(promptCompareRes, "Prompt-Unsplash similarity");
      if (!promptCompareRes.ok) throw new Error(promptCompareData.error || 'Prompt-Unsplash similarity comparison failed.');

      setPromptSimilarity(promptCompareData.score);

      if (
        typeof simData.score === 'number' &&
        typeof promptCompareData.score === 'number'
      ) {
        const average = ((simData.score * 100) + (promptCompareData.score * 100)) / 2;
        setFinalScore(average);
        // Ask user if they want to provide credentials after getting final score
        setAskForCredentials(true);
      }
      // Record the play attempt
      await recordPlay(userIdentifier);
      setPlayCount(prev => prev + 1);
      setCanPlay(playCount + 1 < 3);


    } catch (err) {
      console.error(err);
      setError(err.message || 'Unexpected error.');
    }

    setLoading(false);
  };

  const handleCredentialsChoice = (wantsToProvide) => {
    setWantToProvideCredentials(wantsToProvide);
    setAskForCredentials(false);
    
    if (wantsToProvide) {
      setShowUsernameInput(true);
    } else {
      // Save anonymously
      saveScoreAnonymously();
    }
  };

  const saveScoreAnonymously = async () => {
    try {
      const anonymousUsername = generateAnonymousUsername();
      const gameData = {
        accuracy: similarity ? (similarity * 100) : 0,
        imageSimilarity: similarity ? (similarity * 100) : 0,
        promptGrade: promptSimilarity ? (promptSimilarity * 100) : 0,
        prompt: prompt,
        aiDetectionResult: aiDetectionResult,
        qualityAnalysis: qualityAnalysis
      };

      await addScore(anonymousUsername, finalScore || 0, gameData, null);
      
      await saveGameSession({
        username: anonymousUsername,
        email: null,
        prompt: prompt,
        finalScore: finalScore || 0,
        identifier: userIdentifier,
        ...gameData
      });

      showCustomPopup(`Score saved anonymously as ${anonymousUsername}! 🎉`, 'success');
    } catch (error) {
      console.error('Error saving anonymous score:', error);
      showCustomPopup('Failed to save score. Please try again.', 'error');
    }
  };

  const saveScoreToFirebase = async () => {
    if (!username.trim()) {
      showCustomPopup('Please enter a username', 'warning');
      return;
    }

    try {
      // Create or update user profile (no email required)
      await createOrUpdateUser(username, null);

      const gameData = {
        accuracy: similarity ? (similarity * 100) : 0,
        imageSimilarity: similarity ? (similarity * 100) : 0,
        promptGrade: promptSimilarity ? (promptSimilarity * 100) : 0,
        prompt: prompt,
        aiDetectionResult: aiDetectionResult,
        qualityAnalysis: qualityAnalysis
      };

      await addScore(username, finalScore || 0, gameData, null);
      
      await saveGameSession({
        username: username,
        email: null,
        prompt: prompt,
        finalScore: finalScore || 0,
        identifier: userIdentifier,
        ...gameData
      });

      showCustomPopup('Score saved to leaderboard! 🏆', 'success');
      setShowUsernameInput(false);
      setUsername('');
    } catch (error) {
      console.error('Error saving score:', error);
      showCustomPopup('Failed to save score. Please try again.', 'error');
    }
  };

  return (
    <div className="page">
      <main className="main">
        <div className="generator">
          {/* Play limit indicator */}
          <div style={{ 
            padding: '15px', 
            marginBottom: '20px', 
            backgroundColor: canPlay ? '#e8f5e8' : '#ffe8e8', 
            borderRadius: '8px',
            textAlign: 'center',
            border: canPlay ? '2px solid #4CAF50' : '2px solid #f44336'
          }}>
            <p style={{ 
              margin: '0', 
              fontSize: '18px', 
              fontWeight: 'bold',
              color: canPlay ? '#2e7d32' : '#d32f2f'
            }}>
              Daily Plays: {playCount}/3
            </p>
            {!canPlay && (
              <p style={{ 
                color: '#d32f2f', 
                margin: '5px 0 0 0', 
                fontSize: '14px' 
              }}>
                🚫 You've reached your daily limit. Come back tomorrow for more plays!
              </p>
            )}
            {canPlay && playCount > 0 && (
              <p style={{ 
                color: '#2e7d32', 
                margin: '5px 0 0 0', 
                fontSize: '14px' 
              }}>
                ✅ {3 - playCount} plays remaining today
              </p>
            )}
          </div>

          {!isClient ? (
            <p>Loading...</p>
          ) : UnSLoading ? (
            <p>Loading image...</p>
          ) : imageURL ? (
            <div className="targetImageContainer">
              <img src={imageURL} alt="Unsplash Image" />
              {imageAttribution && (
                <div className="unsplashAttribution">
                  <p>
                    Photo by{' '}
                    <a 
                      href={imageAttribution.photographerProfile}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {imageAttribution.photographer}
                    </a>{' '}
                    on{' '}
                    <a 
                      href={imageAttribution.unsplashUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Unsplash
                    </a>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p>Could not load image.</p>
          )}

          <div className="imageGenerate">
            <input
              type="text"
              placeholder="Enter your prompt here"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input"
              data-gramm="false"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || UnSLoading || !canPlay}
              className="button"
              style={{ 
                opacity: (!canPlay || loading || !prompt.trim() || UnSLoading) ? 0.6 : 1,
                backgroundColor: !canPlay ? '#f44336' : (loading || !prompt.trim() || UnSLoading) ? '#ccc' : '#4CAF50',
                cursor: (!canPlay || loading || !prompt.trim() || UnSLoading) ? 'not-allowed' : 'pointer'
              }}
              title={!canPlay ? 'Daily limit reached (3/3 plays used)' : 'Generate Image'}
            >
              {!canPlay ? '🚫 Daily Limit Reached' : loading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>

          {showAiAlert && (
            <div className="alert">
              <p>The generated image looks too unrealistic, please improve your prompt.</p>
              <button onClick={() => setShowAiAlert(false)} className="close-alert">
                Close
              </button>
            </div>
          )}

          {loading && <p>Generating image...</p>}
          {image && !showAiAlert && (
            <div className="imagePreview">
              <img src={`data:image/png;base64,${image}`} alt="Generated" />
              {aiDetectionResult && (
                <p>AI Detection Result: {aiDetectionResult}</p>
              )}
              {qualityAnalysis && (
                <p>Gemini Analysis: {qualityAnalysis}</p>
              )}
              {similarity !== null && (
                <p>Image Similarity: {(similarity * 100).toFixed(2)}%</p>
              )}
              {promptSimilarity !== null && (
                <p>Prompt Grade: {(promptSimilarity * 100).toFixed(2)}%</p>
              )}
              {finalScore !== null && (
                <div>
                  <p><strong>Final Score:</strong> {finalScore.toFixed(2)}%</p>
                  
                  {/* Ask for credentials choice */}
                  {askForCredentials && (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '15px', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '8px' 
                    }}>
                      <p><strong>Save your score to the leaderboard?</strong></p>
                      <p>Would you like to provide your username to track your scores?</p>
                      <div style={{ marginTop: '10px' }}>
                        <button 
                          onClick={() => handleCredentialsChoice(true)}
                          className="button"
                          style={{ backgroundColor: '#4CAF50', marginRight: '10px' }}
                        >
                          Yes, with my username
                        </button>
                        <button 
                          onClick={() => handleCredentialsChoice(false)}
                          className="button"
                          style={{ backgroundColor: '#2196F3' }}
                        >
                          Save anonymously
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Username input form */}
                  {showUsernameInput && (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '15px', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '8px' 
                    }}>
                      <p><strong>Enter your username:</strong></p>
                      <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input"
                        style={{ marginBottom: '10px' }}
                      />
                      <div>
                        <button 
                          onClick={saveScoreToFirebase}
                          className="button"
                          style={{ backgroundColor: '#4CAF50', marginRight: '10px' }}
                        >
                          Save Score
                        </button>
                        <button 
                          onClick={() => {
                            setShowUsernameInput(false);
                            setUsername('');
                          }}
                          className="button"
                          style={{ backgroundColor: '#f44336' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && <p className="error">{error}</p>}

          {/* Custom Popup */}
          {showPopup && (
            <div className="popup-overlay" onClick={() => setShowPopup(false)}>
              <div className={`popup-content popup-${popupType}`} onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <h3>{popupType === 'success' ? '✅ Success!' : popupType === 'error' ? '❌ Error' : '⚠️ Warning'}</h3>
                  <button className="popup-close" onClick={() => setShowPopup(false)}>×</button>
                </div>
                <div className="popup-body">
                  <p>{popupMessage}</p>
                </div>
                <div className="popup-footer">
                  <button className="popup-btn" onClick={() => setShowPopup(false)}>OK</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}