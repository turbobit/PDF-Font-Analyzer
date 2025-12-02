"use client";

import React, { useState, useCallback } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                onFileSelect(file);
            } else {
                alert('Please upload a PDF file.');
            }
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    }, [onFileSelect]);

    return (
        <div
            className={`file-upload-container ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                id="file-input"
                className="hidden-input"
            />
            <label htmlFor="file-input" className="upload-label">
                <div className="icon">📄</div>
                <p>Drag & Drop your PDF here</p>
                <p className="sub-text">or click to browse</p>
            </label>

            <style jsx>{`
        .file-upload-container {
          border: 2px dashed #ccc;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          margin-bottom: 2rem;
        }
        .file-upload-container:hover, .file-upload-container.dragging {
          border-color: #0070f3;
          background: rgba(0, 112, 243, 0.05);
        }
        .hidden-input {
          display: none;
        }
        .upload-label {
          cursor: pointer;
          display: block;
        }
        .icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .sub-text {
          font-size: 0.875rem;
          color: #666;
          margin-top: 8px;
        }
      `}</style>
        </div>
    );
}
