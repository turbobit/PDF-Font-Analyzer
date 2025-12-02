"use client";

import React, { useState, useEffect } from 'react';

interface FontRecord {
  name: string;
  status: string;
  updated_at: string;
}

export default function FontDatabase() {
  const [fonts, setFonts] = useState<FontRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'name' | 'status' | 'updated_at'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchFonts = async (searchTerm: string = '') => {
    setLoading(true);
    try {
      const url = searchTerm
        ? `/api/font-list?search=${encodeURIComponent(searchTerm)}`
        : '/api/font-list';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFonts(data.fonts || []);
      }
    } catch (e) {
      console.error('Failed to fetch fonts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFonts(search);
  };

  const handleSort = (field: 'name' | 'status' | 'updated_at') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedFonts = () => {
    return [...fonts].sort((a, b) => {
      let compareA: any = a[sortField];
      let compareB: any = b[sortField];

      if (typeof compareA === 'string') compareA = compareA.toLowerCase();
      if (typeof compareB === 'string') compareB = compareB.toLowerCase();

      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'Free') return '#00a170';
    if (status === 'Commercial') return '#e53e3e';
    return '#718096';
  };

  const sortedFonts = getSortedFonts();

  return (
    <div className="database-container">
      <div className="header">
        <h1>Font License Database</h1>
        <p>User-verified font license information</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search font name..."
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
        <button
          type="button"
          onClick={() => { setSearch(''); fetchFonts(''); }}
          className="clear-button"
        >
          Clear
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : fonts.length === 0 ? (
        <div className="empty-state">
          <p>No font records found.</p>
          <p className="hint">Upload a PDF and set font statuses to build your database.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="font-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Font Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('updated_at')} className="sortable">
                  Last Updated {sortField === 'updated_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedFonts.map((font, index) => (
                <tr key={index}>
                  <td className="font-name">{font.name}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: `${getStatusColor(font.status)}15`,
                        color: getStatusColor(font.status)
                      }}
                    >
                      {font.status}
                    </span>
                  </td>
                  <td className="date">
                    {new Date(font.updated_at).toLocaleString('ko-KR')}
                  </td>
                  <td>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(font.name + ' font 의 PDF 임베딩 허용 여부')}&udm=50`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="search-link"
                    >
                      Search License →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .database-container {
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
        .search-form {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .search-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }
        .search-input:focus {
          outline: none;
          border-color: #0070f3;
        }
        .search-button, .clear-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .search-button {
          background: #0070f3;
          color: white;
        }
        .search-button:hover {
          background: #0051cc;
        }
        .clear-button {
          background: #eee;
          color: #333;
        }
        .clear-button:hover {
          background: #ddd;
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
        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .font-table {
          width: 100%;
          border-collapse: collapse;
        }
        .font-table thead {
          background: #f7fafc;
        }
        .font-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #4a5568;
          border-bottom: 2px solid #e2e8f0;
        }
        .font-table th.sortable {
          cursor: pointer;
          user-select: none;
          transition: background 0.2s;
        }
        .font-table th.sortable:hover {
          background: #edf2f7;
        }
        .font-table td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .font-table tbody tr:hover {
          background: #f7fafc;
        }
        .font-name {
          font-weight: 500;
          color: #2d3748;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .date {
          color: #718096;
          font-size: 0.9rem;
        }
        .search-link {
          color: #0070f3;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
        }
        .search-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
