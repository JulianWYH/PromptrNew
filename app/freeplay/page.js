"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiDetectionResult, setAiDetectionResult] = useState('');
  const [detectionClass, setDetectionClass] = useState('');
  const [qualityAnalysis, setQualityAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError("Only PNG, JPG, and JPEG images are supported.");
        setImageFile(null);
        setImagePreview(null);
        return;
      }

      setError('');
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setError("Please upload an image before analyzing.");
      return;
    }

    setLoading(true);
    setAiDetectionResult('');
    setQualityAnalysis('');
    setDetectionClass('');
    setError('');

    try {
      const base64Data = await fileToBase64(imageFile);

      const aiDetectRes = await fetch('/api/aidetector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data }),
      });

      const aiDetectData = await aiDetectRes.json();
      if (!aiDetectRes.ok) throw new Error(aiDetectData.error || 'AI detection failed.');

      const { result, category } = aiDetectData;
      setAiDetectionResult(result);
      setDetectionClass(category); // e.g., most-likely-ai

      const analyseRes = await fetch('/api/geminianalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: `data:image/png;base64,${base64Data}` }),
      });

      const analyseData = await analyseRes.json();
      if (!analyseRes.ok) throw new Error(analyseData.error || 'Image quality analysis failed.');

      setQualityAnalysis(analyseData.analysis);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unexpected error.');
    }

    setLoading(false);
  };

  return (
    <div className="page">
      <main className="main">
        <div className="generator">
          <div className="imageUpload">
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageUpload}
              className="input"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !imagePreview}
              className="button"
            >
              Analyse Image
            </button>
          </div>

          {loading && <p>Analysing image...</p>}

          {imagePreview && (
            <div className="previewContainer">
              <div className="imageBox">
                <img src={imagePreview} alt="Uploaded" />
              </div>
              <div className="analysisBox">
                {aiDetectionResult && (
                  <div className={`ai-result ${detectionClass}`}>
                    {aiDetectionResult}
                  </div>
                )}
                {qualityAnalysis && (
                  <p className="quality-analysis">
                    Gemini Analysis: {qualityAnalysis}
                  </p>
                )}
              </div>
            </div>
          )}

          {error && <p className="error">{error}</p>}
        </div>
      </main>
    </div>
  );
}