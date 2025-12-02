"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="logo">
          <span className="logo-icon">📄</span>
          PDF Font Analyzer
        </div>
        <div className="nav-links">
          <Link
            href="/"
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          >
            Analyze PDF
          </Link>
          <Link
            href="/database"
            className={`nav-link ${pathname === '/database' ? 'active' : ''}`}
          >
            Font Database
          </Link>
          <Link
            href="/pending"
            className={`nav-link ${pathname === '/pending' ? 'active' : ''}`}
          >
            Pending Fonts
          </Link>
        </div>
      </div>

      <style jsx>{`
        .navigation {
          background: white;
          border-bottom: 1px solid #eaeaea;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 1.25rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(45deg, #0070f3, #00a170);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logo-icon {
          font-size: 1.5rem;
        }
        .nav-links {
          display: flex;
          gap: 1rem;
        }
        .nav-link {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          color: #666;
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-link:hover {
          background: #f7fafc;
          color: #0070f3;
        }
        .nav-link.active {
          background: #e6f7ff;
          color: #0070f3;
        }
      `}</style>
    </nav>
  );
}
