"use client";

import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import FontList from '@/components/FontList';
import { analyzePdfFonts, FontData } from '@/utils/pdf-analyzer';

export default function Home() {
  const [fonts, setFonts] = useState<FontData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    setFonts([]);
    setLogs([]);

    try {
      const result = await analyzePdfFonts(file);
      setFonts(result.fonts);
      setLogs(result.logs);

      if (result.fonts.length === 0) {
        setError("No fonts found in this PDF. It might be an image-only PDF or the fonts are outlined.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze PDF. Please try another file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container">
      <div className="content-wrapper">
        <header>
          <h1>PDF Font Analyzer</h1>
          <p>Upload a PDF to see what fonts it uses and check their license status.</p>
        </header>

        <FileUpload onFileSelect={handleFileSelect} />

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing PDF...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <FontList fonts={fonts} />

        {logs.length > 0 && (
          <div className="logs-section">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="toggle-logs-btn"
            >
              {showLogs ? 'Hide Debug Logs' : 'Show Debug Logs'}
            </button>

            {showLogs && (
              <div className="logs-container">
                <h3>Debug Logs</h3>
                <pre>
                  {logs.join('\n')}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          justify-content: center;
          background: #f8f9fa;
        }
        .content-wrapper {
          width: 100%;
          max-width: 800px;
        }
        header {
          text-align: center;
          margin-bottom: 3rem;
        }
        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #0070f3, #00a170);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        header p {
          color: #666;
          font-size: 1.1rem;
        }
        .loading {
          text-align: center;
          margin: 2rem 0;
          color: #0070f3;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #0070f3;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .error-message {
          background: #fff5f5;
          color: #e53e3e;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          margin: 1rem 0;
          border: 1px solid #fed7d7;
        }
        .logs-section {
            margin-top: 3rem;
            border-top: 1px solid #eee;
            padding-top: 1rem;
        }
        .toggle-logs-btn {
            background: none;
            border: none;
            color: #666;
            text-decoration: underline;
            cursor: pointer;
            font-size: 0.9rem;
        }
        .logs-container {
            margin-top: 1rem;
            background: #1a1a1a;
            color: #00ff00;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
        }
        .logs-container pre {
            font-family: monospace;
            font-size: 0.85rem;
            white-space: pre-wrap;
        }
        .logs-container h3 {
            color: #fff;
            margin-top: 0;
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
      `}</style>
    </main>
  );
}
