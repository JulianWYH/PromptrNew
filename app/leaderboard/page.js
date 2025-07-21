'use client';

import { useState, useEffect } from 'react';
import { getTopPromtrScores } from '../lib/firebaseService';

export default function Leaderboard() {
    const [showDetailedView, setShowDetailedView] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load leaderboard data from Firebase
    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                setLoading(true);
                const scores = await getTopPromtrScores(100);
                
                // Transform Firebase data to match the expected format
                const formattedData = scores.map((score, index) => ({
                    rank: index + 1,
                    username: score.username || `Player${index + 1}`,
                    accuracy: typeof score.accuracy === 'number' ? `${score.accuracy.toFixed(1)}%` : score.accuracy || '0.0%',
                    imageSimilarity: typeof score.imageSimilarity === 'number' ? `${score.imageSimilarity.toFixed(1)}%` : score.imageSimilarity || '0.0%',
                    promptGrade: typeof score.promptGrade === 'number' ? `${score.promptGrade.toFixed(1)}%` : score.promptGrade || '0.0%',
                    finalScore: typeof score.finalScore === 'number' ? `${score.finalScore.toFixed(1)}%` : score.finalScore || '0.0%'
                }));
                
                setLeaderboardData(formattedData);
            } catch (err) {
                console.error('Error loading leaderboard:', err);
                setError('Failed to load leaderboard data');
                // Fallback to sample data if Firebase fails
                setLeaderboardData(generateSampleData());
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, []);

    // Generate sample leaderboard data as fallback
    const generateSampleData = () => {
        const usernames = [
            "Gideon", "DeepfakeHunter", "TruthSeeker", "FakeSpotter", "RealityCheck",
            "ImageAnalyst", "PixelPro", "AuthenticAce", "VisionMaster", "MediaGuard",
            "DigitalSleuth", "FraudFinder", "PhotoProof", "TechTracker", "CyberSentry",
            "DataDetective", "PixelPatrol", "TruthTeller", "ImageInspector", "FakeFilter",
            "AlgoAce", "ByteBuster", "CodeCracker", "DataDiver", "EliteExpert",
            "FaceChecker", "GuardianGamer", "HackerHunter", "InfoInvestigator", "JudgeJury",
            "KnowledgeKeeper", "LogicLord", "MindReader", "NetNinja", "OracleOne",
            "PatternPro", "QualityQuest", "RealityRanger", "SecurityScout", "TechTitan",
            "UltimateUser", "ValidatorVibe", "WiseWatcher", "XpertXray", "YouthYeoman",
            "ZenithZone", "AceAnalyst", "BrightBrain", "CleverCop", "DynamicDetector",
            "EagleEye", "FastFinder", "GeniusGuard", "HeroHunter", "IntuitiveIntel",
            "JusticeJockey", "KeenKnight", "LoyalLookout", "MasterMind", "NobleNinja",
            "OptimalOracle", "PerfectProbe", "QuickQuest", "RapidRanger", "SwiftScout",
            "TacticalTracker", "UberUser", "VictoryViewer", "WinningWatcher", "XcellentXpert",
            "YieldingYoda", "ZestfulZealot", "AlphaAgent", "BetaBuster", "GammaGuard",
            "DeltaDetective", "EpsilonExpert", "ZetaZoom", "EtaElite", "ThetaTracker",
            "IotaIntel", "KappaKeeper", "LambdaLord", "MuMaster", "NuNinja",
            "XiXpert", "OmicronOracle", "PiPatrol", "RhoRanger", "SigmaScout",
            "TauTitan", "UpsilonUser", "PhiPhantom", "ChiChecker", "PsiProbe",
            "OmegaOne", "AlphaAce", "BetaBrain", "GammaGenius", "DeltaDynamo",
            "EpsilonElite", "ZetaZenith", "EtaExpert", "ThetaThriller", "IotaIdeal"
        ];

        const data = [];
        for (let i = 1; i <= 100; i++) {
            // Generate floating-point accuracy between 99.9 and 60.0
            const accuracy = Math.max(60, (99.9 - (i - 1) * 0.4)).toFixed(1);
            
            // Generate image similarity score (slightly different from accuracy)
            const imageSimilarity = Math.max(55, (98.5 - (i - 1) * 0.38)).toFixed(1);
            
            // Generate prompt grade (another variation)
            const promptGrade = Math.max(65, (99.2 - (i - 1) * 0.35)).toFixed(1);
            
            // Calculate final score as average of all three
            const finalScore = ((parseFloat(accuracy) + parseFloat(imageSimilarity) + parseFloat(promptGrade)) / 3).toFixed(1);
            
            data.push({
                rank: i,
                username: usernames[i - 1] || `Player${i}`,
                accuracy: `${accuracy}%`,
                imageSimilarity: `${imageSimilarity}%`,
                promptGrade: `${promptGrade}%`,
                finalScore: `${finalScore}%`
            });
        }
        return data;
    };

    if (loading) {
        return (
            <div className="page">
                <div className="leaderboard-container">
                    <div className="leaderboard-header">
                        <h1 style={{color: 'white'}}>Promptr Leaderboard</h1>
                        <p style={{color: 'white'}}>Loading leaderboard data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="leaderboard-container">
                    <div className="leaderboard-header">
                        <h1 style={{color: 'white'}}>Promptr Leaderboard</h1>
                        <p style={{color: '#ff6b6b'}}>{error}</p>
                        <button 
                            className="toggle-view-btn"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <h1 style={{color: 'white'}}>Promptr Leaderboard</h1>
                    <p style={{color: 'white'}}>Top players in promptr gamemode - ranked by deepfake detection accuracy</p>
                    <button 
                        className="toggle-view-btn"
                        onClick={() => setShowDetailedView(!showDetailedView)}
                    >
                        {showDetailedView ? 'Simple View' : 'Detailed View'}
                    </button>
                </div>

                <div className="leaderboard-table">
                    <div className={`table-header ${showDetailedView ? 'detailed' : 'simple'}`}>
                        <div className="rank-col">Rank</div>
                        <div className="username-col">Player</div>
                        {showDetailedView ? (
                            <>
                                <div className="accuracy-col">Accuracy</div>
                                <div className="similarity-col">Similarity</div>
                                <div className="prompt-col">Prompt</div>
                                <div className="final-col">Final Score</div>
                            </>
                        ) : (
                            <div className="final-col">Final Score</div>
                        )}
                    </div>

                    {leaderboardData.map((player, index) => (
                        <div
                            key={player.rank}
                            className={`table-row ${showDetailedView ? 'detailed' : 'simple'} ${index < 3 ? 'top-three' : ''} ${index === 0 ? 'first-place' : ''}`}
                        >
                            <div className="rank-col">
                                <span className="rank-number">{player.rank}</span>
                                {index === 0 && <span className="crown">👑</span>}
                                {index === 1 && <span className="medal">🥈</span>}
                                {index === 2 && <span className="medal">🥉</span>}
                            </div>
                            <div className="username-col">{player.username}</div>
                            {showDetailedView ? (
                                <>
                                    <div className="accuracy-col">{player.accuracy}</div>
                                    <div className="similarity-col">{player.imageSimilarity}</div>
                                    <div className="prompt-col">{player.promptGrade}</div>
                                    <div className="final-col">{player.finalScore}</div>
                                </>
                            ) : (
                                <div className="final-col">{player.finalScore}</div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="leaderboard-footer">
                    <p style={{color: 'white'}}>Rankings updated every hour • Play more games to climb the leaderboard!</p>
                </div>
            </div>
        </div>
    );
}

