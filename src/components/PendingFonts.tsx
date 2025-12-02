"use client";

import React, { useState, useEffect } from 'react';

interface PendingFont {
  name: string;
  created_at: string;
}

export default function PendingFonts() {
  const [fonts, setFonts] = useState<PendingFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const fetchPendingFonts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pending-fonts');
      if (res.ok) {
        const data = await res.json();
        setFonts(data.fonts || []);
        setCanEdit(data.canEdit || false);
      }
    } catch (e) {
      console.error('Failed to fetch pending fonts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingFonts();
  }, []);

  const handleSetStatus = async (fontName: string, status: string) => {
    try {
      const res = await fetch('/api/font-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fontName, status })
      });

      if (res.ok) {
        fetchPendingFonts();
      } else {
        alert('Failed to update status');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    }
  };

  const handleDelete = async (fontName: string) => {
    if (!confirm(`Remove "${fontName}" from pending list?`)) return;

    try {
      const res = await fetch('/api/pending-fonts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fontName })
      });

      if (res.ok) {
        fetchPendingFonts();
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting');
    }
  };

  const handleClearAll = async () => {
    if (!confirm(`Clear all ${fonts.length} pending fonts?`)) return;

    try {
      const res = await fetch('/api/pending-fonts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true })
      });

      if (res.ok) {
        fetchPendingFonts();
      } else {
        alert('Failed to clear all');
      }
    } catch (e) {
      console.error(e);
      alert('Error clearing all');
    }
  };

  return (
    <div className="pending-container">
      <div className="header">
        <h1>Pending Fonts</h1>
        <p>Fonts awaiting license verification</p>
        {canEdit && fonts.length > 0 && (
          <button onClick={handleClearAll} className="clear-all-btn">
            Clear All ({fonts.length})
          </button>
        )}
      </div>

      {!canEdit && (
        <div className="info-banner">
          <p>⚠️ You need to access from authorized IP (121.162.54.16 or localhost) to judge fonts.</p>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : fonts.length === 0 ? (
        <div className="empty-state">
          <p>No pending fonts.</p>
          <p className="hint">Upload PDFs to discover new fonts that need verification.</p>
        </div>
      ) : (
        <div className="fonts-grid">
          {fonts.map((font, index) => (
            <div key={index} className="font-card">
              <div className="font-header">
                <h3>{font.name}</h3>
                <span className="pending-badge">Pending</span>
              </div>
              <div className="font-details">
                <p className="date">Added: {new Date(font.created_at).toLocaleString('ko-KR')}</p>
              </div>

              {canEdit && (
                <div className="actions">
                  <button
                    onClick={() => handleSetStatus(font.name, 'Free')}
                    className="btn btn-free"
                  >
                    Mark as Free
                  </button>
                  <button
                    onClick={() => handleSetStatus(font.name, 'Commercial')}
                    className="btn btn-commercial"
                  >
                    Mark as Commercial
                  </button>
                  <button
                    onClick={() => handleDelete(font.name)}
                    className="btn btn-delete"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="search-action">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(font.name + ' font 의 PDF 임베딩 허용 여부')}&udm=50`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="search-link"
                >
                  Search License →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .pending-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #0070f3, #00a170);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header p {
          color: #666;
        }
        .clear-all-btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #e53e3e;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .clear-all-btn:hover {
          background: #c53030;
        }
        .info-banner {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
          text-align: center;
        }
        .info-banner p {
          margin: 0;
          color: #856404;
        }
        .loading {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
        .empty-state .hint {
          font-size: 0.9rem;
          color: #999;
          margin-top: 0.5rem;
        }
        .fonts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .font-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 1px solid #eaeaea;
          transition: transform 0.2s;
        }
        .font-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 12px rgba(0,0,0,0.1);
        }
        .font-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          word-break: break-word;
          margin-right: 0.5rem;
        }
        .pending-badge {
          background: #fff3cd;
          color: #856404;
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .font-details {
          margin-bottom: 1rem;
        }
        .date {
          font-size: 0.85rem;
          color: #718096;
          margin: 0;
        }
        .actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }
        .btn-free {
          background: #e6fffa;
          color: #00a170;
        }
        .btn-free:hover {
          background: #b2f5ea;
        }
        .btn-commercial {
          background: #fff5f5;
          color: #e53e3e;
        }
        .btn-commercial:hover {
          background: #fed7d7;
        }
        .btn-delete {
          background: #edf2f7;
          color: #718096;
        }
        .btn-delete:hover {
          background: #e2e8f0;
        }
        .search-action {
          margin-top: 1rem;
        }
        .search-link {
          color: #0070f3;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .search-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
