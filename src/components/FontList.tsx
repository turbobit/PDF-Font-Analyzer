"use client";

import React, { useEffect, useState } from 'react';
import { FontData } from '@/utils/pdf-analyzer';

interface FontListProps {
  fonts: FontData[];
}

interface FontStatusInfo {
  status: string;
  canEdit: boolean;
  source: 'db' | 'static';
}

export default function FontList({ fonts }: FontListProps) {
  const [fontStatuses, setFontStatuses] = useState<Record<string, FontStatusInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      setLoading(true);
      const newStatuses: Record<string, FontStatusInfo> = {};

      for (const font of fonts) {
        try {
          const res = await fetch(`/api/font-status?name=${encodeURIComponent(font.name)}`);
          if (res.ok) {
            const data = await res.json();
            newStatuses[font.name] = {
              status: data.status,
              canEdit: data.canEdit,
              source: data.source
            };

            // If status is Unknown and source is static, add to pending
            if (data.status === 'Unknown' && data.source === 'static') {
              await fetch('/api/add-pending-font', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fontName: font.name })
              });
            }
          }
        } catch (e) {
          console.error(`Failed to fetch status for ${font.name}`, e);
        }
      }

      setFontStatuses(newStatuses);
      setLoading(false);
    };

    if (fonts.length > 0) {
      fetchStatuses();
    }
  }, [fonts]);

  const handleStatusChange = async (fontName: string, newStatus: string) => {
    try {
      const res = await fetch('/api/font-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fontName, status: newStatus })
      });

      if (res.ok) {
        setFontStatuses(prev => ({
          ...prev,
          [fontName]: {
            ...prev[fontName],
            status: newStatus,
            source: 'db'
          }
        }));
      } else {
        alert('Failed to update status');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    }
  };

  if (fonts.length === 0) {
    return null;
  }

  // Sort fonts: Commercial -> Unknown -> Free, then by name within each group
  const sortedFonts = [...fonts].sort((a, b) => {
    const statusA = fontStatuses[a.name]?.status || 'Loading...';
    const statusB = fontStatuses[b.name]?.status || 'Loading...';

    // Define priority: Commercial (1) > Unknown (2) > Free (3) > Loading (4)
    const getPriority = (status: string) => {
      if (status === 'Commercial') return 1;
      if (status === 'Unknown') return 2;
      if (status === 'Free') return 3;
      return 4; // Loading...
    };

    const priorityA = getPriority(statusA);
    const priorityB = getPriority(statusB);

    // First sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Then sort by name alphabetically
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="font-list-container">
      <h2>Found Fonts ({fonts.length})</h2>
      <div className="font-grid">
        {sortedFonts.map((font, index) => {
          const info = fontStatuses[font.name];
          const status = info?.status || 'Loading...';
          const isFree = status === 'Free';
          const isCommercial = status === 'Commercial';

          return (
            <div key={index} className="font-card">
              <div className="font-header">
                <h3>{font.name}</h3>
                <span className={`badge ${isFree ? 'free' : isCommercial ? 'commercial' : 'unknown'}`}>
                  {status}
                </span>
              </div>
              <div className="font-details">
                <p><strong>Type:</strong> {font.type}</p>
                <p><strong>Embedded:</strong> {font.embedded ? 'Yes' : 'No'}</p>
                {info?.source === 'db' && <p className="source-tag">Verified by User</p>}
              </div>

              {info?.canEdit && (
                <div className="admin-controls">
                  <label>Set Status:</label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(font.name, e.target.value)}
                    className="status-select"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Free">Free</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              )}

              <div className="font-actions">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(font.name + ' font 의 PDF 임베딩 허용 여부')}&udm=50`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="search-link"
                >
                  Search License &rarr;
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .font-list-container {
          margin-top: 2rem;
          width: 100%;
        }
        h2 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .font-grid {
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
        .badge {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .badge.free {
          background: #e6fffa;
          color: #00a170;
        }
        .badge.commercial {
          background: #fff5f5;
          color: #e53e3e;
        }
        .badge.unknown {
          background: #edf2f7;
          color: #718096;
        }
        .font-details p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: #555;
        }
        .source-tag {
            font-size: 0.75rem !important;
            color: #0070f3 !important;
            font-weight: 600;
        }
        .admin-controls {
            margin-top: 1rem;
            padding: 0.5rem;
            background: #f7fafc;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .admin-controls label {
            font-size: 0.8rem;
            font-weight: 600;
            color: #4a5568;
        }
        .status-select {
            font-size: 0.85rem;
            padding: 2px 4px;
            border: 1px solid #cbd5e0;
            border-radius: 4px;
        }
        .font-actions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
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
